"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface Opportunity {
  symbol: string;
  spreadPct: number;
  estimatedGrossProfitPct: number;
  binancePrice: number;
  indianPrice: number;
}

interface ArbitrageHeatmapProps {
  opportunities?: Opportunity[];
}

const ArbitrageHeatmap = ({ opportunities = [] }: ArbitrageHeatmapProps) => {
  // Fallback if no opportunities
  const displayOpps = opportunities.length > 0 ? opportunities : [];

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Arbitrage Heatmap
        </h3>
        <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/5">
          Live Updates
        </span>
      </div>

      {displayOpps.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          No opportunities detected
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {displayOpps.map((opp, i) => (
            <div 
              key={i}
              className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4"
            >
              <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>

              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-lg text-white">{opp.symbol}</span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  +{opp.spreadPct.toFixed(2)}%
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">Binance</span>
                  <span className="text-zinc-300">${opp.binancePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">Indian</span>
                  <span className="text-zinc-300">${opp.indianPrice.toLocaleString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">Est. Profit</span>
                  <span className="text-emerald-400 font-mono font-bold">{opp.estimatedGrossProfitPct.toFixed(2)}%</span>
                </div>
              </div>
              
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArbitrageHeatmap;
