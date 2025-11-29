"use client";

import React, { useEffect, useState } from "react";
import MultiExchangePriceTicker from "@/components/MultiExchangePriceTicker";
import ArbitrageHeatmap from "@/components/ArbitrageHeatmap";
import ExecutionLog from "@/components/ExecutionLog";
import { Wallet, TrendingUp, Activity, Play, Square } from "lucide-react";

export default function DashboardPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    profit24h: 0,
    activeAgents: 0,
    runnerActive: false
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch Prices
      const pricesRes = await fetch('/api/prices?symbols=BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT');
      const pricesData = await pricesRes.json();
      if (pricesData.success) {
        // Transform the data to match component expectations
        const transformedPrices = pricesData.data.map((item: any) => ({
          symbol: item.symbol,
          binancePrice: item.binancePrice,
          indianPrice: item.indianPrice,
          spreadPct: item.spreads?.binanceVsIndian || 0
        }));
        setPrices(transformedPrices);
      }

      // 2. Fetch Opportunities
      const oppsRes = await fetch('/api/arbitrage/detect?symbols=BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT');
      const oppsData = await oppsRes.json();
      if (oppsData.success) {
        setOpportunities(oppsData.opportunities);
      }

      // 3. Fetch State (Portfolio, Logs, Runner)
      const stateRes = await fetch('/api/state');
      const stateData = await stateRes.json();
      
      if (stateData) {
        setStats({
          totalBalance: stateData.portfolio?.totalValue || 0,
          profit24h: (stateData.portfolio?.totalValue || 0) - 100000, // Assuming 100k start
          activeAgents: 5, // Fixed for now
          runnerActive: stateData.runnerStatus?.isRunning || false
        });
        
        // Use recent execution logs if available, or fetch from audit logs
        if (stateData.executionLogRecent) {
          // Transform execution logs to display format
          const displayLogs = stateData.executionLogRecent.map((exec: any) => ({
            id: exec.executionId,
            timestamp: new Date(exec.completedAt || exec.startTime).getTime(),
            action: exec.status === 'completed' ? 'ARB_EXECUTE' : exec.status.toUpperCase(),
            details: {
              symbol: exec.buyOrder?.symbol,
              netProfit: exec.profit,
              opportunity: exec.buyOrder?.symbol
            },
            eventType: exec.status
          })).reverse();
          setLogs(displayLogs);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  const toggleRunner = async () => {
    try {
      if (stats.runnerActive) {
        await fetch('/api/agents/runner/stop', { method: 'POST' });
      } else {
        await fetch('/api/agents/runner/start', { 
          method: 'POST',
          body: JSON.stringify({ pollMs: 3000 })
        });
      }
      // Refresh immediately
      fetchData();
    } catch (error) {
      console.error("Failed to toggle runner:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Ticker */}
      <MultiExchangePriceTicker prices={prices} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Total Balance</p>
            <p className="text-2xl font-bold text-white">
              ${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Total Profit</p>
            <p className={`text-2xl font-bold ${stats.profit24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.profit24h >= 0 ? '+' : ''}${stats.profit24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.runnerActive ? 'bg-emerald-500/10' : 'bg-zinc-500/10'}`}>
              <Activity className={`w-6 h-6 ${stats.runnerActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Autonomous Runner</p>
              <p className={`text-xl font-bold ${stats.runnerActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {stats.runnerActive ? 'ACTIVE' : 'STOPPED'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={toggleRunner}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
              stats.runnerActive 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            {stats.runnerActive ? (
              <>
                <Square className="w-4 h-4 fill-current" /> Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Heatmap - Spans 2 columns */}
        <div className="lg:col-span-2 h-full">
          <ArbitrageHeatmap opportunities={opportunities} />
        </div>
        
        {/* Execution Log - Spans 1 column */}
        <div className="h-full">
          <ExecutionLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
