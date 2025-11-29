/**
 * Portfolio State Management
 * Now uses global persistent state
 */

import { getState, updateState } from './global';

export interface Position {
  symbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  unrealizedPnL?: number;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
  totalValue: number;
  lastUpdate: number;
}

export function getPortfolio(): Portfolio {
  return { ...getState().portfolio };
}

export function updatePortfolio(updates: Partial<Portfolio>): Portfolio {
  const currentPortfolio = getState().portfolio;
  const updatedPortfolio = {
    ...currentPortfolio,
    ...updates,
    lastUpdate: Date.now(),
  };
  
  updateState('portfolio', updatedPortfolio);
  return { ...updatedPortfolio };
}

export function addPosition(position: Position): void {
  const state = getState();
  const portfolio = state.portfolio;
  
  const existingIndex = portfolio.positions.findIndex(
    (p) => p.symbol === position.symbol && p.exchange === position.exchange
  );
  
  if (existingIndex >= 0) {
    portfolio.positions[existingIndex] = position;
  } else {
    portfolio.positions.push(position);
  }
  
  portfolio.lastUpdate = Date.now();
  updateState('portfolio', portfolio);
}

export function removePosition(symbol: string, exchange: string): void {
  const state = getState();
  const portfolio = state.portfolio;
  
  portfolio.positions = portfolio.positions.filter(
    (p) => !(p.symbol === symbol && p.exchange === exchange)
  );
  portfolio.lastUpdate = Date.now();
  
  updateState('portfolio', portfolio);
}

// TODO: Add more portfolio management functions
