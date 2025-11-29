// Capital Allocation Agent

import { assessTradeRisk } from '@/lib/agents/riskAssessment';
import { Opportunity } from '@/lib/arbitrage/detector';
import { RiskAssessmentResult } from '@/lib/agents/riskAssessment';

export interface Portfolio {
  usdtBalance: number;
  maxTradeAmount: number;
  exposurePct?: number;
}

export interface AllocationResult {
  allocationPct: number;
  allocatedUSDT: number;
  reason: string;
}


export interface AllocationStrategy {
  opportunityId: string;
  allocatedCapital: number;
  percentage: number;
  priority: number;
  reasoning: string;
}

export interface PortfolioState {
  totalCapital: number;
  availableCapital: number;
  allocatedCapital: number;
  positions: {
    symbol: string;
    amount: number;
    value: number;
  }[];
}

export interface OpportunityScore {
  id: string;
  symbol?: string;
  expectedReturn: number; // Expected profit percentage
  risk: number; // Risk score 0-1
  sharpeRatio: number;
  timeHorizon: number; // in seconds
  spreadSize?: number; // Spread percentage
  estimatedValue?: number;
}

/**
 * Calculate priority score for an opportunity
 * Higher spread and lower risk = higher priority
 */
function calculatePriority(opp: OpportunityScore): number {
  // Sharpe ratio is already return/risk, but we'll enhance it
  // with spread size consideration
  
  const baseScore = opp.sharpeRatio;
  
  // Boost for larger spreads (more profit potential)
  const spreadBonus = (opp.spreadSize || 0) * 10;
  
  // Penalty for high risk
  const riskPenalty = opp.risk * 50;
  
  // Bonus for quick execution (faster = better)
  const timeBonus = opp.timeHorizon < 60 ? 20 : 
                    opp.timeHorizon < 300 ? 10 : 0;
  
  const priority = baseScore + spreadBonus - riskPenalty + timeBonus;
  
  return Math.max(0, priority);
}

/**
 * Allocate capital across multiple arbitrage opportunities
 * Uses risk-adjusted return optimization
 */
export async function allocateCapital(
  opportunities: OpportunityScore[],
  portfolio: PortfolioState
): Promise<AllocationStrategy[]> {
  try {
    if (opportunities.length === 0) {
      return [];
    }
    
    // Sort opportunities by priority
    const scoredOpportunities = opportunities.map(opp => ({
      ...opp,
      priority: calculatePriority(opp)
    })).sort((a, b) => b.priority - a.priority);
    
    const allocations: AllocationStrategy[] = [];
    let remainingCapital = portfolio.availableCapital;
    
    // Portfolio allocation limits
    const MAX_SINGLE_ALLOCATION_PCT = 0.20; // Max 20% per opportunity
    const MAX_TOTAL_ALLOCATION_PCT = 0.80;   // Max 80% of available capital
    const MIN_ALLOCATION = 100;              // Minimum $100 allocation
    
    const maxTotalAllocation = portfolio.availableCapital * MAX_TOTAL_ALLOCATION_PCT;
    let totalAllocated = 0;
    
    for (let i = 0; i < scoredOpportunities.length; i++) {
      const opp = scoredOpportunities[i];
      
      if (remainingCapital < MIN_ALLOCATION) {
        break; // Not enough capital left
      }
      
      if (totalAllocated >= maxTotalAllocation) {
        break; // Reached maximum total allocation
      }
      
      // Calculate base allocation using Kelly Criterion variant
      // f = (expected_return - risk) / expected_return
      // But capped and adjusted
      
      const kellyFraction = Math.max(0, Math.min(
        (opp.expectedReturn - opp.risk) / Math.max(opp.expectedReturn, 0.01),
        0.25 // Cap at 25%
      ));
      
      // Base allocation from Kelly
      let allocation = portfolio.availableCapital * kellyFraction;
      
      // Adjust by priority ranking
      const rankingMultiplier = 1 - (i * 0.1); // Decrease by 10% per rank
      allocation *= Math.max(rankingMultiplier, 0.3); // Floor at 30%
      
      // Adjust by spread size (bigger spread = more allocation)
      if (opp.spreadSize) {
        const spreadMultiplier = 1 + (opp.spreadSize / 10); // +10% per 1% spread
        allocation *= Math.min(spreadMultiplier, 2); // Cap at 2x
      }
      
      // Adjust by risk (lower risk = more allocation)
      const riskMultiplier = 1 - (opp.risk * 0.5); // Reduce up to 50% for high risk
      allocation *= Math.max(riskMultiplier, 0.2); // Floor at 20%
      
      // Apply single position limit
      const maxSingleAllocation = portfolio.availableCapital * MAX_SINGLE_ALLOCATION_PCT;
      allocation = Math.min(allocation, maxSingleAllocation);
      
      // Don't allocate more than remaining capital
      allocation = Math.min(allocation, remainingCapital);
      
      // Don't exceed total allocation limit
      const remainingTotal = maxTotalAllocation - totalAllocated;
      allocation = Math.min(allocation, remainingTotal);
      
      // Skip if below minimum
      if (allocation < MIN_ALLOCATION) {
        continue;
      }
      
      // Create allocation strategy
      const percentage = (allocation / portfolio.totalCapital) * 100;
      
      let reasoning = `Priority: ${opp.priority.toFixed(1)}. `;
      reasoning += `Expected return: ${(opp.expectedReturn * 100).toFixed(2)}%, `;
      reasoning += `Risk: ${(opp.risk * 100).toFixed(1)}%, `;
      reasoning += `Sharpe: ${opp.sharpeRatio.toFixed(2)}`;
      
      if (opp.spreadSize) {
        reasoning += `, Spread: ${opp.spreadSize.toFixed(2)}%`;
      }
      
      allocations.push({
        opportunityId: opp.id,
        allocatedCapital: allocation,
        percentage,
        priority: opp.priority,
        reasoning
      });
      
      remainingCapital -= allocation;
      totalAllocated += allocation;
    }
    
    return allocations;
  } catch (error) {
    console.error('Error allocating capital:', error);
    return [];
  }
}

/**
 * Rebalance portfolio based on current positions and new opportunities
 */
export async function rebalancePortfolio(
  portfolio: PortfolioState,
  newOpportunities: OpportunityScore[]
): Promise<AllocationStrategy[]> {
  try {
    // Calculate how much capital we can free up
    const currentPositionsValue = portfolio.positions.reduce(
      (sum, pos) => sum + pos.value, 
      0
    );
    
    // Determine if we should close any positions to reallocate
    // For arbitrage, positions should be short-lived, so we assume we can free up capital
    
    // Create adjusted portfolio state with freed capital
    const adjustedPortfolio: PortfolioState = {
      ...portfolio,
      availableCapital: portfolio.availableCapital + (currentPositionsValue * 0.3) // Assume 30% can be freed
    };
    
    // Reallocate using the standard allocation function
    return allocateCapital(newOpportunities, adjustedPortfolio);
  } catch (error) {
    console.error('Error rebalancing portfolio:', error);
    return [];
  }
}

/**
 * Calculate optimal allocation for a single opportunity
 */
export async function allocateForSingleOpportunity(
  opportunity: OpportunityScore,
  portfolio: PortfolioState,
  riskTolerance: number = 0.5 // 0-1
): Promise<number> {
  try {
    // Use the main allocation function but for just one opportunity
    const allocations = await allocateCapital([opportunity], portfolio);
    
    if (allocations.length === 0) {
      return 0;
    }
    
    // Apply risk tolerance adjustment
    const baseAllocation = allocations[0].allocatedCapital;
    const adjustedAllocation = baseAllocation * riskTolerance;
    
    return adjustedAllocation;
  } catch (error) {
    console.error('Error calculating single allocation:', error);
    return 0;
  }
}

/**
 * Diversification check - ensure we're not over-concentrated
 */
export function checkDiversification(
  allocations: AllocationStrategy[],
  portfolio: PortfolioState
): {
  isDiversified: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check single position concentration
  for (const allocation of allocations) {
    const concentration = (allocation.allocatedCapital / portfolio.totalCapital) * 100;
    if (concentration > 25) {
      warnings.push(
        `Opportunity ${allocation.opportunityId} represents ${concentration.toFixed(1)}% of portfolio (>25% limit)`
      );
    }
  }
  
  // Check total allocation
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedCapital, 0);
  const totalAllocationPct = (totalAllocated / portfolio.totalCapital) * 100;
  
  if (totalAllocationPct > 85) {
    warnings.push(
      `Total allocation is ${totalAllocationPct.toFixed(1)}% (>85% recommended limit)`
    );
  }
  
  // Check if too concentrated in few opportunities
  if (allocations.length < 3 && allocations.length > 0) {
    warnings.push(
      `Only ${allocations.length} opportunities allocated. Consider more diversification.`
    );
  }
  
  return {
    isDiversified: warnings.length === 0,
    warnings
  };
}

/**
 * Get allocation summary
 */
export function getAllocationSummary(
  allocations: AllocationStrategy[],
  portfolio: PortfolioState
): {
  totalAllocated: number;
  totalPercentage: number;
  opportunityCount: number;
  avgAllocation: number;
  largestAllocation: number;
  smallestAllocation: number;
} {
  if (allocations.length === 0) {
    return {
      totalAllocated: 0,
      totalPercentage: 0,
      opportunityCount: 0,
      avgAllocation: 0,
      largestAllocation: 0,
      smallestAllocation: 0
    };
  }
  
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedCapital, 0);
  const amounts = allocations.map(a => a.allocatedCapital);
  
  return {
    totalAllocated,
    totalPercentage: (totalAllocated / portfolio.totalCapital) * 100,
    opportunityCount: allocations.length,
    avgAllocation: totalAllocated / allocations.length,
    largestAllocation: Math.max(...amounts),
    smallestAllocation: Math.min(...amounts)
  };
}

/**
 * Allocate capital for a single opportunity based on risk score
 * Simple risk-based allocation policy
 */
export function allocateCapitalForOpportunity(
  opportunity: Opportunity,
  risk: RiskAssessmentResult,
  portfolio: Portfolio
): AllocationResult {
  try {
    const { riskScore } = risk;
    let allocationPct: number;
    let reason: string;

    // Determine allocation percentage based on risk score
    if (riskScore > 80) {
      allocationPct = 0.02; // 2%
      reason = `Very high risk (${riskScore.toFixed(0)}) - minimal allocation (2%)`;
    } else if (riskScore >= 60) {
      allocationPct = 0.05; // 5%
      reason = `High risk (${riskScore.toFixed(0)}) - conservative allocation (5%)`;
    } else if (riskScore >= 30) {
      allocationPct = 0.10; // 10%
      reason = `Medium risk (${riskScore.toFixed(0)}) - moderate allocation (10%)`;
    } else {
      allocationPct = 0.15; // 15%
      reason = `Low risk (${riskScore.toFixed(0)}) - aggressive allocation (15%)`;
    }

    // Calculate allocated amount
    const potentialAllocation = portfolio.usdtBalance * allocationPct;
    const allocatedUSDT = Math.min(potentialAllocation, portfolio.maxTradeAmount);

    // Add additional context to reason
    if (allocatedUSDT < potentialAllocation) {
      reason += `. Capped at max trade amount ($${allocatedUSDT.toFixed(2)})`;
    }

    // Add liquidity considerations
    if (risk.liquidityEstimate.fillableQty < 1) {
      reason += `. Warning: Limited liquidity (${risk.liquidityEstimate.fillableQty.toFixed(2)} fillable)`;
    }

    // Add volatility warning
    if (risk.volatilityPct > 1.0) {
      reason += `. High volatility (${risk.volatilityPct.toFixed(2)}%) detected`;
    }

    return {
      allocationPct,
      allocatedUSDT,
      reason
    };
  } catch (error) {
    console.error('Error in capital allocation:', error);
    return {
      allocationPct: 0,
      allocatedUSDT: 0,
      reason: 'Error allocating capital - defaulting to zero allocation for safety'
    };
  }
}

