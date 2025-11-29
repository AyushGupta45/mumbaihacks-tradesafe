import { useState, useEffect } from "react";

const useSocketData = (symbol, interval = "1m") => {
  const [klineData, setKlineData] = useState([]);
  const [dataFrame, setDataFrame] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    setKlineData([]);
    setDataFrame([]);
    setLoading(true);

    // Convert symbol to Binance format (e.g., BTCUSDT)
    const binanceSymbol = symbol.replace("/", "").toLowerCase();
    
    // Connect to Binance WebSocket
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_${interval}`;
    const ws = new WebSocket(wsUrl);

    // Fetch historical data first
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol.replace("/", "")}&interval=${interval}&limit=100`
        );
        const data = await response.json();
        
        const formattedData = data.map(candle => ({
          timestamp: candle[0],
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        }));

        setKlineData(formattedData);
        setDataFrame(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setLoading(false);
      }
    };

    fetchHistoricalData();

    ws.onopen = () => {
      console.log(`WebSocket connected for ${symbol}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.e === "kline") {
          const kline = data.k;
          
          const newPoint = {
            timestamp: kline.t,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v),
          };

          setKlineData((prevData) => {
            const newData = [...prevData];
            const lastCandle = newData[newData.length - 1];

            // If candle is closed, add new one
            if (kline.x) {
              newData.push(newPoint);
            } else if (lastCandle && lastCandle.timestamp === newPoint.timestamp) {
              // Update existing candle
              newData[newData.length - 1] = newPoint;
            } else {
              // Add new candle
              newData.push(newPoint);
            }

            // Keep only last 200 candles
            return newData.slice(-200);
          });

          setDataFrame((prevData) => [...prevData.slice(-200), newPoint]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for ${symbol}`);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [symbol, interval]);

  return { klineData, dataFrame, loading };
};

export default useSocketData;
