// Coin definitions for market data
export const coindata = [
  {
    symbol: "BTCUSDT",
    baseAsset: "BTC",
    quoteAsset: "USDT",
    name: "Bitcoin",
  },
  {
    symbol: "ETHUSDT",
    baseAsset: "ETH",
    quoteAsset: "USDT",
    name: "Ethereum",
  },
  {
    symbol: "BNBUSDT",
    baseAsset: "BNB",
    quoteAsset: "USDT",
    name: "Binance Coin",
  },
  {
    symbol: "SOLUSDT",
    baseAsset: "SOL",
    quoteAsset: "USDT",
    name: "Solana",
  },
  {
    symbol: "ADAUSDT",
    baseAsset: "ADA",
    quoteAsset: "USDT",
    name: "Cardano",
  },
  {
    symbol: "XRPUSDT",
    baseAsset: "XRP",
    quoteAsset: "USDT",
    name: "Ripple",
  },
  {
    symbol: "DOGEUSDT",
    baseAsset: "DOGE",
    quoteAsset: "USDT",
    name: "Dogecoin",
  },
  {
    symbol: "DOTUSDT",
    baseAsset: "DOT",
    quoteAsset: "USDT",
    name: "Polkadot",
  },
  {
    symbol: "MATICUSDT",
    baseAsset: "MATIC",
    quoteAsset: "USDT",
    name: "Polygon",
  },
  {
    symbol: "AVAXUSDT",
    baseAsset: "AVAX",
    quoteAsset: "USDT",
    name: "Avalanche",
  },
];

// Technical indicator definitions
export const PrimaryIndicators = [
  { name: "SMA", description: "Simple Moving Average" },
  { name: "EMA", description: "Exponential Moving Average" },
  { name: "Bollinger Bands", description: "Volatility indicator" },
  { name: "VWAP", description: "Volume Weighted Average Price" },
];

export const SecondaryIndicators = [
  { name: "RSI", description: "Relative Strength Index" },
  { name: "MACD", description: "Moving Average Convergence Divergence" },
  { name: "Stochastic", description: "Momentum indicator" },
  { name: "Volume", description: "Trading volume" },
  { name: "OBV", description: "On-Balance Volume" },
];

