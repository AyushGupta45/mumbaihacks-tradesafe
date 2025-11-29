"use client";

import React, { useEffect, useRef } from "react";
import { Bot, Shield, TrendingUp, BrainCircuit, Zap, Activity } from "lucide-react";

interface DebateMessage {
  agent: string;
  role: string;
  icon: any;
  color: string;
  bg: string;
  message: string;
  time: string;
}

interface AgentDebateViewerProps {
  logs?: any[];
}

const AgentDebateViewer = ({ logs = [] }: AgentDebateViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Transform logs to messages if needed, or expect pre-transformed
  const messages: DebateMessage[] = logs.map(log => {
    let icon = Bot;
    let color = "text-zinc-400";
    let bg = "bg-zinc-500/10";
    let role = "System";

    if (log.agentName === "Price Discovery" || log.component === "priceDiscovery") {
      icon = TrendingUp;
      color = "text-blue-400";
      bg = "bg-blue-500/10";
      role = "Analyst";
    } else if (log.agentName === "Risk Assessment" || log.component === "riskAssessment") {
      icon = Shield;
      color = "text-purple-400";
      bg = "bg-purple-500/10";
      role = "Guardian";
    } else if (log.agentName === "Capital Allocation" || log.component === "capitalAllocation") {
      icon = BrainCircuit;
      color = "text-emerald-400";
      bg = "bg-emerald-500/10";
      role = "Manager";
    } else if (log.agentName === "Execution Engine" || log.component === "executionEngine") {
      icon = Zap;
      color = "text-orange-400";
      bg = "bg-orange-500/10";
      role = "Executor";
    } else if (log.agentName === "Debate Agent" || log.component === "debateAgent") {
      icon = Activity;
      color = "text-pink-400";
      bg = "bg-pink-500/10";
      role = "Moderator";
    }

    // Format message from details
    let messageText = log.action;
    if (log.details) {
      if (log.details.message) messageText = log.details.message;
      else if (log.details.reason) messageText = `${log.action}: ${log.details.reason}`;
      else if (log.details.netProfit) messageText = `Execution completed. Profit: $${parseFloat(log.details.netProfit).toFixed(2)}`;
      else messageText = JSON.stringify(log.details);
    }

    return {
      agent: log.agentName || log.component || "System",
      role,
      icon,
      color,
      bg,
      message: messageText,
      time: new Date(log.timestamp).toLocaleTimeString()
    };
  });

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse absolute -right-0.5 -bottom-0.5 border-2 border-[#0A0A0A]" />
            <Bot className="w-8 h-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Agent Neural Network</h3>
            <p className="text-xs text-zinc-500">Live Reasoning Stream</p>
          </div>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 py-10">Waiting for agent activity...</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="flex gap-4 group animate-slide-up">
              <div className={`w-10 h-10 rounded-xl ${msg.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                <msg.icon className={`w-5 h-5 ${msg.color}`} />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${msg.color}`}>{msg.agent}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-zinc-500 border border-white/5">
                    {msg.role}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto">{msg.time}</span>
                </div>
                
                <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-zinc-300 text-sm leading-relaxed group-hover:bg-white/10 transition-colors break-words">
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        <div className="flex gap-4 opacity-50">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center shrink-0 border border-white/5">
            <Bot className="w-5 h-5 text-zinc-600" />
          </div>
          <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 w-24 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-150" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDebateViewer;
