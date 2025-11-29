import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import Link from "next/link";

const MarketCard = ({ marketData }) => {
  return (
    <div className="flex flex-wrap justify-start gap-8">
      {marketData.map((crypto) => (
        <Card key={crypto.symbol} className="shadow-lg rounded-lg p-4 w-[380px]">
          <Link href={`/markets/${crypto.symbol}`}>
            <CardHeader className="flex flex-row items-center p-0 mb-3 gap-4">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-12 h-12 object-contain"
              />
             <div className="flex flex-col items-start gap-1">
                <CardTitle className="flex flex-row text-3xl font-extrabold text-gray-800 gap-2">
                  <p>{crypto.name}</p>
                  <div className="flex flex-row items-end justify-start">
                    <p className="text-gray-500 text-sm font-bold pb-0.5">
                      ({crypto.baseAsset})
                    </p>
                  </div>
                </CardTitle>
                <div className="flex justify-center items-center">
                  <div
                    className={`text-sm font-semibold px-3 py-0.5 rounded-md text-white ${
                      (crypto.priceChangePercentage24h || 0) > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {crypto.priceChangePercentage24h 
                      ? (crypto.priceChangePercentage24h > 0
                        ? `+${crypto.priceChangePercentage24h.toFixed(2)}%`
                        : `${crypto.priceChangePercentage24h.toFixed(2)}%`)
                      : "0.00%"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between gap-8 p-0 px-1 pb-2 border-b">
              <div
                className={`text-2xl font-bold ${
                  (crypto.priceChangePercentage24h || 0) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ${parseFloat(crypto.price || crypto.currentPrice || 0).toLocaleString()}
              </div>
              <SimpleLineChart
                historicalData={crypto.historicalData || []}
                color={
                  (crypto.priceChangePercentage24h || 0) > 0 ? "#10b981" : "#ef4444"
                }
              />
            </CardContent>

            <CardFooter className="flex flex-col items-start p-0 pt-3 text-sm gap-2">
              <p className="text-gray-800 font-semibold">
                Market Cap:{" "}
                <span className="text-gray-500">
                  ${crypto.marketCap?.toLocaleString() ?? "N/A"}
                </span>
              </p>
              <p className="text-gray-800 font-semibold">
                24hr Volume:{" "}
                <span className="text-gray-500">
                  ${crypto.volume?.toLocaleString() ?? "N/A"}
                </span>
              </p>
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default MarketCard;
