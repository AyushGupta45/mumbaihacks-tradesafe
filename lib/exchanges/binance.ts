// Binance Exchange Integration

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export interface BinancePrice {
  symbol: string;
  price: number;
  timestamp: Date;
  exchange: 'binance';
}

export interface BinanceOrderBook {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: Date;
}

interface BinanceTickerResponse {
  symbol: string;
  price: string;
}

interface BinanceDepthResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

/**
 * Fetch real-time price data from Binance API
 * Uses the ticker/price endpoint for current prices
 */
export async function getBinancePrices(symbols: string[]): Promise<BinancePrice[]> {
  try {
    // Convert symbols to Binance format (e.g., "BTC/USDT" -> "BTCUSDT")
    const binanceSymbols = symbols.map(s => s.replace('/', '').toUpperCase());
    
    const prices: BinancePrice[] = [];
    
    // Fetch prices for each symbol
    for (const symbol of binanceSymbols) {
      try {
        const response = await fetch(
          `${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`,
          { 
            next: { revalidate: 5 }, // Cache for 5 seconds
            signal: AbortSignal.timeout(5000) // 5 second timeout
          }
        );
        
        if (!response.ok) {
          console.warn(`Binance API error for ${symbol}: ${response.status}`);
          continue;
        }
        
        const data: BinanceTickerResponse = await response.json();
        
        prices.push({
          symbol: symbol,
          price: parseFloat(data.price),
          timestamp: new Date(),
          exchange: 'binance'
        });
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
      }
    }
    
    return prices;
  } catch (error) {
    console.error('Binance API error:', error);
    return [];
  }
}

/**
 * Fetch order book depth from Binance
 * Gets top 20 bids and asks for liquidity analysis
 */
export async function getBinanceOrderBook(symbol: string): Promise<BinanceOrderBook | null> {
  try {
    const binanceSymbol = symbol.replace('/', '').toUpperCase();
    
    const response = await fetch(
      `${BINANCE_API_BASE}/depth?symbol=${binanceSymbol}&limit=20`,
      { 
        next: { revalidate: 2 },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (!response.ok) {
      console.warn(`Binance depth API error: ${response.status}`);
      return null;
    }
    
    const data: BinanceDepthResponse = await response.json();
    
    return {
      symbol: binanceSymbol,
      bids: data.bids.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
      asks: data.asks.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching Binance order book:', error);
    return null;
  }
}

/**
 * Execute trade on Binance
 * NOTE: This requires API keys and is NOT implemented for security
 * In production, this would use authenticated endpoints
 */
export async function executeBinanceTrade(
  symbol: string,
  side: 'buy' | 'sell',
  quantity: number,
  type: 'market' | 'limit',
  price?: number
): Promise<any> {
  // This requires API keys and signature - not implementing in demo
  throw new Error('Trade execution requires API keys - not implemented in demo mode');
}

/**
 * Get price for a single symbol from Binance
 * Convenience wrapper around getBinancePrices
 */
export async function getBinancePrice(symbol: string): Promise<number> {
  const prices = await getBinancePrices([symbol]);
  if (prices.length === 0) {
    throw new Error(`Failed to fetch price for ${symbol}`);
  }
  return prices[0].price;
}

/**
 * Get orderbook for a single symbol (re-export with simplified return type)
 */
export async function getBinanceOrderbook(symbol: string): Promise<{bids: [number, number][], asks: [number, number][]}> {
  const orderbook = await getBinanceOrderBook(symbol);
  if (!orderbook) {
    throw new Error(`Failed to fetch orderbook for ${symbol}`);
  }
  return {
    bids: orderbook.bids,
    asks: orderbook.asks
  };
}

/**
 * Get 24hr ticker statistics from Binance
 */
export async function getBinance24hrStats(symbol: string) {
  try {
    const binanceSymbol = symbol.replace('/', '').toUpperCase();
    
    const response = await fetch(
      `${BINANCE_API_BASE}/ticker/24hr?symbol=${binanceSymbol}`,
      { 
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000)
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      symbol: binanceSymbol,
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      weightedAvgPrice: parseFloat(data.weightedAvgPrice),
      lastPrice: parseFloat(data.lastPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteVolume),
      openTime: new Date(data.openTime),
      closeTime: new Date(data.closeTime),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice)
    };
  } catch (error) {
    console.error('Error fetching 24hr stats:', error);
    return null;
  }
}
