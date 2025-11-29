// Arbitrage Opportunity Detector

import { calculateSpreads, SpreadData } from '@/lib/agents/priceDiscovery';
import { discoverPrices, DiscoveredPrice } from '@/lib/agents/priceDiscovery';

// Persistence buffer for tracking opportunities across polls
interface OpportunityPersistence {
  opportunityKey: string;
  firstSeenTs: number;
  lastSeenTs: number;
  persistenceCount: number;
  data: Opportunity;
}

const persistenceBuffer: Map<string, OpportunityPersistence> = new Map();

export interface Opportunity {
  id: string;
  symbol: string;
  spreadPct: number;
  action: string;
  estimatedGrossProfitPct: number;
  binancePrice: number;
  indianPrice: number;
  firstSeenTs: number;
  lastSeenTs: number;
  persistenceCount: number;
}

export interface DetectArbitrageOptions {
  minSpreadPct?: number;
  persistenceMs?: number;
  minPersistenceCount?: number;
}



/**
 * Detect arbitrage opportunities with persistence buffer
 * Only returns opportunities that have persisted across multiple polls
 */
export async function detectArbitrage(
  prices: DiscoveredPrice[],
  opts: DetectArbitrageOptions = {}
): Promise<Opportunity[]> {
  const {
    minSpreadPct = 0.5,
    persistenceMs = 2000,
    minPersistenceCount = 2
  } = opts;

  const opportunities: Opportunity[] = [];
  const currentTime = Date.now();
  const seenKeys = new Set<string>();

  for (const priceData of prices) {
    const { symbol, binancePrice, indianPrice } = priceData;

    // Skip if either price is missing
    if (!binancePrice || !indianPrice) {
      continue;
    }

    // Calculate spread
    const spreadPct = ((indianPrice - binancePrice) / binancePrice) * 100;

    // Skip if spread is below minimum threshold
    if (Math.abs(spreadPct) < minSpreadPct) {
      continue;
    }

    // Determine action based on spread direction
    const action = spreadPct > 0 
      ? 'buy-binance-sell-india' 
      : 'buy-india-sell-binance';

    // Create unique key for this opportunity
    const opportunityKey = `${symbol}_${action}`;
    seenKeys.add(opportunityKey);

    // Check if this opportunity exists in persistence buffer
    let persistence = persistenceBuffer.get(opportunityKey);

    if (persistence) {
      // Update existing opportunity
      persistence.lastSeenTs = currentTime;
      persistence.persistenceCount += 1;
      persistence.data = {
        ...persistence.data,
        spreadPct: Math.abs(spreadPct),
        estimatedGrossProfitPct: Math.abs(spreadPct) - 0.3, // Subtract estimated fees
        binancePrice,
        indianPrice,
        lastSeenTs: currentTime,
        persistenceCount: persistence.persistenceCount,
      };
    } else {
      // New opportunity - add to buffer
      const oppId = `opp_${symbol}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      persistence = {
        opportunityKey,
        firstSeenTs: currentTime,
        lastSeenTs: currentTime,
        persistenceCount: 1,
        data: {
          id: oppId,
          symbol,
          spreadPct: Math.abs(spreadPct),
          action,
          estimatedGrossProfitPct: Math.abs(spreadPct) - 0.3, // Subtract estimated fees
          binancePrice,
          indianPrice,
          firstSeenTs: currentTime,
          lastSeenTs: currentTime,
          persistenceCount: 1,
        },
      };
      persistenceBuffer.set(opportunityKey, persistence);
    }

    // Check if opportunity meets persistence criteria
    const timePersisted = currentTime - persistence.firstSeenTs;
    const meetsCountCriteria = persistence.persistenceCount >= minPersistenceCount;
    const meetsTimeCriteria = timePersisted >= persistenceMs;

    if (meetsCountCriteria || meetsTimeCriteria) {
      opportunities.push(persistence.data);
    }
  }

  // Clean up stale opportunities from buffer (not seen in this poll)
  const staleKeys: string[] = [];
  for (const [key, persistence] of Array.from(persistenceBuffer.entries())) {
    if (!seenKeys.has(key)) {
      // If not seen for more than 10 seconds, remove
      if (currentTime - persistence.lastSeenTs > 10000) {
        staleKeys.push(key);
      }
    }
  }
  staleKeys.forEach(key => persistenceBuffer.delete(key));

  // Sort by estimated profit
  opportunities.sort((a, b) => b.estimatedGrossProfitPct - a.estimatedGrossProfitPct);

  return opportunities;
}

export interface ArbitrageOpportunity {
  id: string;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number; // percentage
  spreadAbsolute: number; // absolute value
  estimatedProfit: number;
  estimatedFees: number;
  netProfit: number;
  confidence: number; // 0-1
  liquidity: {
    buy: number;
    sell: number;
  };
  timestamp: Date;
  expiresAt: Date;
}

export interface DetectionConfig {
  minSpreadPercentage: number;
  minProfitUSD: number;
  exchanges: string[];
  symbols: string[];
  checkIntervalMs: number;
}

/**
 * Detect arbitrage opportunities across all exchanges
 * Uses spread calculation from priceDiscovery agent
 */
export async function detectOpportunities(
  config: DetectionConfig
): Promise<ArbitrageOpportunity[]> {
  try {
    // Use calculateSpreads to get all price data and opportunities
    const spreadResults = await calculateSpreads(config.symbols);
    
    const opportunities: ArbitrageOpportunity[] = [];
    
    for (const spreadData of spreadResults) {
      // Process each opportunity found in the spread analysis
      for (const opp of spreadData.opportunities) {
        // Filter by minimum spread percentage
        if (opp.spreadPercent < config.minSpreadPercentage) {
          continue;
        }
        
        // Calculate estimated fees
        const estimatedFees = await estimateTransactionCosts(
          spreadData.symbol,
          opp.buyExchange,
          opp.sellExchange,
          1 // Assume 1 unit for estimation
        );
        
        const spreadAbsolute = opp.sellPrice - opp.buyPrice;
        const grossProfit = spreadAbsolute;
        const netProfit = grossProfit - estimatedFees;
        
        // Filter by minimum profit
        if (netProfit < config.minProfitUSD) {
          continue;
        }
        
        // Calculate confidence based on spread size and consistency
        // Higher spread = higher confidence (less likely to disappear)
        // But extremely high spreads might indicate data issues
        let confidence = 0.5;
        if (opp.spreadPercent > 0.5 && opp.spreadPercent < 5) {
          confidence = 0.7;
        }
        if (opp.spreadPercent > 1 && opp.spreadPercent < 3) {
          confidence = 0.9;
        }
        if (opp.spreadPercent > 10) {
          confidence = 0.3; // Too good to be true
        }
        
        // Generate unique ID
        const id = `${spreadData.symbol}_${opp.buyExchange}_${opp.sellExchange}_${Date.now()}`;
        
        // Mock liquidity (in production, fetch from order books)
        const liquidity = {
          buy: 100,
          sell: 100
        };
        
        opportunities.push({
          id,
          symbol: spreadData.symbol,
          buyExchange: opp.buyExchange,
          sellExchange: opp.sellExchange,
          buyPrice: opp.buyPrice,
          sellPrice: opp.sellPrice,
          spread: opp.spreadPercent,
          spreadAbsolute,
          estimatedProfit: grossProfit,
          estimatedFees,
          netProfit,
          confidence,
          liquidity,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 60000) // 1 minute expiry
        });
      }
    }
    
    // Sort by net profit descending
    opportunities.sort((a, b) => b.netProfit - a.netProfit);
    
    return opportunities;
  } catch (error) {
    console.error('Error detecting opportunities:', error);
    return [];
  }
}

/**
 * Validate if an opportunity is still viable
 * Re-fetches current prices and checks if spread still exists
 */
export async function validateOpportunity(
  opportunity: ArbitrageOpportunity
): Promise<boolean> {
  try {
    // Check if opportunity has expired
    if (new Date() > opportunity.expiresAt) {
      return false;
    }
    
    // Re-fetch current spreads for this symbol
    const currentSpreads = await calculateSpreads([opportunity.symbol]);
    
    if (currentSpreads.length === 0) {
      return false;
    }
    
    const currentSpread = currentSpreads[0];
    
    // Find the specific opportunity (buy from X, sell to Y)
    const currentOpp = currentSpread.opportunities.find(
      opp => opp.buyExchange === opportunity.buyExchange && 
             opp.sellExchange === opportunity.sellExchange
    );
    
    if (!currentOpp) {
      return false;
    }
    
    // Check if spread is still profitable (within 10% of original)
    const spreadDifference = Math.abs(currentOpp.spreadPercent - opportunity.spread);
    const isSpreadStable = spreadDifference < (opportunity.spread * 0.1);
    
    // Check if still profitable
    const stillProfitable = currentOpp.profitPotential > 0;
    
    return isSpreadStable && stillProfitable;
  } catch (error) {
    console.error('Error validating opportunity:', error);
    return false;
  }
}

/**
 * Calculate transaction costs
 * Includes trading fees, withdrawal fees, network fees, and slippage
 */
export async function estimateTransactionCosts(
  symbol: string,
  buyExchange: string,
  sellExchange: string,
  quantity: number
): Promise<number> {
  // Fee structures for different exchanges
  const feeStructure: Record<string, {
    tradingFee: number; // percentage
    withdrawalFee: number; // flat fee in USD
    networkFee: number; // for crypto transfers
  }> = {
    binance: {
      tradingFee: 0.1, // 0.1%
      withdrawalFee: 1, // $1 equivalent
      networkFee: 2 // $2 for crypto transfer
    },
    wazirx: {
      tradingFee: 0.2, // 0.2%
      withdrawalFee: 2, // $2 equivalent
      networkFee: 1 // Lower network fee in India
    },
    nse: {
      tradingFee: 0.03, // 0.03% (STT + brokerage)
      withdrawalFee: 0, // No withdrawal fee for stocks
      networkFee: 0
    }
  };
  
  const buyFees = feeStructure[buyExchange.toLowerCase()] || feeStructure.binance;
  const sellFees = feeStructure[sellExchange.toLowerCase()] || feeStructure.binance;
  
  // Mock average price (in production, use actual buy/sell prices)
  const avgPrice = 50000; // Placeholder
  
  // Calculate trading fees
  const buyTradingFee = (avgPrice * quantity * buyFees.tradingFee) / 100;
  const sellTradingFee = (avgPrice * quantity * sellFees.tradingFee) / 100;
  
  // Withdrawal and network fees (only if transferring between exchanges)
  const transferFees = buyExchange !== sellExchange 
    ? buyFees.withdrawalFee + buyFees.networkFee
    : 0;
  
  // Slippage estimation (0.05% to 0.2%)
  const slippage = avgPrice * quantity * (0.001 + Math.random() * 0.001);
  
  const totalCosts = buyTradingFee + sellTradingFee + transferFees + slippage;
  
  return totalCosts;
}

/**
 * Get arbitrage opportunities for a single symbol
 */
export async function detectOpportunitiesForSymbol(
  symbol: string,
  minSpreadPercentage: number = 0.5,
  minProfitUSD: number = 10
): Promise<ArbitrageOpportunity[]> {
  const config: DetectionConfig = {
    minSpreadPercentage,
    minProfitUSD,
    exchanges: ['binance', 'wazirx', 'nse'],
    symbols: [symbol],
    checkIntervalMs: 5000
  };
  
  return detectOpportunities(config);
}

/**
 * Continuous monitoring function (returns top N opportunities)
 */
export async function getTopOpportunities(
  count: number = 10,
  config?: Partial<DetectionConfig>
): Promise<ArbitrageOpportunity[]> {
  const defaultConfig: DetectionConfig = {
    minSpreadPercentage: 0.3,
    minProfitUSD: 5,
    exchanges: ['binance', 'wazirx', 'nse'],
    symbols: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'],
    checkIntervalMs: 5000,
    ...config
  };
  
  const opportunities = await detectOpportunities(defaultConfig);
  return opportunities.slice(0, count);
}
