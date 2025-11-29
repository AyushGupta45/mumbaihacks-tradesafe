// Mock Indian Exchange (WazirX, CoinDCX, etc.)

import { getBinancePrices } from './binance';

// Current USD to INR exchange rate (approximate)
const USD_TO_INR = 83.5;

export interface IndianExchangePrice {
  symbol: string;
  price: number;
  priceInINR: number;
  timestamp: Date;
  exchange: 'wazirx' | 'coindcx' | 'mock';
}

export interface IndianExchangeOrderBook {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: Date;
}

/**
 * Generate mock price data for Indian exchanges (WazirX)
 * Simulates realistic price variations with premium/discount to global prices
 * Indian exchanges typically trade at 0.5-3% premium due to liquidity and INR conversion
 */
export async function getIndianExchangePrices(symbols: string[]): Promise<IndianExchangePrice[]> {
  try {
    // Get Binance prices as base reference
    const binancePrices = await getBinancePrices(symbols);
    
    const indianPrices: IndianExchangePrice[] = binancePrices.map(binancePrice => {
      // Indian exchanges typically have 0.5% to 2.5% premium
      const premiumPercentage = 0.5 + Math.random() * 2.0; // 0.5% to 2.5%
      const premium = 1 + (premiumPercentage / 100);
      
      // Add small random variation (-0.2% to +0.2%)
      const variation = 0.998 + Math.random() * 0.004;
      
      const priceUSD = binancePrice.price * premium * variation;
      const priceINR = priceUSD * USD_TO_INR;
      
      return {
        symbol: binancePrice.symbol,
        price: priceUSD,
        priceInINR: priceINR,
        timestamp: new Date(),
        exchange: 'wazirx' as const
      };
    });
    
    return indianPrices;
  } catch (error) {
    console.error('Error generating Indian exchange prices:', error);
    return [];
  }
}

/**
 * Get price for a single symbol from Indian exchange
 * Supports optional drift override for testing and simulation
 */
export async function getIndianExchangePrice(
  symbol: string, 
  opts?: { driftOverride?: number }
): Promise<number> {
  try {
    // Get Binance price as base reference
    const binancePrices = await getBinancePrices([symbol]);
    if (binancePrices.length === 0) {
      throw new Error(`Failed to fetch base price for ${symbol}`);
    }
    
    const binancePrice = binancePrices[0].price;
    
    // Calculate drift: use override or random 0.5%-2.5% premium
    const drift = typeof opts?.driftOverride === 'number' 
      ? opts.driftOverride 
      : (0.005 + Math.random() * 0.02); // 0.5% to 2.5%
    
    const price = binancePrice * (1 + drift);
    return price;
  } catch (error) {
    console.error('Error getting Indian exchange price:', error);
    throw error;
  }
}

/**
 * Generate mock order book for Indian exchanges
 * Creates realistic bid/ask spreads with lower liquidity than global exchanges
 */
export async function getIndianOrderBook(
  symbol: string,
  depth: number = 10
): Promise<{bids: [number, number][], asks: [number, number][]}> {
  try {
    // Get Indian exchange price with drift
    const midPrice = await getIndianExchangePrice(symbol);
    
    // Indian exchanges have wider spreads (0.1% to 0.5%)
    const spreadPercent = 0.001 + Math.random() * 0.004; // 0.1% to 0.5%
    
    // Generate bids (lower prices)
    const bids: [number, number][] = [];
    for (let i = 0; i < depth; i++) {
      const priceOffset = spreadPercent * (i + 1);
      const price = midPrice * (1 - priceOffset);
      const quantity = 0.1 + Math.random() * 5; // 0.1 to 5 BTC
      bids.push([price, quantity]);
    }
    
    // Generate asks (higher prices)
    const asks: [number, number][] = [];
    for (let i = 0; i < depth; i++) {
      const priceOffset = spreadPercent * (i + 1);
      const price = midPrice * (1 + priceOffset);
      const quantity = 0.1 + Math.random() * 5;
      asks.push([price, quantity]);
    }
    
    return {
      bids,
      asks
    };
  } catch (error) {
    console.error('Error generating Indian order book:', error);
    throw error;
  }
}

/**
 * Estimate liquidity available for a target quantity
 * Returns fillable quantity and expected average price
 */
export async function getIndianLiquidityEstimate(
  symbol: string,
  targetQty: number
): Promise<{fillableQty: number, expectedAvgPrice: number}> {
  try {
    const orderbook = await getIndianOrderBook(symbol, 20);
    
    // Use asks for buy orders (selling to us)
    let remainingQty = targetQty;
    let totalCost = 0;
    let filledQty = 0;
    
    for (const [price, qty] of orderbook.asks) {
      if (remainingQty <= 0) break;
      
      const fillQty = Math.min(remainingQty, qty);
      totalCost += price * fillQty;
      filledQty += fillQty;
      remainingQty -= fillQty;
    }
    
    const expectedAvgPrice = filledQty > 0 ? totalCost / filledQty : 0;
    
    return {
      fillableQty: filledQty,
      expectedAvgPrice
    };
  } catch (error) {
    console.error('Error estimating Indian liquidity:', error);
    throw error;
  }
}

/**
 * Simulate trade execution on Indian exchange
 * Returns mock execution result
 */
export async function executeIndianTrade(
  symbol: string,
  side: 'buy' | 'sell',
  quantity: number,
  type: 'market' | 'limit',
  price?: number
): Promise<any> {
  // Simulate execution delay (100-500ms)
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
  
  // Get current price
  const prices = await getIndianExchangePrices([symbol]);
  if (prices.length === 0) {
    throw new Error('Failed to get price for execution');
  }
  
  const currentPrice = prices[0].price;
  const executionPrice = price || currentPrice;
  
  // Simulate slippage (0.05% to 0.2%)
  const slippage = 0.0005 + Math.random() * 0.0015;
  const finalPrice = side === 'buy' 
    ? executionPrice * (1 + slippage)
    : executionPrice * (1 - slippage);
  
  // Simulate fees (0.1% to 0.2%)
  const feePercent = 0.001 + Math.random() * 0.001;
  const fees = finalPrice * quantity * feePercent;
  
  return {
    orderId: `WAZIRX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol: symbol.replace('/', '').toUpperCase(),
    side,
    type,
    quantity,
    executedPrice: finalPrice,
    executedPriceINR: finalPrice * USD_TO_INR,
    executedQuantity: quantity,
    fees,
    feesINR: fees * USD_TO_INR,
    slippagePercent: slippage * 100,
    status: 'filled',
    timestamp: new Date(),
    exchange: 'wazirx'
  };
}

/**
 * Get INR conversion rate
 */
export function getINRConversionRate(): number {
  return USD_TO_INR;
}

/**
 * Convert USD to INR
 */
export function convertToINR(usdAmount: number): number {
  return usdAmount * USD_TO_INR;
}

/**
 * Convert INR to USD
 */
export function convertToUSD(inrAmount: number): number {
  return inrAmount / USD_TO_INR;
}
