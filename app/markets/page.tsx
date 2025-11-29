"use client";

import React from "react";
import MarketOverview from "@/components/MarketOverview";
import { LineChart, BarChart3, PieChart } from "lucide-react";

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
          <p className="text-zinc-400">Global market data aggregation and analysis</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <LineChart className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-transparent hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-transparent hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
            <PieChart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Global Market Cap", value: "$1.64T", change: "+1.2%", up: true },
          { label: "24h Volume", value: "$48.2B", change: "-5.4%", up: false },
          { label: "BTC Dominance", value: "52.1%", change: "+0.1%", up: true },
          { label: "ETH Gas", value: "24 Gwei", change: "-12%", up: false },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <span className={`text-xs font-bold ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Market Table */}
      <MarketOverview />
    </div>
  );
}
