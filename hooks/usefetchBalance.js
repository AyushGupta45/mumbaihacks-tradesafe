"use client";
import { useEffect, useState } from "react";
import { getCryptoIcon } from "@/utils/functions";

export const useFetchBalance = () => {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Mock balance data since backend was removed
        // In production, replace this with your actual API or wallet integration
        const mockAssets = [
          { asset: "BTC", free: "0.5", locked: "0.1" },
          { asset: "ETH", free: "2.5", locked: "0.5" },
          { asset: "USDT", free: "10000", locked: "2000" },
          { asset: "BNB", free: "5", locked: "1" },
        ];

        const finalData = mockAssets.map((asset) => {
          const image = getCryptoIcon(asset.asset.toLowerCase());

          return {
            ...asset,
            symbol: asset.asset,
            name: asset.asset === "BTC" ? "Bitcoin" :
                  asset.asset === "ETH" ? "Ethereum" :
                  asset.asset === "USDT" ? "Tether" :
                  asset.asset === "BNB" ? "Binance Coin" : "Unknown",
            image,
          };
        });
        
        setBalance(finalData);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  return balance;
};

