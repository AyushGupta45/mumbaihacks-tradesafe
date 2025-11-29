/**
 * Arbitrage Types and Interfaces
 * Shared type definitions for the arbitrage system
 */

export interface ArbitrageOpportunity {
  id: string;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercent: number;
  potentialProfit: number;
  timestamp: number;
  status: "detected" | "analyzing" | "executing" | "completed" | "failed";
}

export interface ExchangePrice {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

// TODO: Add more types as needed
