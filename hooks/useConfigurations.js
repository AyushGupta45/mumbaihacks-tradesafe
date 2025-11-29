"use client";
import { useEffect, useState } from "react";
import { getCryptoIcon } from "@/utils/functions";

export const useConfigurations = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        // Mock configurations - replace with actual API when available
        const mockConfigs = [
          {
            base: "BTC",
            quote: "USDT",
            enabled: true,
            image: getCryptoIcon("btc"),
          },
          {
            base: "ETH",
            quote: "USDT",
            enabled: true,
            image: getCryptoIcon("eth"),
          },
        ];

        setData(mockConfigs);
      } catch (error) {
        console.error("Error fetching configurations:", error);
      }
    };

    fetchConfigurations();
  }, []);

  return data;
};

