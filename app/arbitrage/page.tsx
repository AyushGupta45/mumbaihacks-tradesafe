"use client";

import React, { useEffect, useState } from "react";
import OpportunityList from "@/components/OpportunityList";
import SpreadCard from "@/components/SpreadCard";
import { SlidersHorizontal, BrainCircuit, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArbitragePage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [debateResult, setDebateResult] = useState<any>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/arbitrage/detect?symbols=BTCUSDT,ETHUSDT,BNBUSDT,SOLUSDT,XRPUSDT');
      const data = await res.json();
      if (data.success) {
        setOpportunities(data.opportunities);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    const interval = setInterval(fetchOpportunities, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (opp: any) => {
    setProcessingId(opp.id);
    setAnalysisResult(null);
    try {
      // 1. Risk Assessment
      const riskRes = await fetch('/api/agents/risk', {
        method: 'POST',
        body: JSON.stringify({ opportunity: opp, targetQuantity: 1 })
      });
      const risk = await riskRes.json();

      if (!risk.success) {
        console.error("Risk assessment failed:", risk.error);
        setAnalysisResult({ error: risk.error || "Risk assessment failed" });
        return;
      }

      // 2. Capital Allocation
      const allocRes = await fetch('/api/agents/allocate', {
        method: 'POST',
        body: JSON.stringify({ 
          opportunity: opp, 
          risk: risk.assessment, 
          portfolio: { usdtBalance: 100000, maxTradeAmount: 5000 } 
        })
      });
      const allocation = await allocRes.json();

      if (!allocation.success) {
        console.error("Allocation failed:", allocation.error);
        setAnalysisResult({ risk: risk.assessment, error: allocation.error || "Allocation failed" });
        return;
      }

      setAnalysisResult({ risk: risk.assessment, allocation: allocation.allocation });
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult({ error: "Analysis failed due to network error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDebate = async (opp: any) => {
    setProcessingId(opp.id);
    setDebateResult(null);
    try {
      // Need risk/alloc first
      const riskRes = await fetch('/api/agents/risk', {
        method: 'POST',
        body: JSON.stringify({ opportunity: opp, targetQuantity: 1 })
      });
      const risk = await riskRes.json();
      
      if (!risk.success) {
        setDebateResult({ error: "Risk assessment failed, cannot debate" });
        return;
      }

      const allocRes = await fetch('/api/agents/allocate', {
        method: 'POST',
        body: JSON.stringify({ 
          opportunity: opp, 
          risk: risk.assessment, 
          portfolio: { usdtBalance: 100000, maxTradeAmount: 5000 } 
        })
      });
      const allocation = await allocRes.json();

      if (!allocation.success) {
        setDebateResult({ error: "Allocation failed, cannot debate" });
        return;
      }

      const debateRes = await fetch('/api/agents/debate', {
        method: 'POST',
        body: JSON.stringify({ opportunity: opp, risk: risk.assessment, allocation: allocation.allocation })
      });
      const debate = await debateRes.json();
      
      setDebateResult(debate);
    } catch (error) {
      console.error("Debate failed:", error);
      setDebateResult({ error: "Debate failed due to network error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecute = async (opp: any) => {
    setProcessingId(opp.id);
    setExecutionResult(null);
    try {
      const execRes = await fetch('/api/arbitrage/execute', {
        method: 'POST',
        body: JSON.stringify({ opportunity: opp, allocatedUSDT: 1000 }) // Default 1000 for demo
      });
      const result = await execRes.json();
      setExecutionResult(result);
      
      // Refresh opportunities
      fetchOpportunities();
    } catch (error) {
      console.error("Execution failed:", error);
      setExecutionResult({ success: false, error: "Execution failed due to network error" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Arbitrage Scanner</h1>
          <p className="text-zinc-400">Real-time opportunity detection across 50+ exchanges</p>
        </div>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-300 gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Configure Scanners
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List - Spans 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <OpportunityList 
            opportunities={opportunities}
            onAnalyze={handleAnalyze}
            onDebate={handleDebate}
            onExecute={handleExecute}
            processingId={processingId}
          />

          {/* Analysis Result Card */}
          {analysisResult && !analysisResult.error && analysisResult.risk && analysisResult.allocation && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Risk & Allocation Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-zinc-400">Risk Score</p>
                  <p className={`text-2xl font-bold ${analysisResult.risk.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {analysisResult.risk.riskScore}/100
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{analysisResult.risk.notes?.[0] || "No risk notes available"}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-zinc-400">Recommended Allocation</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${analysisResult.allocation.allocatedUSDT?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{analysisResult.allocation.reasoning || "No reasoning provided"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Error */}
          {analysisResult && analysisResult.error && (
            <div className="glass-card p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
              <p className="text-red-400">{analysisResult.error}</p>
            </div>
          )}

          {/* Debate Result Card */}
          {debateResult && debateResult.debate && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-top-4 border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                Agent Debate Consensus
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Final Decision</span>
                  <span className={`px-3 py-1 rounded font-bold ${
                    debateResult.debate.decision === 'execute' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {debateResult.debate.decision.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Consensus Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${debateResult.debate.finalDecisionScore * 100}%` }} 
                      />
                    </div>
                    <span className="text-white font-mono">{debateResult.debate.finalDecisionScore.toFixed(2)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-4">
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <p className="font-bold text-emerald-400 mb-1">Bullish</p>
                    <p className="text-zinc-400 line-clamp-2">{debateResult.debate.bullish.reasons[0]}</p>
                  </div>
                  <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                    <p className="font-bold text-red-400 mb-1">Bearish</p>
                    <p className="text-zinc-400 line-clamp-2">{debateResult.debate.bearish.reasons[0]}</p>
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                    <p className="font-bold text-blue-400 mb-1">Neutral</p>
                    <p className="text-zinc-400 line-clamp-2">{debateResult.debate.neutral.reasons[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State for Debate */}
          {debateResult && !debateResult.debate && (
             <div className="glass-card p-6 border-l-4 border-red-500">
               <h3 className="text-lg font-bold text-white mb-2">Debate Failed</h3>
               <p className="text-red-400">{debateResult.error || "Unknown error occurred during debate"}</p>
             </div>
          )}

          {/* Execution Result Card */}
          {executionResult && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-top-4 border-l-4 border-emerald-500">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Execution Result
              </h3>
              {executionResult.success ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Net Profit</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      +${executionResult.netProfit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Slippage</p>
                    <p className="text-xl font-bold text-white">
                      {executionResult.slippagePct.toFixed(3)}%
                    </p>
                  </div>
                  <div className="col-span-2 text-xs font-mono text-zinc-500 mt-2">
                    ID: {executionResult.auditId}
                  </div>
                </div>
              ) : (
                <div className="text-red-400">
                  <p className="font-bold">Execution Failed</p>
                  <p className="text-sm">{executionResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Spans 1 column */}
        <div className="space-y-6">
          <SpreadCard />
          
          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Scanner Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Active Pairs</span>
                <span className="text-sm font-mono text-blue-400">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Exchanges</span>
                <span className="text-sm font-mono text-blue-400">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">Latency</span>
                <span className="text-sm font-mono text-emerald-400">45ms</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500 animate-pulse" />
              </div>
              <p className="text-xs text-zinc-500 text-center">Scanning in progress...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
