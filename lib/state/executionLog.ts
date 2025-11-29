/**
 * Execution Log State
 * Now uses global persistent state
 */

import { getState, updateState } from './global';

export interface ExecutionRecord {
  id: string;
  opportunityId?: string;
  symbol: string;
  action?: "buy" | "sell";
  type?: "arbitrage" | "single";
  exchange?: string;
  quantity?: number;
  price?: number;
  timestamp: number | Date;
  status: "pending" | "executing" | "filled" | "partial" | "completed" | "failed";
  fillQuantity?: number;
  fees?: number;
  error?: string;
  // Arbitrage-specific fields
  buyExchange?: string;
  sellExchange?: string;
  buyPrice?: number;
  buyQty?: number;
  sellPrice?: number;
  sellQty?: number;
  profit?: number;
  partialFill?: boolean;
  completedAt?: Date;
}

export function addExecutionRecord(record: ExecutionRecord): void {
  const state = getState();
  state.executionLog.push(record);
  updateState('executionLog', state.executionLog);
}

export function getExecutionLog(limit?: number): ExecutionRecord[] {
  const executionLog = getState().executionLog;
  if (limit) {
    return executionLog.slice(-limit);
  }
  return [...executionLog];
}

export function getExecutionById(id: string): ExecutionRecord | undefined {
  return getState().executionLog.find((record) => record.id === id);
}

export function updateExecutionRecord(id: string, updates: Partial<ExecutionRecord>): void {
  const state = getState();
  const index = state.executionLog.findIndex((record) => record.id === id);
  if (index >= 0) {
    state.executionLog[index] = { ...state.executionLog[index], ...updates };
    updateState('executionLog', state.executionLog);
  }
}
