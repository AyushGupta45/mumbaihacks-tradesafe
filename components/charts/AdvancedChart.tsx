"use client";

import React, { useEffect, useRef, useState } from "react";
import { init, dispose } from "klinecharts";
import { useLayout } from "@/context/LayoutContext";

const AdvancedChart = ({ data, symbol }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { theme } = useLayout();
  const [chartType, setChartType] = useState("candle_solid");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = init(chartContainerRef.current, { locale: "en-US" });
    chartInstanceRef.current = chart;

    // Set styles based on theme
    const isDark = theme === "dark";
    // Try setStyleOptions for v8 compatibility
    if (chart.setStyleOptions) {
        chart.setStyleOptions({
            grid: {
                horizontal: { color: isDark ? "#333" : "#eee" },
                vertical: { color: isDark ? "#333" : "#eee" },
            },
            candle: {
                bar: {
                    upColor: "#10b981",
                    downColor: "#ef4444",
                    noChangeColor: "#888888",
                },
            },
        });
    }

    return () => {
      dispose(chartContainerRef.current);
    };
  }, [theme]);

  const currentSymbolRef = useRef(symbol);

  useEffect(() => {
    if (chartInstanceRef.current && data && data.length > 0) {
      // Map data to klinecharts format
      const klineData = data.map(item => ({
        timestamp: item.timestamp || item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close || item.price,
        volume: item.volume,
      }));

      // If it's a new symbol or first load, apply all data
      const currentDataList = chartInstanceRef.current.getDataList();
      
      if (currentDataList.length === 0 || symbol !== currentSymbolRef.current) {
          chartInstanceRef.current.applyNewData(klineData);
          currentSymbolRef.current = symbol;
      } else {
          // Update the last candle or append new one
          const lastData = klineData[klineData.length - 1];
          chartInstanceRef.current.updateData(lastData);
      }
    }
  }, [data, symbol]);

  useEffect(() => {
    if (chartInstanceRef.current) {
        if (chartInstanceRef.current.setStyleOptions) {
             chartInstanceRef.current.setStyleOptions({
                candle: {
                type: chartType,
                },
            });
        }
    }
  }, [chartType]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          {[
            { label: "Candle", value: "candle_solid" },
            { label: "Line", value: "area" },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setChartType(type.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                chartType === type.value
                  ? "bg-blue-500 text-white shadow-lg" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full min-h-[400px]" />
    </div>
  );
};

export default AdvancedChart;
