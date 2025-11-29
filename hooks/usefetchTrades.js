"use client";
import { useEffect, useState } from "react";

export const useFetchTrades = () => {
  const [trades, setTrades] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // Mock trades data - replace with actual API when available
        const mockTrades = [
          {
            id: 1,
            symbol: "BTCUSDT",
            side: "BUY",
            price: "50000",
            quantity: "0.5",
            time: Date.now() - 3600000,
          },
          {
            id: 2,
            symbol: "ETHUSDT",
            side: "SELL",
            price: "3000",
            quantity: "2.0",
            time: Date.now() - 7200000,
          },
        ];
        
        setTrades(mockTrades);
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };

    fetchTrades();
  }, []);

  return trades;
};

