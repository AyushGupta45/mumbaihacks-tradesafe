// Price Discovery Agent

import { getBinancePrices, getBinancePrice } from '@/lib/exchanges/binance';
import { getIndianExchangePrices, getIndianExchangePrice } from '@/lib/exchanges/indianMock';
import { getNSEPrices, getNSEPrice } from '@/lib/exchanges/nseMock';

// Rolling window storage for price ticks (last 100 per symbol)
interface PriceTick {
  price: number;
  timestamp: number;
}

const priceHistory: Map<string, PriceTick[]> = new Map();
const MAX_TICKS = 100;

/**
 * Add a price tick to the rolling window
 */
function addPriceTick(symbol: string, price: number): void {
  if (!priceHistory.has(symbol)) {
    priceHistory.set(symbol, []);
  }
  
  const ticks = priceHistory.get(symbol)!;
  ticks.push({ price, timestamp: Date.now() });
  
  // Keep only last 100 ticks
  if (ticks.length > MAX_TICKS) {
    ticks.shift();
  }
}

/**
 * Calculate volatility from price history
 */
function calculateVolatility(symbol: string): number {
  const ticks = priceHistory.get(symbol);
  if (!ticks || ticks.length < 2) {
    return 0;
  }
  
  const prices = ticks.map(t => t.price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  // Return volatility as percentage of mean
  return (stdDev / mean) * 100;
}

/**
 * Get price history for a symbol
 */
export function getPriceHistory(symbol: string): PriceTick[] {
  return priceHistory.get(symbol) || [];
}


export interface PriceData {
  exchange: string;
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
}

export interface DiscoveredPrice {
  symbol: string;
  binancePrice: number;
  indianPrice: number;
  nsePrice: number;
  spreads: {
    binanceVsIndian: number;
    binanceVsNse: number;
    indianVsNse: number;
  };
  volatility: number;
  tickCount: number;
  timestamp: string;
}

export interface PriceDiscoveryResult {
  symbol: string;
  fairPrice: number;
  confidence: number;
  sources: PriceData[];
  timestamp: Date;
}

/**
 * Discover prices from all exchanges for given symbols
 * Maintains rolling window of ticks for volatility calculation
 */
export async function discoverPrices(symbols: string[]): Promise<DiscoveredPrice[]> {
  const results: DiscoveredPrice[] = [];

  for (const symbol of symbols) {
    try {
      // Fetch from all exchanges concurrently
      const [binancePrice, indianPrice, nsePrice] = await Promise.all([
        getBinancePrice(symbol).catch(() => null),
        getIndianExchangePrice(symbol).catch(() => null),
        getNSEPrice(symbol).catch(() => null),
      ]);

      // Store Binance price in rolling window for volatility
      if (binancePrice !== null) {
        addPriceTick(symbol, binancePrice);
      }

      // Calculate spreads
      const spreads: any = {};
      if (binancePrice && indianPrice) {
        spreads.binanceVsIndian = ((indianPrice - binancePrice) / binancePrice) * 100;
      }
      if (binancePrice && nsePrice) {
        spreads.binanceVsNse = ((nsePrice - binancePrice) / binancePrice) * 100;
      }
      if (indianPrice && nsePrice) {
        spreads.indianVsNse = ((nsePrice - indianPrice) / indianPrice) * 100;
      }

      // Get volatility from historical ticks
      const volatility = calculateVolatility(symbol);
      const tickCount = getPriceHistory(symbol).length;

      results.push({
        symbol,
        binancePrice: binancePrice || 0,
        indianPrice: indianPrice || 0,
        nsePrice: nsePrice || 0,
        spreads,
        volatility,
        tickCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error discovering prices for ${symbol}:`, error);
    }
  }

  return results;
}

export interface SpreadData {
  symbol: string;
  exchanges: {
    name: string;
    price: number;
    volume?: number;
  }[];
  minPrice: number;
  maxPrice: number;
  spreadPercentage: number;
  spreadAbsolute: number;
  avgPrice: number;
  opportunities: {
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    spreadPercent: number;
    profitPotential: number;
  }[];
  timestamp: Date;
}

/**
 * Calculate spreads across all exchanges for given symbols
 * Identifies arbitrage opportunities between exchanges
 */
export async function calculateSpreads(symbols: string[]): Promise<SpreadData[]> {
  const spreadResults: SpreadData[] = [];

  for (const symbol of symbols) {
    try {
      // Fetch prices from all exchanges in parallel
      const [binancePrices, wazirxPrices, nsePrices] = await Promise.all([
        getBinancePrices([symbol]).catch(() => []),
        getIndianExchangePrices([symbol]).catch(() => []),
        getNSEPrices([symbol]).catch(() => [])
      ]);

      // Aggregate all prices
      const allPrices: { name: string; price: number; volume?: number }[] = [];

      if (binancePrices.length > 0) {
        allPrices.push({
          name: 'binance',
          price: binancePrices[0].price,
          volume: 0 // Binance doesn't return volume in ticker
        });
      }

      if (wazirxPrices.length > 0) {
        allPrices.push({
          name: 'wazirx',
          price: wazirxPrices[0].price,
          volume: 0
        });
      }

      if (nsePrices.length > 0) {
        allPrices.push({
          name: 'nse',
          price: nsePrices[0].price,
          volume: nsePrices[0].volume
        });
      }

      // Skip if we don't have at least 2 exchanges
      if (allPrices.length < 2) continue;

      // Calculate min, max, avg
      const prices = allPrices.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      const spreadAbsolute = maxPrice - minPrice;
      const spreadPercentage = (spreadAbsolute / minPrice) * 100;

      // Find all arbitrage opportunities (buy low, sell high)
      const opportunities: SpreadData['opportunities'] = [];
      
      for (let i = 0; i < allPrices.length; i++) {
        for (let j = 0; j < allPrices.length; j++) {
          if (i === j) continue;
          
          const buyExchange = allPrices[i];
          const sellExchange = allPrices[j];
          
          if (sellExchange.price > buyExchange.price) {
            const spread = sellExchange.price - buyExchange.price;
            const spreadPercent = (spread / buyExchange.price) * 100;
            
            // Estimate fees (0.2% total)
            const fees = (buyExchange.price + sellExchange.price) * 0.001;
            const profitPotential = spread - fees;
            
            if (profitPotential > 0) {
              opportunities.push({
                buyExchange: buyExchange.name,
                sellExchange: sellExchange.name,
                buyPrice: buyExchange.price,
                sellPrice: sellExchange.price,
                spreadPercent,
                profitPotential
              });
            }
          }
        }
      }

      // Sort opportunities by profit potential
      opportunities.sort((a, b) => b.profitPotential - a.profitPotential);

      spreadResults.push({
        symbol,
        exchanges: allPrices,
        minPrice,
        maxPrice,
        spreadPercentage,
        spreadAbsolute,
        avgPrice,
        opportunities,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error calculating spread for ${symbol}:`, error);
    }
  }

  return spreadResults;
}

/**
 * Aggregate prices from multiple exchanges
 * Weights prices by volume and liquidity to calculate fair market price
 */
export async function discoverFairPrice(symbol: string): Promise<PriceDiscoveryResult | null> {
  try {
    // Fetch prices from all exchanges
    const [binancePrices, wazirxPrices, nsePrices] = await Promise.all([
      getBinancePrices([symbol]).catch(() => []),
      getIndianExchangePrices([symbol]).catch(() => []),
      getNSEPrices([symbol]).catch(() => [])
    ]);

    const sources: PriceData[] = [];

    // Aggregate all sources
    if (binancePrices.length > 0) {
      sources.push({
        exchange: 'binance',
        symbol: binancePrices[0].symbol,
        price: binancePrices[0].price,
        volume: 1000000, // Mock high volume for Binance
        timestamp: binancePrices[0].timestamp
      });
    }

    if (wazirxPrices.length > 0) {
      sources.push({
        exchange: 'wazirx',
        symbol: wazirxPrices[0].symbol,
        price: wazirxPrices[0].price,
        volume: 100000, // Mock lower volume for Indian exchange
        timestamp: wazirxPrices[0].timestamp
      });
    }

    if (nsePrices.length > 0) {
      sources.push({
        exchange: 'nse',
        symbol: nsePrices[0].symbol,
        price: nsePrices[0].price,
        volume: nsePrices[0].volume,
        timestamp: nsePrices[0].timestamp
      });
    }

    if (sources.length === 0) {
      return null;
    }

    // Calculate volume-weighted average price (VWAP)
    const totalVolume = sources.reduce((sum, source) => sum + source.volume, 0);
    const fairPrice = sources.reduce((sum, source) => {
      const weight = source.volume / totalVolume;
      return sum + (source.price * weight);
    }, 0);

    // Calculate confidence based on:
    // - Number of sources (more is better)
    // - Price consistency (lower spread is better)
    const prices = sources.map(s => s.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceVariance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
    const priceStdDev = Math.sqrt(priceVariance);
    const coefficientOfVariation = priceStdDev / avgPrice;

    // Confidence: high when many sources and low variance
    const sourceScore = Math.min(sources.length / 3, 1); // Max at 3 sources
    const consistencyScore = Math.max(0, 1 - (coefficientOfVariation * 10)); // Penalize high variance
    const confidence = (sourceScore * 0.4 + consistencyScore * 0.6);

    return {
      symbol,
      fairPrice,
      confidence,
      sources,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error discovering fair price:', error);
    return null;
  }
}

/**
 * Monitor price movements across exchanges
 * Detects anomalies and significant divergence
 */
export async function monitorPriceMovements(symbols: string[]): Promise<PriceDiscoveryResult[]> {
  const results: PriceDiscoveryResult[] = [];

  for (const symbol of symbols) {
    const result = await discoverFairPrice(symbol);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Get the best prices across all exchanges for a symbol
 */
export async function getBestPrices(symbol: string): Promise<{
  bestBid: { exchange: string; price: number } | null;
  bestAsk: { exchange: string; price: number } | null;
  spread: number;
}> {
  try {
    const spreads = await calculateSpreads([symbol]);
    if (spreads.length === 0) {
      return { bestBid: null, bestAsk: null, spread: 0 };
    }

    const spreadData = spreads[0];
    const prices = spreadData.exchanges;

    // Best bid = highest price (where you can sell)
    const bestBid = prices.reduce((max, current) => 
      current.price > (max?.price || 0) ? current : max
    );

    // Best ask = lowest price (where you can buy)
    const bestAsk = prices.reduce((min, current) => 
      current.price < (min?.price || Infinity) ? current : min
    );

    const spread = bestBid.price - bestAsk.price;

    return {
      bestBid: { exchange: bestBid.name, price: bestBid.price },
      bestAsk: { exchange: bestAsk.name, price: bestAsk.price },
      spread
    };
  } catch (error) {
    console.error('Error getting best prices:', error);
    return { bestBid: null, bestAsk: null, spread: 0 };
  }
}
