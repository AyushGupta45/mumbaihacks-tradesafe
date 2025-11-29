"use client";
import { useEffect, useState } from "react";
import { coindata } from "@/constants";
import { getCryptoIcon } from "@/utils/functions";

export const useFetchMarketData = () => {
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Get all symbols from constants
        const symbols = coindata.map(coin => coin.symbol).join(',');
        
        // Fetch 24hr ticker data from Binance
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=["${coindata.map(c => c.symbol).join('","')}"]`, {
          cache: "no-store",
        });

        if (response.ok) {
          const binanceData = await response.json();

          // Fetch historical data for each coin
          const mergedDataPromises = coindata.map(async (coin) => {
            const binanceInfo = binanceData.find(
              (item) => item.symbol === coin.symbol
            );

            if (!binanceInfo) return null;

            // Fetch real historical kline data (last 24 hours, 1-hour intervals)
            const klineResponse = await fetch(
              `https://api.binance.com/api/v3/klines?symbol=${coin.symbol}&interval=1h&limit=24`,
              { cache: "no-store" }
            );

            let historicalData = [];
            if (klineResponse.ok) {
              const klineData = await klineResponse.json();
              historicalData = klineData.map(candle => ({
                time: candle[0],
                price: parseFloat(candle[4]), // Close price
              }));
            }

            const image = getCryptoIcon(coin.baseAsset.toLowerCase());

            return {
              ...coin,
              currentPrice: parseFloat(binanceInfo.lastPrice),
              price: parseFloat(binanceInfo.lastPrice),
              priceChangePercentage24h: parseFloat(binanceInfo.priceChangePercent),
              volume: parseFloat(binanceInfo.volume),
              quoteVolume: parseFloat(binanceInfo.quoteVolume),
              high24h: parseFloat(binanceInfo.highPrice),
              low24h: parseFloat(binanceInfo.lowPrice),
              image,
              historicalData, // Real historical prices
            };
          });

          const mergedData = (await Promise.all(mergedDataPromises)).filter(Boolean);
          setMarketData(mergedData);
        } else {
          console.error("Failed to fetch market data from Binance");
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchMarketData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { marketData };
};

