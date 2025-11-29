// Autonomous Runner - Orchestrates all agents with Guardian safety layer

import { discoverPrices } from './priceDiscovery';
import { detectArbitrage } from '../arbitrage/detector';
import { assessRisk } from './riskAssessment';
import { allocateCapitalForOpportunity } from './capitalAllocation';
import { debateWithMedianConsensus } from './debateAgent';
import { executeArbitrageWithPartialFills } from './executionEngine';
import { getSettings } from '../state/settings';
import { getPortfolio } from '../state/portfolio';
import { addAuditLog, getAuditLog } from '../state/auditLog';
import { getState, updateState, type RunnerState, type GuardianConfig } from '../state/global';

interface GuardianResult {
  pass: boolean;
  reason?: string;
  warnings: string[];
}

let runnerInterval: NodeJS.Timeout | null = null;

/**
 * Guardian safety check
 */
function guardianCheck(
  opportunity: any,
  risk: any,
  allocation: any,
  guardianConfig?: GuardianConfig
): GuardianResult {
  const warnings: string[] = [];
  const portfolio = getPortfolio();
  const config = guardianConfig || getState().guardianSettings;
  
  // Check 1: Trade size vs portfolio
  const tradePct = allocation.allocatedUSDT / portfolio.totalValue;
  if (tradePct > config.maxTradePctOfPortfolio) {
    return {
      pass: false,
      reason: `Trade size ${(tradePct * 100).toFixed(1)}% exceeds limit ${(config.maxTradePctOfPortfolio * 100)}%`,
      warnings
    };
  }
  
  // Check 2: Daily trade count
  const today = new Date().toDateString();
  const todayLogs = getAuditLog().filter(log => 
    log.timestamp && new Date(log.timestamp).toDateString() === today &&
    log.action === 'execution_completed'
  );
  
  if (todayLogs.length >= config.dailyMaxTrades) {
    return {
      pass: false,
      reason: `Daily trade limit reached (${config.dailyMaxTrades})`,
      warnings
    };
  }
  
  // Check 3: Global exposure
  const currentExposure = (portfolio.totalValue - portfolio.cash) / portfolio.totalValue;
  if (currentExposure > config.globalMaxExposurePct) {
    warnings.push(`High exposure: ${(currentExposure * 100).toFixed(1)}%`);
  }
  
  // Check 4: High volatility veto
  if (config.vetoconditions.highVolatility && risk.volatilityPct > 2.0) {
    return {
      pass: false,
      reason: `High volatility ${risk.volatilityPct.toFixed(2)}% exceeds threshold`,
      warnings
    };
  }
  
  // Check 5: Risk score threshold
  if (risk.riskScore > 75) {
    return {
      pass: false,
      reason: `Risk score ${risk.riskScore} too high for autonomous execution`,
      warnings
    };
  }
  
  return { pass: true, warnings };
}

/**
 * Single poll iteration
 */
async function pollOnce(): Promise<void> {
  try {
    const state = getState();
    const runnerState = state.runner;
    
    runnerState.pollCount++;
    runnerState.lastPollTime = new Date().toISOString();
    updateState('runner', runnerState);
    
    console.log(`[Runner] Poll #${runnerState.pollCount} at ${runnerState.lastPollTime}`);
    
    // Step 1: Discover prices
    const prices = await discoverPrices(runnerState.currentSymbols);
    
    // Step 2: Detect arbitrage opportunities
    const opportunities = await detectArbitrage(prices, {
      minSpreadPct: 0.5,
      persistenceMs: 2000,
      minPersistenceCount: 2
    });
    
    console.log(`[Runner] Found ${opportunities.length} opportunities`);
    
    // Step 3: Process each opportunity
    for (const opp of opportunities) {
      const state = getState();
      state.runner.opportunitiesProcessed++;
      updateState('runner', state.runner);
      
      console.log(`[Runner] Processing opportunity: ${opp.symbol} (${opp.spreadPct.toFixed(2)}% spread)`);
      
      // 3a. Risk assessment
      const risk = await assessRisk(opp, 1);
      console.log(`[Runner] Risk score: ${risk.riskScore}/100`);
      
      // 3b. Capital allocation  
      const portfolio = getPortfolio();
      const allocation = allocateCapitalForOpportunity(opp, risk, {
        usdtBalance: portfolio.cash,
        maxTradeAmount: 5000
      });
      console.log(`[Runner] Allocation: $${allocation.allocatedUSDT}`);
      
      // 3c. Debate
      const debate = await debateWithMedianConsensus(opp, risk, allocation, 0.6);
      console.log(`[Runner] Debate score: ${debate.finalDecisionScore.toFixed(2)}, Decision: ${debate.decision}`);
      
      // 3d. Guardian check
      const guardianSettings = getState().guardianSettings;
      const guardian = guardianCheck(opp, risk, allocation, guardianSettings);
      console.log(`[Runner] Guardian: ${guardian.pass ? 'PASS' : 'VETO'} ${guardian.reason || ''}`);
      
      if (guardian.warnings.length > 0) {
        console.log(`[Runner] Guardian warnings: ${guardian.warnings.join(', ')}`);
      }
      
      // 3e. Execute if all checks pass
      if (guardian.pass && debate.decision === 'execute') {
        console.log(`[Runner] ✓ Executing trade for ${opp.symbol}`);
        
        const state = getState();
        state.runner.executionsAttempted++;
        updateState('runner', state.runner);
        
        addAuditLog({
          action: 'autonomous_execution_initiated',
          component: 'runner',
          details: {
            opportunity: opp.id,
            symbol: opp.symbol,
            riskScore: risk.riskScore,
            allocation: allocation.allocatedUSDT,
            debateScore: debate.finalDecisionScore
          },
          eventType: 'execution'
        });
        
        try {
          const result = await executeArbitrageWithPartialFills(opp, allocation.allocatedUSDT);
          
          if (result.success) {
            const state = getState();
            state.runner.executionsSuccessful++;
            updateState('runner', state.runner);
            console.log(`[Runner] ✓ Execution successful: ${result.netProfit.toFixed(2)} profit`);
          } else {
            console.log(`[Runner] ✗ Execution failed: ${result.error}`);
          }
        } catch (execError) {
          console.error(`[Runner] Execution error:`, execError);
        }
      } else {
        console.log(`[Runner] ✗ Skipping execution (Guardian: ${guardian.pass}, Debate: ${debate.decision})`);
      }
    }
    
  } catch (error) {
    console.error('[Runner] Poll error:', error);
    
    addAuditLog({
      action: 'runner_poll_error',
      component: 'runner',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      eventType: 'system'
    });
  }
}

/**
 * Start the autonomous runner
 */
export function startRunner(pollMs: number = 2000): boolean {
  const state = getState();
  const runnerState = state.runner;
  
  if (runnerState.isRunning) {
    console.log('[Runner] Already running');
    return false;
  }
  
  console.log(`[Runner] Starting with poll interval: ${pollMs}ms`);
  
  // Update runner state
  runnerState.isRunning = true;
  runnerState.startTime = new Date().toISOString();
  runnerState.pollCount = 0;
  runnerState.opportunitiesProcessed = 0;
  runnerState.executionsAttempted = 0;
  runnerState.executionsSuccessful = 0;
  
  updateState('runner', runnerState);
  
  addAuditLog({
    action: 'runner_started',
    component: 'runner',
    details: { pollMs, symbols: runnerState.currentSymbols },
    eventType: 'system'
  });
  
  // Start polling
  runnerInterval = setInterval(() => {
    pollOnce().catch(err => console.error('[Runner] Uncaught poll error:', err));
  }, pollMs);
  
  // Run first poll immediately
  pollOnce().catch(err => console.error('[Runner] Initial poll error:', err));
  
  return true;
}

/**
 * Stop the autonomous runner
 */
export function stopRunner(): boolean {
  const state = getState();
  const runnerState = state.runner;
  
  if (!runnerState.isRunning) {
    console.log('[Runner] Not running');
    return false;
  }
  
  console.log('[Runner] Stopping');
  
  if (runnerInterval) {
    clearInterval(runnerInterval);
    runnerInterval = null;
  }
  
  runnerState.isRunning = false;
  updateState('runner', runnerState);
  
  const runtime = runnerState.startTime ? Date.now() - new Date(runnerState.startTime).getTime() : 0;
  
  addAuditLog({
    action: 'runner_stopped',
    component: 'runner',
    details: {
      totalPolls: runnerState.pollCount,
      opportunitiesProcessed: runnerState.opportunitiesProcessed,
      executionsAttempted: runnerState.executionsAttempted,
      executionsSuccessful: runnerState.executionsSuccessful,
      runtime
    },
    eventType: 'system'
  });
  
  return true;
}

/**
 * Get runner status
 */
export function getRunnerStatus(): RunnerState {
  return { ...getState().runner };
}

/**
 * Update runner symbols
 */
export function setRunnerSymbols(symbols: string[]): void {
  const state = getState();
  state.runner.currentSymbols = symbols;
  updateState('runner', state.runner);
  console.log(`[Runner] Symbols updated:`, symbols);
}

/**
 * Update guardian configuration
 */
export function updateGuardianConfig(config: Partial<GuardianConfig>): void {
  const state = getState();
  const guardianSettings = { ...state.guardianSettings, ...config };
  updateState('guardianSettings', guardianSettings);
  console.log(`[Runner] Guardian config updated`);
}

export function getGuardianConfig(): GuardianConfig {
  return { ...getState().guardianSettings };
}
