"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchMarketData } from "@/hooks/useMarketData";
import Link from "next/link";

const MarketOverview = () => {
  const { marketData } = useFetchMarketData();

  // Loading state
  if (!marketData) {
    return (
      <div className="glass-card p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-white">Market Overview</h3>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/30 transition-colors"
            />
          </div>
          <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-zinc-400">
            Filter
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Pair</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">24h Change</th>
              <th className="px-6 py-4 font-medium">24h Volume</th>
              <th className="px-6 py-4 font-medium">24h High</th>
              <th className="px-6 py-4 font-medium">24h Low</th>
              <th className="px-6 py-4 font-medium text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {marketData.map((market, i) => {
              const isUp = market.priceChangePercentage24h >= 0;
              return (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <Link href={`/markets/${market.symbol}`} className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        <img 
                          src={market.image}
                          alt={market.symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.classList.add('fallback-icon');
                          }}
                        />
                        <span className="text-[10px] font-bold text-white hidden fallback-text">
                          {market.symbol.substring(0, 1)}
                        </span>
                      </div>
                      {market.symbol.replace("USDT", "/USDT")}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300">
                    ${market.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span className="font-bold">{Math.abs(market.priceChangePercentage24h).toFixed(2)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    ${(market.volume * market.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    ${market.high24h.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    ${market.low24h.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Mini Sparkline Visualization using real historical data if available, else random */}
                    <div className="w-24 h-8 ml-auto flex items-end gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      {(market.historicalData?.length > 0 ? market.historicalData : [...Array(12)]).slice(-12).map((d, j) => (
                        <div 
                          key={j} 
                          className={`w-1.5 rounded-t-sm ${isUp ? "bg-emerald-500" : "bg-red-500"}`}
                          style={{ height: `${d ? ((d.price - market.low24h) / (market.high24h - market.low24h)) * 100 : Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;
