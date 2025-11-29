"use client";

import React from "react";
import { PieChart } from "lucide-react";

interface AllocationChartProps {
  portfolio?: {
    totalValue: number;
    usdtBalance: number;
    positions: Record<string, any>;
  };
}

const AllocationChart = ({ portfolio }: AllocationChartProps) => {
  const totalValue = portfolio?.totalValue || 1;
  const usdtBalance = portfolio?.usdtBalance || 0;
  
  // Calculate allocations
  const allocations = [
    { 
      asset: "USDT", 
      amount: usdtBalance, 
      percent: (usdtBalance / totalValue) * 100,
      color: "bg-blue-500" 
    },
    ...Object.entries(portfolio?.positions || {}).map(([symbol, pos]: [string, any], i) => {
      const colors = ["bg-orange-500", "bg-purple-500", "bg-emerald-500", "bg-pink-500", "bg-yellow-500"];
      const value = pos.quantity * pos.currentPrice; // Approximate value if currentPrice available, else use entryPrice
      return {
        asset: symbol,
        amount: value,
        percent: (value / totalValue) * 100,
        color: colors[i % colors.length]
      };
    })
  ].sort((a, b) => b.amount - a.amount);

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-zinc-400" />
          Asset Allocation
        </h3>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View Details</button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Visual Chart Representation */}
        <div className="relative w-48 h-48 rounded-full border-8 border-white/5 flex items-center justify-center">
           {/* Simple CSS Conic Gradient for visualization - simplified for dynamic data */}
           <div 
             className="absolute inset-0 rounded-full opacity-80"
             style={{
               background: `conic-gradient(
                 #3b82f6 0% ${allocations[0]?.percent || 0}%, 
                 #f97316 ${allocations[0]?.percent || 0}% 100%
               )`
             }}
           />
           <div className="absolute inset-4 bg-[#0A0A0A] rounded-full flex flex-col items-center justify-center z-10">
             <span className="text-zinc-400 text-xs">Total Assets</span>
             <span className="text-white font-bold text-lg">{allocations.length} Assets</span>
           </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-3">
          {allocations.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm font-medium text-zinc-300">{item.asset}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-400">
                  ${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-sm font-bold text-white w-12 text-right">
                  {item.percent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;
