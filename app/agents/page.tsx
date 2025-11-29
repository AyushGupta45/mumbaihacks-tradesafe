"use client";

import React, { useEffect, useState } from "react";
import AgentDebateViewer from "@/components/AgentDebateViewer";
import { Bot, Shield, BrainCircuit, TrendingUp, Zap, Activity } from "lucide-react";

export default function AgentsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [runnerActive, setRunnerActive] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch logs
      const logsRes = await fetch('/api/audit/logs?limit=50');
      const logsData = await logsRes.json();
      if (logsData.logs) {
        setLogs(logsData.logs.reverse()); // Oldest first for chat view
      }

      // Fetch runner status
      const stateRes = await fetch('/api/state');
      const stateData = await stateRes.json();
      if (stateData.runnerStatus) {
        setRunnerActive(stateData.runnerStatus.isRunning);
      }
    } catch (error) {
      console.error("Failed to fetch agent data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { name: "Price Discovery", role: "Market Scanner", status: "Active", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Risk Assessment", role: "Safety Guardian", status: "Active", icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "Capital Allocation", role: "Portfolio Manager", status: "Active", icon: BrainCircuit, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "Debate Agent", role: "Consensus Engine", status: "Active", icon: Activity, color: "text-pink-400", bg: "bg-pink-500/10" },
    { name: "Execution Engine", role: "Trade Executor", status: runnerActive ? "Active" : "Idle", icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Neural Network</h1>
          <p className="text-zinc-400">Real-time visualization of multi-agent reasoning and decision making</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-400">Network Synchronized</span>
        </div>
      </div>

      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        {agents.map((agent, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
            <div className={`w-12 h-12 rounded-xl ${agent.bg} flex items-center justify-center border border-white/5`}>
              <agent.icon className={`w-6 h-6 ${agent.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{agent.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                <span className="text-xs text-zinc-400">{agent.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Debate Viewer */}
      <div className="flex-1 min-h-0">
        <AgentDebateViewer logs={logs} />
      </div>
    </div>
  );
}
