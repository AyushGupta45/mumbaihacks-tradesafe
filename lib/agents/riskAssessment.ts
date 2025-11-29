// Risk Assessment Agent

import { calculateSpreads, getPriceHistory } from '@/lib/agents/priceDiscovery';
import { getBinancePrices } from '@/lib/exchanges/binance';
import { getIndianExchangePrices, getIndianOrderBook, getIndianLiquidityEstimate } from '@/lib/exchanges/indianMock';
import { getNSEPrices } from '@/lib/exchanges/nseMock';
import { Opportunity } from '@/lib/arbitrage/detector';

export interface RiskAssessmentResult {
  riskScore: number; // 0-100
  slippagePct: number;
  volatilityPct: number;
  liquidityEstimate: {
    fillableQty: number;
    expectedAvgPrice: number;
  };
  notes: string[];
}


export interface RiskFactor {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0-1
  description: string;
}

export interface RiskAssessment {
  overallRisk: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendation: 'proceed' | 'proceed_with_caution' | 'abort';
  reasoning: string;
  timestamp: Date;
}

export interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  exchanges: string[];
  estimatedValue: number;
  opportunitySpread?: number; // Current spread percentage
}

/**
 * Assess volatility risk by checking price stability over time
 */
async function assessVolatility(symbol: string): Promise<RiskFactor> {
  try {
    // Fetch prices multiple times to check volatility
    const priceChecks = [];
    
    for (let i = 0; i < 3; i++) {
      const spreads = await calculateSpreads([symbol]);
      if (spreads.length > 0) {
        priceChecks.push(spreads[0].avgPrice);
      }
      // Small delay between checks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (priceChecks.length < 2) {
      return {
        name: 'Volatility',
        severity: 'medium',
        impact: 0.5,
        description: 'Insufficient data to assess volatility'
      };
    }
    
    // Calculate coefficient of variation
    const mean = priceChecks.reduce((a, b) => a + b, 0) / priceChecks.length;
    const variance = priceChecks.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / priceChecks.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    
    // Risk scoring based on volatility
    let severity: RiskFactor['severity'] = 'low';
    let impact = coefficientOfVariation * 10; // Scale up for impact
    let description = '';
    
    if (coefficientOfVariation < 0.001) {
      // Very stable
      severity = 'low';
      impact = 0.1;
      description = `Price is very stable (CV: ${(coefficientOfVariation * 100).toFixed(3)}%)`;
    } else if (coefficientOfVariation < 0.005) {
      // Moderately stable
      severity = 'low';
      impact = 0.3;
      description = `Price is stable (CV: ${(coefficientOfVariation * 100).toFixed(3)}%)`;
    } else if (coefficientOfVariation < 0.01) {
      // Some volatility
      severity = 'medium';
      impact = 0.5;
      description = `Moderate volatility detected (CV: ${(coefficientOfVariation * 100).toFixed(3)}%)`;
    } else {
      // High volatility
      severity = 'high';
      impact = 0.8;
      description = `High volatility detected (CV: ${(coefficientOfVariation * 100).toFixed(3)}%). Prices may change rapidly.`;
    }
    
    return { name: 'Volatility', severity, impact: Math.min(impact, 1), description };
  } catch (error) {
    return {
      name: 'Volatility',
      severity: 'medium',
      impact: 0.5,
      description: 'Error assessing volatility'
    };
  }
}

/**
 * Assess liquidity risk based on trading volumes and order book depth
 */
async function assessLiquidity(symbol: string, quantity: number): Promise<RiskFactor> {
  try {
    // Fetch volume data from exchanges
    const [binancePrices, wazirxPrices, nsePrices] = await Promise.all([
      getBinancePrices([symbol]).catch(() => []),
      getIndianExchangePrices([symbol]).catch(() => []),
      getNSEPrices([symbol]).catch(() => [])
    ]);
    
    // NSE provides real volume data
    let totalVolume = 0;
    if (nsePrices.length > 0) {
      totalVolume = nsePrices[0].volume;
    } else {
      // Mock volume for crypto (in production, fetch from exchange)
      totalVolume = 1000000; // High liquidity for major pairs
    }
    
    // Calculate volume/quantity ratio
    const volumeRatio = totalVolume / quantity;
    
    let severity: RiskFactor['severity'] = 'low';
    let impact = 0;
    let description = '';
    
    if (volumeRatio > 1000) {
      // Excellent liquidity
      severity = 'low';
      impact = 0.1;
      description = `Excellent liquidity (volume ${volumeRatio.toFixed(0)}x order size)`;
    } else if (volumeRatio > 100) {
      // Good liquidity
      severity = 'low';
      impact = 0.2;
      description = `Good liquidity (volume ${volumeRatio.toFixed(0)}x order size)`;
    } else if (volumeRatio > 10) {
      // Moderate liquidity
      severity = 'medium';
      impact = 0.5;
      description = `Moderate liquidity (volume ${volumeRatio.toFixed(0)}x order size). May experience slippage.`;
    } else {
      // Poor liquidity
      severity = 'high';
      impact = 0.8;
      description = `Low liquidity (volume only ${volumeRatio.toFixed(1)}x order size). High slippage risk.`;
    }
    
    return { name: 'Liquidity', severity, impact, description };
  } catch (error) {
    return {
      name: 'Liquidity',
      severity: 'medium',
      impact: 0.5,
      description: 'Error assessing liquidity'
    };
  }
}

/**
 * Assess spread persistence - how stable is the arbitrage opportunity
 */
async function assessSpreadPersistence(symbol: string, currentSpread?: number): Promise<RiskFactor> {
  try {
    if (!currentSpread) {
      return {
        name: 'Spread Persistence',
        severity: 'medium',
        impact: 0.3,
        description: 'No spread data provided'
      };
    }
    
    // Check spread multiple times to see if it persists
    const spreadChecks = [currentSpread];
    
    for (let i = 0; i < 2; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const spreads = await calculateSpreads([symbol]);
      if (spreads.length > 0 && spreads[0].opportunities.length > 0) {
        spreadChecks.push(spreads[0].opportunities[0].spreadPercent);
      }
    }
    
    // Calculate spread stability
    const avgSpread = spreadChecks.reduce((a, b) => a + b, 0) / spreadChecks.length;
    const spreadVariance = spreadChecks.reduce((sum, s) => sum + Math.pow(s - avgSpread, 2), 0) / spreadChecks.length;
    const spreadStdDev = Math.sqrt(spreadVariance);
    const spreadCV = spreadStdDev / avgSpread;
    
    let severity: RiskFactor['severity'] = 'low';
    let impact = 0;
    let description = '';
    
    if (spreadCV < 0.05) {
      // Very persistent
      severity = 'low';
      impact = 0.1;
      description = `Spread is very stable (${avgSpread.toFixed(2)}% ± ${spreadStdDev.toFixed(2)}%)`;
    } else if (spreadCV < 0.15) {
      // Moderately persistent
      severity = 'low';
      impact = 0.3;
      description = `Spread is moderately stable (${avgSpread.toFixed(2)}% ± ${spreadStdDev.toFixed(2)}%)`;
    } else if (spreadCV < 0.3) {
      // Somewhat volatile
      severity = 'medium';
      impact = 0.6;
      description = `Spread is fluctuating (${avgSpread.toFixed(2)}% ± ${spreadStdDev.toFixed(2)}%). May close before execution.`;
    } else {
      // Very volatile
      severity = 'high';
      impact = 0.8;
      description = `Spread is highly unstable (${avgSpread.toFixed(2)}% ± ${spreadStdDev.toFixed(2)}%). Likely to disappear.`;
    }
    
    return { name: 'Spread Persistence', severity, impact, description };
  } catch (error) {
    return {
      name: 'Spread Persistence',
      severity: 'medium',
      impact: 0.5,
      description: 'Error assessing spread persistence'
    };
  }
}

/**
 * Assess exchange reliability risk
 */
function assessExchangeReliability(exchanges: string[]): RiskFactor {
  const exchangeScores: Record<string, number> = {
    binance: 0.95,  // Very reliable
    wazirx: 0.85,   // Generally reliable
    coindcx: 0.85,
    nse: 0.98,      // Highly reliable (regulated)
  };
  
  let totalScore = 0;
  let count = 0;
  
  for (const exchange of exchanges) {
    const score = exchangeScores[exchange.toLowerCase()] || 0.7;
    totalScore += score;
    count++;
  }
  
  const avgReliability = count > 0 ? totalScore / count : 0.7;
  const risk = 1 - avgReliability;
  
  let severity: RiskFactor['severity'] = 'low';
  if (risk > 0.3) severity = 'high';
  else if (risk > 0.15) severity = 'medium';
  
  return {
    name: 'Exchange Reliability',
    severity,
    impact: risk,
    description: `Exchange reliability score: ${(avgReliability * 100).toFixed(0)}%`
  };
}

/**
 * Assess overall trade risk comprehensively
 */
export async function assessTradeRisk(trade: TradeRequest): Promise<RiskAssessment> {
  try {
    const factors: RiskFactor[] = [];
    
    // Run all risk assessments in parallel where possible
    const [volatilityRisk, liquidityRisk, spreadRisk] = await Promise.all([
      assessVolatility(trade.symbol),
      assessLiquidity(trade.symbol, trade.quantity),
      assessSpreadPersistence(trade.symbol, trade.opportunitySpread)
    ]);
    
    factors.push(volatilityRisk);
    factors.push(liquidityRisk);
    factors.push(spreadRisk);
    
    // Add exchange reliability risk
    const exchangeRisk = assessExchangeReliability(trade.exchanges);
    factors.push(exchangeRisk);
    
    // Calculate value-at-risk based on trade size
    const valueRisk: RiskFactor = {
      name: 'Position Size',
      severity: trade.estimatedValue > 100000 ? 'high' : trade.estimatedValue > 10000 ? 'medium' : 'low',
      impact: Math.min(trade.estimatedValue / 100000, 1),
      description: `Trade value: $${trade.estimatedValue.toLocaleString()}`
    };
    factors.push(valueRisk);
    
    // Calculate overall risk (weighted average)
    const weights = {
      volatility: 0.25,
      liquidity: 0.25,
      spreadPersistence: 0.30,
      exchange: 0.10,
      positionSize: 0.10
    };
    
    const overallRisk = 
      volatilityRisk.impact * weights.volatility +
      liquidityRisk.impact * weights.liquidity +
      spreadRisk.impact * weights.spreadPersistence +
      exchangeRisk.impact * weights.exchange +
      valueRisk.impact * weights.positionSize;
    
    // Determine risk level
    let riskLevel: RiskAssessment['riskLevel'];
    let recommendation: RiskAssessment['recommendation'];
    let reasoning = '';
    
    if (overallRisk < 0.3) {
      riskLevel = 'low';
      recommendation = 'proceed';
      reasoning = 'All risk factors are within acceptable limits. Trade can proceed confidently.';
    } else if (overallRisk < 0.5) {
      riskLevel = 'medium';
      recommendation = 'proceed_with_caution';
      reasoning = 'Some risk factors detected. Monitor the trade closely and consider reducing position size.';
    } else if (overallRisk < 0.7) {
      riskLevel = 'high';
      recommendation = 'proceed_with_caution';
      reasoning = 'Multiple high-risk factors detected. Only proceed with small position size and close monitoring.';
    } else {
      riskLevel = 'critical';
      recommendation = 'abort';
      reasoning = 'Risk level is too high. Market conditions are unfavorable for this trade.';
    }
    
    // Add specific warnings
    const highRiskFactors = factors.filter(f => f.severity === 'high' || f.severity === 'critical');
    if (highRiskFactors.length > 0) {
      reasoning += ` High-risk factors: ${highRiskFactors.map(f => f.name).join(', ')}.`;
    }
    
    return {
      overallRisk,
      riskLevel,
      factors,
      recommendation,
      reasoning,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error in risk assessment:', error);
    return {
      overallRisk: 0.8,
      riskLevel: 'high',
      factors: [{
        name: 'Assessment Error',
        severity: 'high',
        impact: 0.8,
        description: 'Failed to complete risk assessment'
      }],
      recommendation: 'abort',
      reasoning: 'Unable to properly assess risk. Aborting for safety.',
      timestamp: new Date()
    };
  }
}

/**
 * Calculate safe position size based on risk tolerance
 * Uses Kelly Criterion modified for risk tolerance
 */
export async function calculateSafePositionSize(
  trade: TradeRequest,
  riskTolerance: number // 0-1, where 1 is maximum risk tolerance
): Promise<number> {
  try {
    // Get risk assessment first
    const assessment = await assessTradeRisk(trade);
    
    // Base position size on account/portfolio (mock $100,000 portfolio)
    const portfolioValue = 100000;
    
    // Kelly Criterion: f = (bp - q) / b
    // where b = odds, p = probability of win, q = probability of loss
    // Simplified: adjust by risk tolerance and risk assessment
    
    const baseAllocation = portfolioValue * 0.05; // 5% base allocation
    
    // Adjust by risk tolerance
    const toleranceAdjusted = baseAllocation * riskTolerance;
    
    // Adjust by risk assessment (inverse relationship)
    const riskAdjustment = 1 - assessment.overallRisk;
    const riskAdjusted = toleranceAdjusted * riskAdjustment;
    
    // Hard caps based on recommendation
    let maxAllocation = portfolioValue * 0.10; // 10% max
    if (assessment.recommendation === 'proceed_with_caution') {
      maxAllocation = portfolioValue * 0.03; // 3% max for caution
    } else if (assessment.recommendation === 'abort') {
      maxAllocation = 0; // No allocation
    }
    
    const finalAllocation = Math.min(riskAdjusted, maxAllocation);
    
    // Convert dollar amount to quantity
    const avgPrice = trade.estimatedValue / trade.quantity;
    const safeQuantity = finalAllocation / avgPrice;
    
    return Math.max(0, safeQuantity);
  } catch (error) {
    console.error('Error calculating position size:', error);
    return 0; // Return 0 if we can't calculate safely
  }
}

/**
 * Quick risk check - faster version for real-time validation
 */
export async function quickRiskCheck(
  symbol: string,
  estimatedValue: number
): Promise<{ safe: boolean; reason: string }> {
  try {
    // Just check volatility and value
    const volatility = await assessVolatility(symbol);
    
    if (volatility.severity === 'critical') {
      return { safe: false, reason: 'Extreme volatility detected' };
    }
    
    if (estimatedValue > 100000) {
      return { safe: false, reason: 'Trade value exceeds safe limits' };
    }
    
    return { safe: true, reason: 'Passed quick risk check' };
  } catch (error) {
    return { safe: false, reason: 'Error during risk check' };
  }
}

/**
 * Assess risk for an arbitrage opportunity
 * Simpler interface that returns risk score, slippage, volatility, and liquidity
 */
export async function assessRisk(
  opportunity: Opportunity,
  targetQuantity: number = 1
): Promise<RiskAssessmentResult> {
  try {
    const { symbol, spreadPct, binancePrice, indianPrice } = opportunity;
    const notes: string[] = [];

    // 1. Calculate volatility from rolling ticks
    const priceHistory = getPriceHistory(symbol);
    let volatilityPct = 0;
    
    if (priceHistory.length >= 2) {
      const prices = priceHistory.map(t => t.price);
      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      volatilityPct = (stdDev / mean) * 100;
      
      if (volatilityPct > 1.0) {
        notes.push(`High volatility detected (${volatilityPct.toFixed(2)}%) - price may move rapidly`);
      } else if (volatilityPct > 0.5) {
        notes.push(`Moderate volatility (${volatilityPct.toFixed(2)}%)`);
      }
    } else {
      notes.push(`Insufficient price history (${priceHistory.length} ticks) - volatility unknown`);
      volatilityPct = 0.5; // Assume moderate volatility
    }

    // 2. Get Indian exchange orderbook depth and liquidity estimate
    const liquidityEstimate = await getIndianLiquidityEstimate(symbol, targetQuantity);
    
    if (liquidityEstimate.fillableQty < targetQuantity) {
      notes.push(`Low liquidity: only ${liquidityEstimate.fillableQty.toFixed(3)} fillable of ${targetQuantity} requested`);
      notes.push(`Partial fills likely - may not capture full spread`);
    } else {
      notes.push(`Sufficient liquidity available for target quantity`);
    }

    // 3. Estimate slippage based on orderbook
    const midPrice = indianPrice;
    const slippagePct = liquidityEstimate.fillableQty > 0
      ? ((liquidityEstimate.expectedAvgPrice - midPrice) / midPrice) * 100
      : 1.0; // Assume 1% slippage if no data

    if (Math.abs(slippagePct) > 0.5) {
      notes.push(`High slippage expected (${slippagePct.toFixed(2)}%) due to orderbook depth`);
    }

    // 4. Calculate base risk score from spread size
    let riskScore = 50; // Start at neutral

    // Better spread = lower risk
    if (spreadPct > 2.0) {
      riskScore -= 20;
      notes.push(`Large spread (${spreadPct.toFixed(2)}%) provides good profit buffer`);
    } else if (spreadPct > 1.0) {
      riskScore -= 10;
    } else if (spreadPct < 0.5) {
      riskScore += 20;
      notes.push(`Tight spread (${spreadPct.toFixed(2)}%) leaves little margin for error`);
    }

    // 5. Apply volatility penalty
    if (volatilityPct > 1.0) {
      riskScore += 25;
    } else if (volatilityPct > 0.5) {
      riskScore += 15;
    } else if (volatilityPct < 0.1) {
      riskScore -= 10; // Very stable = lower risk
    }

    // 6. Adjust using liquidity estimate
    const fillRatio = liquidityEstimate.fillableQty / targetQuantity;
    if (fillRatio < 0.5) {
      riskScore += 30;
      notes.push(`Very low fill ratio (${(fillRatio * 100).toFixed(0)}%)`);
    } else if (fillRatio < 0.8) {
      riskScore += 15;
    } else if (fillRatio >= 1.0) {
      riskScore -= 5;
    }

    // 7. Slippage penalty
    if (Math.abs(slippagePct) > 0.5) {
      riskScore += 20;
    } else if (Math.abs(slippagePct) > 0.2) {
      riskScore += 10;
    }

    // Clamp risk score to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Add final recommendation note
    if (riskScore > 70) {
      notes.push(`HIGH RISK - consider skipping this opportunity`);
    } else if (riskScore > 50) {
      notes.push(`MEDIUM RISK - proceed with caution and smaller position`);
    } else if (riskScore < 30) {
      notes.push(`LOW RISK - favorable conditions for execution`);
    }

    return {
      riskScore,
      slippagePct: Math.abs(slippagePct),
      volatilityPct,
      liquidityEstimate,
      notes
    };
  } catch (error) {
    console.error('Error in assessRisk:', error);
    return {
      riskScore: 80,
      slippagePct: 1.0,
      volatilityPct: 1.0,
      liquidityEstimate: {
        fillableQty: 0,
        expectedAvgPrice: 0,
      },
      notes: ['Error assessing risk - proceeding with high risk score for safety']
    };
  }
}

