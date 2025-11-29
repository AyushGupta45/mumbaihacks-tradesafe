/**
 * System Settings State
 * Now uses global persistent state
 */

import { getState, updateState } from './global';

export interface SystemSettings {
  autoMode: boolean;
  binanceTestnet: boolean;
  
  // Exchange simulation parameters
  indianExchange: {
    enabled: boolean;
    priceDriftPercent: number;
    outageSimulated: boolean;
    liquidityMultiplier: number;
  };
  
  nseExchange: {
    enabled: boolean;
    priceDriftPercent: number;
    outageSimulated: boolean;
  };
  
  // Risk parameters
  maxPositionSize: number;
  maxPortfolioRisk: number;
  minSpreadPercent: number;
  
  // Execution parameters
  partialFillsEnabled: boolean;
  hedgingEnabled: boolean;
  
  // Runner parameters
  runnerActive: boolean;
  detectionIntervalMs: number;
}

export function getSettings(): SystemSettings {
  return { ...getState().settings };
}

export function updateSettings(updates: Partial<SystemSettings>): SystemSettings {
  const currentSettings = getState().settings;
  const updatedSettings = { ...currentSettings, ...updates };
  updateState('settings', updatedSettings);
  return { ...updatedSettings };
}

export function updateIndianExchangeSettings(updates: Partial<SystemSettings["indianExchange"]>): void {
  const settings = getState().settings;
  settings.indianExchange = { ...settings.indianExchange, ...updates };
  updateState('settings', settings);
}

export function updateNseExchangeSettings(updates: Partial<SystemSettings["nseExchange"]>): void {
  const settings = getState().settings;
  settings.nseExchange = { ...settings.nseExchange, ...updates };
  updateState('settings', settings);
}

export function toggleAutoMode(): boolean {
  const settings = getState().settings;
  settings.autoMode = !settings.autoMode;
  updateState('settings', settings);
  return settings.autoMode;
}
