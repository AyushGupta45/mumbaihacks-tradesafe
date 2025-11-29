"use client";

import React, { useEffect, useState } from "react";
import PortfolioBalance from "@/components/PortfolioBalance";
import AllocationChart from "@/components/AllocationChart";
import { ArrowRight, History } from "lucide-react";

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const stateRes = await fetch('/api/state');
      const stateData = await stateRes.json();
      
      if (stateData.portfolio) {
        // Transform portfolio data to match component expectations
        const transformedPortfolio = {
          totalValue: stateData.portfolio.totalValue,
          usdtBalance: stateData.portfolio.cash, // Map cash to usdtBalance
          positions: stateData.portfolio.positions || []
        };
        setPortfolio(transformedPortfolio);
      }

      if (stateData.executionLogRecent) {
        setTransactions(stateData.executionLogRecent.map((exec: any) => ({
          type: exec.status === 'completed' ? 'Trade Profit' : 'Execution',
          asset: exec.symbol || 'USDT',
          amount: exec.profit ? `+$${exec.profit.toFixed(2)}` : '$0.00',
          status: exec.status,
          time: new Date(exec.completedAt || exec.timestamp).toLocaleTimeString('en-US')
        })).reverse());
      }
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Management</h1>
          <p className="text-zinc-400">Track assets, performance, and capital allocation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors border border-white/5">
          <History className="w-4 h-4" />
          Transaction History
        </button>
      </div>

      <PortfolioBalance portfolio={portfolio} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart portfolio={portfolio} />
        
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-zinc-500 text-center py-4">No recent transactions</div>
            ) : (
              transactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type.includes("Deposit") || tx.type.includes("Profit") ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-400"
                    }`}>
                      <ArrowRight className={`w-5 h-5 ${tx.type.includes("Deposit") || tx.type.includes("Profit") ? "-rotate-45" : "rotate-45"}`} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{tx.type}</p>
                      <p className="text-xs text-zinc-500">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold text-sm ${
                      tx.type.includes("Deposit") || tx.type.includes("Profit") ? "text-emerald-400" : "text-white"
                    }`}>
                      {tx.amount}
                    </p>
                    <p className="text-xs text-zinc-500">{tx.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
