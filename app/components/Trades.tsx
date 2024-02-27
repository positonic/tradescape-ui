"use client";
import { useEffect, useState } from "react";
import { formatDateTime } from "@/utils";
import { Trade } from "@/interfaces/Trade";
import TradeRow from "./TradeRowPartial";
export default function Trades({ trades }: { trades: Trade[] }) {
  const [error, setError] = useState("");

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      {!error && trades && trades.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                When
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade: Trade) => (
              <TradeRow trade={trade} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
