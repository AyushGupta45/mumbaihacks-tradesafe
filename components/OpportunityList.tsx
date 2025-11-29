"use client";

import React from "react";
import { ArrowRight, TrendingUp, ShieldAlert, BrainCircuit, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Opportunity {
  id: string;
  symbol: string;
  spreadPct: number;
  estimatedGrossProfitPct: number;
  binancePrice: number;
  indianPrice: number;
  persistenceCount: number;
}

interface OpportunityListProps {
  opportunities?: Opportunity[];
  onAnalyze: (opp: Opportunity) => void;
  onDebate: (opp: Opportunity) => void;
  onExecute: (opp: Opportunity) => void;
  processingId?: string | null;
}

const OpportunityList = ({ 
  opportunities = [], 
  onAnalyze, 
  onDebate, 
  onExecute,
  processingId 
}: OpportunityListProps) => {
  
  if (opportunities.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Opportunities Detected</h3>
        <p className="text-zinc-400 max-w-md">
          The scanner is active and monitoring 50+ exchanges. New arbitrage opportunities will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Opportunities ({opportunities.length})
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/5 text-zinc-400">Filter</Button>
          <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/5 text-zinc-400">Sort</Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Pair</th>
              <th className="px-6 py-4 font-medium">Exchange Path</th>
              <th className="px-6 py-4 font-medium">Spread</th>
              <th className="px-6 py-4 font-medium">Est. Profit</th>
              <th className="px-6 py-4 font-medium">Persistence</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {opportunities.map((opp, i) => (
              <tr key={i} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-400">
                      {opp.symbol.replace('USDT', '')}
                    </div>
                    {opp.symbol}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span>Binance</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>Indian</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    +{opp.spreadPct.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-white">
                  {opp.estimatedGrossProfitPct.toFixed(2)}%
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${opp.persistenceCount > 5 ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                    <span className="text-zinc-400">{opp.persistenceCount} ticks</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-white/10 hover:bg-white/10 text-zinc-300"
                      onClick={() => onAnalyze(opp)}
                      disabled={!!processingId}
                    >
                      <ShieldAlert className="w-3 h-3 mr-1" /> Analyze
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-white/10 hover:bg-white/10 text-zinc-300"
                      onClick={() => onDebate(opp)}
                      disabled={!!processingId}
                    >
                      <BrainCircuit className="w-3 h-3 mr-1" /> Debate
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 bg-blue-600 hover:bg-blue-500 text-white"
                      onClick={() => onExecute(opp)}
                      disabled={!!processingId}
                    >
                      {processingId === opp.id ? (
                        <span className="animate-spin mr-1">⏳</span>
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      Execute
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpportunityList;
