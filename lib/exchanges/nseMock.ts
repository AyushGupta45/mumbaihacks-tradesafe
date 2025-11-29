// Mock NSE (National Stock Exchange) Integration

import fs from 'fs';
import path from 'path';

export interface NSEPrice {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  exchange: 'nse';
  name?: string;
  change?: number;
  changePercent?: number;
  open?: number;
  high?: number;
  low?: number;
}

export interface NSEOrderBook {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: Date;
}

interface NSEStockData {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
}

interface NSEDataFile {
  lastUpdated: string;
  stocks: NSEStockData[];
}

// Cache for NSE data
let nseDataCache: NSEDataFile | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Load NSE data from JSON file
 */
function loadNSEData(): NSEDataFile | null {
  try {
    const dataPath = path.join(process.cwd(), 'lib', 'data', 'nse.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading NSE data:', error);
    return null;
  }
}

/**
 * Get cached NSE data or reload if cache expired (5 seconds)
 */
function getCachedNSEData(): NSEDataFile | null {
  const now = Date.now();
  
  if (!nseDataCache || now - lastCacheUpdate > CACHE_DURATION) {
    nseDataCache = loadNSEData();
    lastCacheUpdate = now;
  }
  
  return nseDataCache;
}

/**
 * Simulate price updates with realistic variations
 * Applies random drift to base price every 5 seconds
 */
function applyPriceVariation(basePrice: number, volatilityPercent: number = 0.3): number {
  // Random walk: -0.3% to +0.3% variation
  const variation = (Math.random() - 0.5) * 2 * (volatilityPercent / 100);
  return basePrice * (1 + variation);
}

/**
 * Generate mock NSE price data
 * Reads from nse.json and applies 5-second simulated updates
 */
export async function getNSEPrices(symbols: string[]): Promise<NSEPrice[]> {
  try {
    const nseData = getCachedNSEData();
    
    if (!nseData) {
      console.warn('NSE data not available');
      return [];
    }
    
    const prices: NSEPrice[] = [];
    
    // If no symbols specified, return all stocks
    const targetSymbols = symbols.length > 0 
      ? symbols.map(s => s.toUpperCase())
      : nseData.stocks.map(s => s.symbol);
    
    for (const targetSymbol of targetSymbols) {
      const stock = nseData.stocks.find(s => 
        s.symbol.toUpperCase() === targetSymbol.toUpperCase()
      );
      
      if (!stock) continue;
      
      // Apply 5-second simulated price variation
      const currentPrice = applyPriceVariation(stock.price);
      const priceChange = currentPrice - stock.price;
      const changePercent = (priceChange / stock.price) * 100;
      
      prices.push({
        symbol: stock.symbol,
        name: stock.name,
        price: currentPrice,
        volume: stock.volume,
        timestamp: new Date(),
        exchange: 'nse',
        change: priceChange,
        changePercent: changePercent,
        open: stock.open,
        high: Math.max(stock.high, currentPrice),
        low: Math.min(stock.low, currentPrice)
      });
    }
    
    return prices;
  } catch (error) {
    console.error('Error generating NSE prices:', error);
    return [];
  }
}

/**
 * Get price for a single NSE symbol
 * For crypto symbols, uses Binance + small drift (0.2%-1%)
 */
export async function getNSEPrice(
  symbol: string,
  opts?: { driftOverride?: number }
): Promise<number> {
  try {
    // Check if this is a crypto symbol (contains USDT, BTC, ETH, etc.)
    const isCrypto = /USDT|BTC|ETH/i.test(symbol);
    
    if (isCrypto) {
      // For crypto, use Binance as base + small drift
      const { getBinancePrices } = await import('./binance');
      const binancePrices = await getBinancePrices([symbol]);
      
      if (binancePrices.length === 0) {
        throw new Error(`Failed to fetch base price for ${symbol}`);
      }
      
      const binancePrice = binancePrices[0].price;
      
      // Small drift: 0.2% to 1%
      const drift = typeof opts?.driftOverride === 'number'
        ? opts.driftOverride
        : (0.002 + Math.random() * 0.008); // 0.2% to 1%
      
      return binancePrice * (1 + drift);
    } else {
      // For regular stocks, use existing NSE data
      const prices = await getNSEPrices([symbol]);
      if (prices.length === 0) {
        throw new Error(`Symbol ${symbol} not found`);
      }
      return prices[0].price;
    }
  } catch (error) {
    console.error('Error getting NSE price:', error);
    throw error;
  }
}

/**
 * Generate mock NSE order book
 * Creates realistic Indian stock market spreads
 */
export async function getNSEOrderBook(symbol: string): Promise<NSEOrderBook | null> {
  try {
    const basePrice = await getNSEPrice(symbol);
    
    // NSE spreads are typically 0.05% to 0.15%
    const spreadPercent = 0.0005 + Math.random() * 0.001;
    
    // Generate bids (lower prices)
    const bids: [number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const priceOffset = spreadPercent * (i + 1) / 2;
      const bidPrice = basePrice * (1 - priceOffset);
      const quantity = Math.floor(10 + Math.random() * 500); // Lot sizes
      bids.push([bidPrice, quantity]);
    }
    
    // Generate asks (higher prices)
    const asks: [number, number][] = [];
    for (let i = 0; i < 20; i++) {
      const priceOffset = spreadPercent * (i + 1) / 2;
      const askPrice = basePrice * (1 + priceOffset);
      const quantity = Math.floor(10 + Math.random() * 500);
      asks.push([askPrice, quantity]);
    }
    
    return {
      symbol: symbol.toUpperCase(),
      bids,
      asks,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error generating NSE order book:', error);
    return null;
  }
}

/**
 * Simulate NSE trade execution
 * Mock order placement with NSE rules
 */
export async function executeNSETrade(
  symbol: string,
  side: 'buy' | 'sell',
  quantity: number,
  type: 'market' | 'limit',
  price?: number
): Promise<any> {
  // Check if market is open (9:15 AM to 3:30 PM IST on weekdays)
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();
  
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = (hour > 9 || (hour === 9 && minute >= 15)) && 
                        (hour < 15 || (hour === 15 && minute <= 30));
  
  if (!isWeekday || !isMarketHours) {
    throw new Error('NSE market is closed. Trading hours: 9:15 AM - 3:30 PM IST, Mon-Fri');
  }
  
  // Simulate execution delay (50-200ms)
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));
  
  const currentPrice = await getNSEPrice(symbol);
  const executionPrice = price || currentPrice;
  
  // Simulate slippage (0.02% to 0.08%)
  const slippage = 0.0002 + Math.random() * 0.0006;
  const finalPrice = side === 'buy' 
    ? executionPrice * (1 + slippage)
    : executionPrice * (1 - slippage);
  
  // NSE charges: STT (0.025% for delivery) + brokerage (0.03%)
  const stt = finalPrice * quantity * 0.00025;
  const brokerage = finalPrice * quantity * 0.0003;
  const totalFees = stt + brokerage;
  
  return {
    orderId: `NSE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol: symbol.toUpperCase(),
    side,
    type,
    quantity,
    executedPrice: finalPrice,
    executedQuantity: quantity,
    fees: totalFees,
    breakdown: {
      stt,
      brokerage
    },
    slippagePercent: slippage * 100,
    status: 'filled',
    timestamp: new Date(),
    exchange: 'nse',
    settlementType: 'T+2' // NSE settlement cycle
  };
}

/**
 * Check if NSE market is currently open
 */
export function isNSEMarketOpen(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();
  
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = (hour > 9 || (hour === 9 && minute >= 15)) && 
                        (hour < 15 || (hour === 15 && minute <= 30));
  
  return isWeekday && isMarketHours;
}

/**
 * Get all available NSE symbols
 */
export function getAllNSESymbols(): string[] {
  const nseData = getCachedNSEData();
  return nseData ? nseData.stocks.map(s => s.symbol) : [];
}
