"use client";

"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceData {
  symbol: string;
  binancePrice: number;
  indianPrice: number;
  spreadPct: number;
}

interface MultiExchangePriceTickerProps {
  prices?: PriceData[];
}

const MultiExchangePriceTicker = ({ prices = [] }: MultiExchangePriceTickerProps) => {
  // Use passed prices or empty array
  const displayPrices = prices.length > 0 ? prices : [];

  return (
    <div className="w-full overflow-hidden bg-black/40 border-y border-white/5 backdrop-blur-sm">
      <div className="flex animate-ticker hover:pause-animation">
        {/* Duplicate for infinite scroll effect */}
        {[...displayPrices, ...displayPrices, ...displayPrices].map((price, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-3 border-r border-white/5 min-w-[300px]">
            <span className="font-bold text-white">{price.symbol}</span>
            
            <div className="flex flex-col text-xs">
              <span className="text-zinc-400">Binance</span>
              <span className="font-mono text-zinc-200">${price.binancePrice.toLocaleString()}</span>
            </div>

            <div className="flex flex-col text-xs">
              <span className="text-zinc-400">Indian</span>
              <span className="font-mono text-zinc-200">${price.indianPrice.toLocaleString()}</span>
            </div>

            <div className={`flex items-center gap-1 text-xs font-bold ${
              price.spreadPct > 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {price.spreadPct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(price.spreadPct).toFixed(2)}%
            </div>
          </div>
        ))}
        
        {displayPrices.length === 0 && (
          <div className="px-6 py-3 text-zinc-500 text-sm">Waiting for price data...</div>
        )}
      </div>
    </div>
  );
};

export default MultiExchangePriceTicker;
