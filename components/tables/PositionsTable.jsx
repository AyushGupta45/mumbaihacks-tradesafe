import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDecimal } from "@/utils/functions";

const PositionsTable = ({ trades }) => {
  console.log("Trades asstes",trades)
  const openTrades = trades.filter((trade) => trade.exit === null);
  const displayedTrades = [...openTrades].reverse();

  return (
    <div>
      <Table className="text-sm border-collapse border border-gray-300 w-full">
        <TableHeader>
          <TableRow className="bg-gray-100 border-b border-gray-300">
            <TableHead className="p-2 text-start text-gray-700 font-medium border border-gray-300">
              Symbol
            </TableHead>
            <TableHead className="p-2 text-start text-gray-700 font-medium border border-gray-300">
              Price
            </TableHead>
            <TableHead className="p-2 text-start text-gray-700 font-medium border border-gray-300">
              Quantity
            </TableHead>
            <TableHead className="p-2 text-start text-gray-700 font-medium border border-gray-300">
              Investment
            </TableHead>
            <TableHead className="p-2 text-start text-gray-700 font-medium border border-gray-300">
            stopLoss
            </TableHead>
            <TableHead className="p-2 text-start text-gray-700 font-medium border border-gray-300">
              Timestamp
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayedTrades.length > 0 ? (
            displayedTrades.map((trade, index) => (
              <TableRow
                key={index}
                className={`border-b border-gray-300 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <TableCell className="p-2 text-gray-600 border border-gray-300">
                  {trade.symbol}
                </TableCell>

                <TableCell className="p-2 text-gray-600 border border-gray-300">
                  {formatDecimal(trade.entry, 4)}
                </TableCell>

                <TableCell className="p-2 text-gray-600 border border-gray-300">
                  {formatDecimal(trade.quantity, 4)}
                </TableCell>

                <TableCell className="p-2 text-gray-600 border border-gray-300">
                  {trade.investment ? formatDecimal(trade.investment, 3) : "-"}
                </TableCell>

                <TableCell className="p-2 text-gray-600 border border-gray-300">
                  {trade.stopLoss ? formatDecimal(trade.stopLoss, 3) : "-"}
                </TableCell>

                <TableCell className="p-2 text-gray-600 border border-gray-300">
                  {formatDate(trade.updatedAt)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan="5"
                className="text-center p-4 text-gray-500 border border-gray-300"
              >
                No open positions
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PositionsTable;
