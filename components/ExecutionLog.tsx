"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, Activity } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: number;
  action: string;
  details: any;
  eventType: string;
}

interface ExecutionLogProps {
  logs?: LogEntry[];
}

const ExecutionLog = ({ logs = [] }: ExecutionLogProps) => {
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-zinc-400 font-mono text-sm">~/logs</span>
        Execution History
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-zinc-500 text-center py-4">No execution logs yet</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group">
              <div className="min-w-[20px]">
                {log.action.includes("completed") || log.action.includes("success") ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : log.action.includes("failed") || log.action.includes("error") ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Activity className="w-4 h-4 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    log.action.includes("buy") ? "bg-emerald-500/20 text-emerald-400" :
                    log.action.includes("sell") ? "bg-red-500/20 text-red-400" :
                    "bg-zinc-500/20 text-zinc-400"
                  }`}>
                    {log.action.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">
                    {log.details?.symbol || log.details?.opportunity || "System"}
                  </span>
                  <span className="text-xs text-zinc-500 truncate max-w-[120px]">
                    {log.eventType}
                  </span>
                </div>
              </div>
              
              {log.details?.netProfit && (
                <div className="text-right">
                  <span className="text-emerald-400 font-mono text-sm font-bold">
                    +${parseFloat(log.details.netProfit).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExecutionLog;
