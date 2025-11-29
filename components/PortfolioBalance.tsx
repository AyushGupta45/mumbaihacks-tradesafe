"use client";

import React from "react";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PortfolioBalanceProps {
  portfolio?: {
    totalValue: number;
    usdtBalance: number;
    positions: Record<string, any>;
  };
}

const PortfolioBalance = ({ portfolio }: PortfolioBalanceProps) => {
  const totalValue = portfolio?.totalValue || 100000;
  const usdtBalance = portfolio?.usdtBalance || 100000;
  const inTrade = totalValue - usdtBalance;
  const initialBalance = 100000; // Assuming 100k start
  const profit = totalValue - initialBalance;
  const profitPct = (profit / initialBalance) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Balance Card */}
      <div className="glass-card p-6 md:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-zinc-400 font-medium">Total Portfolio Value</span>
          </div>
          
          <div className="flex items-end gap-4 mb-6">
            <h2 className="text-5xl font-bold text-white tracking-tight">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className={`flex items-center gap-1 mb-2 px-2 py-1 rounded border text-sm font-bold ${
              profit >= 0 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{profit >= 0 ? '+' : ''}{profitPct.toFixed(2)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/5">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Available Liquidity</p>
              <p className="text-xl font-bold text-white">
                ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">In Active Trades</p>
              <p className="text-xl font-bold text-blue-400">
                ${inTrade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Total Profit (All Time)</p>
              <p className={`text-xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Card */}
      <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
        <div className={`absolute bottom-0 left-0 p-24 rounded-full blur-3xl -ml-12 -mb-12 ${
          profit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              profit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              <TrendingUp className={`w-5 h-5 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded">All Time</span>
          </div>
          
          <div>
            <p className="text-zinc-400 font-medium mb-1">Net Profit</p>
            <h3 className={`text-3xl font-bold mb-2 ${profit >= 0 ? 'text-white' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}${profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-sm text-zinc-500">
              <span className={`${profit >= 0 ? 'text-emerald-400' : 'text-red-400'} font-bold`}>
                {Object.keys(portfolio?.positions || {}).length} active
              </span> positions currently open
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBalance;
