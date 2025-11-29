"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdvancedChart from "@/components/charts/AdvancedChart";
import useSocketData from "@/hooks/useSocketData";

export default function MarketDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string; // e.g., "BTCUSDT"
  const displaySymbol = symbol ? symbol.replace("USDT", "/USDT") : "Loading...";

  const [interval, setInterval] = useState("1d");

  // Use the socket hook for real-time data
  const { klineData, currentPrice } = useSocketData(
    symbol || "BTCUSDT",
    interval
  );

  // Calculate 24h change (mock for now based on current price vs first candle)
  const startPrice = klineData.length > 0 ? klineData[0].price : currentPrice;
  const priceChange = currentPrice - startPrice;
  const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;
  const isUp = percentChange >= 0;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/markets">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={`https://assets.coincap.io/assets/icons/${symbol
                  ?.replace("USDT", "")
                  .toLowerCase()}@2x.png`}
                alt={symbol || "crypto"}
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerText =
                    symbol?.substring(0, 1) || "?";
                  e.currentTarget.parentElement!.classList.add(
                    "text-white",
                    "font-bold",
                    "text-lg"
                  );
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{displaySymbol}</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono text-white">
                  $
                  {currentPrice?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded ${
                    isUp
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(percentChange).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/20">
            Buy {symbol?.replace("USDT", "")}
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 shadow-lg shadow-red-500/20">
            Sell {symbol?.replace("USDT", "")}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Price Action
            </h3>
            <div className="flex gap-2">
              {[
                { label: "1H", value: "1h" },
                { label: "4H", value: "4h" },
                { label: "1D", value: "1d" },
                { label: "1W", value: "1w" },
              ].map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setInterval(tf.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    interval === tf.value
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-[400px]">
            <AdvancedChart data={klineData} symbol={symbol} />
          </div>
        </div>

        {/* Side Panel: Order Book & Details */}
        <div className="space-y-6 flex flex-col">
          {/* Market Stats */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">
              Market Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">24h High</span>
                <span className="text-white font-mono">
                  $
                  {klineData.length > 0
                    ? Math.max(
                        ...klineData.slice(-24).map((k) => k.high)
                      ).toLocaleString()
                    : "..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">24h Low</span>
                <span className="text-white font-mono">
                  $
                  {klineData.length > 0
                    ? Math.min(
                        ...klineData.slice(-24).map((k) => k.low)
                      ).toLocaleString()
                    : "..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">24h Volume</span>
                <span className="text-white font-mono">
                  {klineData.length > 0
                    ? klineData
                        .slice(-24)
                        .reduce((acc, k) => acc + k.volume, 0)
                        .toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : "..."}
                </span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Last Price</span>
                <span className="text-white font-mono">
                  ${(currentPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Book Mock */}
          <div className="glass-card p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">
              Order Book
            </h3>
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar space-y-1">
                {/* Asks (Red) */}
                {[...Array(8)]
                  .map((_, i) => (
                    <OrderRow
                      key={`ask-${i}`}
                      price={(currentPrice || 0) + i * 5}
                      type="ask"
                    />
                  ))
                  .reverse()}

                <div className="py-2 border-y border-white/5 my-2 text-center">
                  <span className="text-lg font-bold text-white font-mono">
                    ${(currentPrice || 0).toFixed(2)}
                  </span>
                </div>

                {/* Bids (Green) */}
                {[...Array(8)].map((_, i) => (
                  <OrderRow
                    key={`bid-${i}`}
                    price={(currentPrice || 0) - i * 5}
                    type="bid"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component to handle hydration-safe random data
const OrderRow = ({ price, type }: { price: number; type: "ask" | "bid" }) => {
  const [amount, setAmount] = useState<string>("-");

  useEffect(() => {
    setAmount((Math.random() * 2).toFixed(4));
  }, []);

  return (
    <div className="flex justify-between text-xs hover:bg-white/5 px-2 py-1 rounded cursor-pointer group">
      <span
        className={`${
          type === "ask" ? "text-red-400" : "text-emerald-400"
        } font-mono group-hover:font-bold`}
      >
        {price.toFixed(2)}
      </span>
      <span className="text-zinc-500 text-right">{amount}</span>
    </div>
  );
};
