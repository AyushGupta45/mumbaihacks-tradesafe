/**
 * Audit Log State
 * Now uses global persistent state
 */

import { getState, updateState } from './global';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: "detection" | "debate" | "risk_assessment" | "allocation" | "execution" | "system";
  agentName?: string;
  component?: string;
  opportunityId?: string;
  action: string;
  details: Record<string, any>;
  decision?: {
    outcome: string;
    reasoning: string;
    confidence?: number;
  };
  metadata?: Record<string, any>;
}

export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const logEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    ...entry,
  };
  
  const state = getState();
  state.auditLog.push(logEntry);
  updateState('auditLog', state.auditLog);
  
  return logEntry;
}

export function getAuditLog(filters?: {
  eventType?: string;
  agentName?: string;
  opportunityId?: string;
  limit?: number;
}): AuditLogEntry[] {
  let filtered = [...getState().auditLog];

  if (filters) {
    if (filters.eventType) {
      filtered = filtered.filter((entry) => entry.eventType === filters.eventType);
    }
    if (filters.agentName) {
      filtered = filtered.filter((entry) => entry.agentName === filters.agentName);
    }
    if (filters.opportunityId) {
      filtered = filtered.filter((entry) => entry.opportunityId === filters.opportunityId);
    }
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }
  }

  return filtered;
}

export function clearAuditLog(): void {
  updateState('auditLog', []);
}

// Enhanced audit entry for complete arbitrage flow
export interface EnhancedAuditEntry {
  id: string;
  timestamp: Date;
  symbol: string;
  opportunity: any;
  agentsOutputs: {
    priceDiscovery?: any;
    riskAssessment?: any;
    capitalAllocation?: any;
    debateStructured?: any;
    debateRaw?: string;
  };
  guardianDecision: {
    passed: boolean;
    reason: string[];
  };
  finalDecision: {
    decision: string;
    score: number;
  };
  executionResult?: any;
}

export function addEnhancedAudit(entry: Omit<EnhancedAuditEntry, 'id' | 'timestamp'>): EnhancedAuditEntry {
  const enhancedEntry: EnhancedAuditEntry = {
    id: `enhanced_audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date(),
    ...entry
  };
  
  const state = getState();
  state.enhancedAuditLog.push(enhancedEntry);
  
  // Keep only last 100 entries
  if (state.enhancedAuditLog.length > 100) {
    state.enhancedAuditLog.shift();
  }
  
  updateState('enhancedAuditLog', state.enhancedAuditLog);
  return enhancedEntry;
}

export function getEnhancedAuditLog(limit: number = 20): EnhancedAuditEntry[] {
  const enhancedAuditLog = getState().enhancedAuditLog;
  return enhancedAuditLog.slice(-limit);
}
