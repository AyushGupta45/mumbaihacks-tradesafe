"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Shield,
  Bot,
  TrendingUp,
  Activity,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TradeSafe</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Live Arbitrage Engine Active
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Arbitrage <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Intelligence
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
              The world&apos;s first multi-agent arbitrage platform. Detect,
              analyze, and execute profitable trades across exchanges in
              milliseconds.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/dashboard">
                <Button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
                  Start Trading Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 text-white"
              >
                View Live Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/5">
              <div>
                <p className="text-2xl font-bold text-white">$2.4M+</p>
                <p className="text-sm text-zinc-500">Volume Traded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0.05s</p>
                <p className="text-sm text-zinc-500">Execution Speed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-zinc-500">Uptime</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative lg:h-[600px] w-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

            {/* Floating Glass Cards */}
            <div className="relative w-full max-w-md aspect-square animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Image src="/btc.png" alt="BTC" width={40} height={40} />
                    </div>
                    <div>
                      <p className="font-bold">Bitcoin</p>
                      <p className="text-xs text-zinc-400">BTC/USDT</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold">+2.4%</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Binance</span>
                    <span className="font-mono">$42,150.00</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Coinbase</span>
                    <span className="font-mono">$42,380.00</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-400">
                      Spread Detected
                    </span>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      $230.00 Profit
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div
                className="absolute -right-12 -bottom-12 w-64 p-4 rounded-2xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-xl shadow-2xl animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">AI Agent</p>
                    <p className="text-[10px] text-zinc-400">Risk Analysis</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  &quot;Arbitrage opportunity confirmed. Risk level low.
                  Executing trade sequence.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Ticker */}
      <div className="w-full bg-white/5 border-y border-white/5 py-4 overflow-hidden">
        <div className="flex items-center gap-12 animate-scroll whitespace-nowrap min-w-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400"
            >
              <span className="text-white">BTC/USDT</span>
              <span className="text-emerald-400">+1.2%</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-white">ETH/USDT</span>
              <span className="text-red-400">-0.5%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Our multi-agent system works in harmony to detect, analyze, and
              execute trades faster than any human.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Global Scanning",
                desc: "Monitors 50+ exchanges simultaneously to find price discrepancies in real-time.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Shield,
                title: "Risk Management",
                desc: "AI-driven risk assessment ensures capital protection before every trade execution.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                icon: Activity,
                title: "Instant Execution",
                desc: "Low-latency execution engine captures opportunities before they disappear.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 tracking-tight">
            Ready to start trading?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Join thousands of traders using TradeSafe to automate their
            arbitrage strategies.
          </p>
          <Link href="/dashboard">
            <Button className="h-16 px-12 rounded-full bg-white text-black text-lg font-bold hover:bg-zinc-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Launch Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="font-bold">TradeSafe</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </div>
          <p className="text-sm text-zinc-600">© 2024 TradeSafe Inc.</p>
        </div>
      </footer>
    </div>
  );
}
