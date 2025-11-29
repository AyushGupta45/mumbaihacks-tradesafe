"use client";

import React from "react";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SpreadCard = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">BTC/USDT Spread</h3>
          <p className="text-sm text-zinc-400">High probability opportunity detected</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm animate-pulse">
          Live
        </span>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        {/* Exchange A */}
        <div className="text-center z-10">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-[#F3BA2F]/10 border border-[#F3BA2F]/20 flex items-center justify-center">
            <span className="font-bold text-[#F3BA2F]">B</span>
          </div>
          <p className="font-bold text-white">Binance</p>
          <p className="text-sm text-zinc-400">Buy @ $42,150</p>
        </div>

        {/* Visual Connector */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F3BA2F]/20 via-blue-500/50 to-[#0052FF]/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050505] px-3 py-1 rounded-full border border-white/10 z-10">
          <span className="text-emerald-400 font-bold text-sm">+1.2%</span>
        </div>

        {/* Exchange B */}
        <div className="text-center z-10">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center">
            <span className="font-bold text-[#0052FF]">C</span>
          </div>
          <p className="font-bold text-white">Coinbase</p>
          <p className="text-sm text-zinc-400">Sell @ $42,655</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Gross Profit</span>
          <span className="text-white font-mono">$505.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Fees (Est.)</span>
          <span className="text-red-400 font-mono">-$85.00</span>
        </div>
        <div className="h-px bg-white/5 my-2" />
        <div className="flex justify-between text-sm font-bold">
          <span className="text-zinc-300">Net Profit</span>
          <span className="text-emerald-400 font-mono text-lg">$420.00</span>
        </div>
      </div>

      <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 h-12 rounded-xl font-bold transition-all hover:scale-[1.02]">
        Execute Trade Sequence <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};

export default SpreadCard;
