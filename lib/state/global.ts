/**
 * Global State Manager - Singleton state store
 * Provides single source of truth for all application state
 */

import { loadState, saveState } from './store';
import type { Position } from './portfolio';
import type { ExecutionRecord } from './executionLog';
import type { AuditLogEntry, EnhancedAuditEntry } from './auditLog';
import type { SystemSettings } from './settings';

// Runner state interface
export interface RunnerState {
  isRunning: boolean;
  startTime?: string;
  pollCount: number;
  opportunitiesProcessed: number;
  executionsAttempted: number;
  executionsSuccessful: number;
  lastPollTime?: string;
  currentSymbols: string[];
}

// Guardian config interface
export interface GuardianConfig {
  maxTradePctOfPortfolio: number;
  dailyMaxTrades: number;
  globalMaxExposurePct: number;
  vetoconditions: {
    exchangeOutage: boolean;
    highVolatility: boolean;
  };
}

// Complete global state schema
export interface GlobalState {
  portfolio: {
    cash: number;
    positions: Position[];
    totalValue: number;
    lastUpdate: number;
  };
  executionLog: ExecutionRecord[];
  auditLog: AuditLogEntry[];
  enhancedAuditLog: EnhancedAuditEntry[];
  runner: RunnerState;
  guardianSettings: GuardianConfig;
  settings: SystemSettings;
  agents: {
    lastRisk?: any;
    lastAllocation?: any;
    lastDebate?: any;
    lastExecution?: any;
  };
}

// Default state
const DEFAULT_STATE: GlobalState = {
  portfolio: {
    cash: 100000,
    positions: [],
    totalValue: 100000,
    lastUpdate: Date.now(),
  },
  executionLog: [],
  auditLog: [],
  enhancedAuditLog: [],
  runner: {
    isRunning: false,
    pollCount: 0,
    opportunitiesProcessed: 0,
    executionsAttempted: 0,
    executionsSuccessful: 0,
    currentSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
  },
  guardianSettings: {
    maxTradePctOfPortfolio: 0.15,
    dailyMaxTrades: 30,
    globalMaxExposurePct: 0.5,
    vetoconditions: {
      exchangeOutage: true,
      highVolatility: true,
    },
  },
  settings: {
    autoMode: false,
    binanceTestnet: true,
    indianExchange: {
      enabled: true,
      priceDriftPercent: 0.5,
      outageSimulated: false,
      liquidityMultiplier: 1.0,
    },
    nseExchange: {
      enabled: true,
      priceDriftPercent: 0.3,
      outageSimulated: false,
    },
    maxPositionSize: 10000,
    maxPortfolioRisk: 0.05,
    minSpreadPercent: 0.2,
    partialFillsEnabled: true,
    hedgingEnabled: true,
    runnerActive: false,
    detectionIntervalMs: 5000,
  },
  agents: {},
};

// Singleton state instance
let globalState: GlobalState | null = null;

/**
 * Initialize and return the global state
 */
function initState(): GlobalState {
  if (!globalState) {
    globalState = loadState<GlobalState>(DEFAULT_STATE);
    console.log('[GlobalState] Initialized from disk');
  }
  return globalState;
}

/**
 * Get the current global state (read-only)
 */
export function getState(): GlobalState {
  return initState();
}

/**
 * Update global state with partial updates and persist to disk
 */
export function setState(updates: Partial<GlobalState>): GlobalState {
  const state = initState();
  
  // Deep merge for nested objects
  Object.keys(updates).forEach(key => {
    const value = updates[key as keyof GlobalState];
    if (value !== undefined) {
      (state as any)[key] = value;
    }
  });
  
  // Persist to disk
  saveState(state);
  
  return state;
}

/**
 * Update a specific section of state
 */
export function updateState<K extends keyof GlobalState>(
  key: K,
  value: GlobalState[K]
): GlobalState {
  const state = initState();
  state[key] = value;
  saveState(state);
  return state;
}

/**
 * Get state file location (for debugging)
 */
export function getStateInfo() {
  return {
    initialized: globalState !== null,
    state: globalState,
  };
}
