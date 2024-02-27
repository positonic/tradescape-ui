"use client";
import { useEffect, useState } from "react";
import { Accordion } from "@mantine/core";

interface Position {
  Date: string;
  ProfitLoss: number | null;
  Duration: string;
  PositionType: "long" | "short";
  AverageEntryPrice: number;
  AverageExitPrice: number;
  TotalCostBuy: number | null;
  TotalCostSell: number | null;
  Orders: any[];
}

interface PositionsProps {
  positions: Position[];
}

export default function Positions({ positions }: PositionsProps) {
  const [error, setError] = useState("");
  const orders = positions[0]?.Orders.map((trade: any) => (
    <Accordion.Item key={trade.time} value={trade.time}>
      <Accordion.Control icon={"🚀"}>{"control"}</Accordion.Control>
      <Accordion.Panel>{trade.Date}</Accordion.Panel>
    </Accordion.Item>
  ));
  function buildTrades(trades: any) {
    return (
      trades.map((trade: any) => (
        <Accordion.Item key={trade.time} value={trade.time}>
          <Accordion.Control icon={"🚀"}>
            <tr key={trade.time}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(trade.Date).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* {trade.ProfitLoss?.toFixed(2) || "—"} */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {/* {trade.Duration} */}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm ${
                  trade.type === "buy" ? "text-green-500" : "text-red-500"
                }`}
              >
                {trade.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {trade.exchange}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {trade.averagePrice?.toFixed(2) || "—"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {trade.totalCost?.toFixed(2) || "—"}
              </td>
            </tr>
          </Accordion.Control>
          <Accordion.Panel>trades</Accordion.Panel>
        </Accordion.Item>
      )) || null
    );
  }
  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      {!error && positions && positions.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P/L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost Buy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost Sell
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positions.map((position, index) => (
              <>
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(position.Date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.ProfitLoss?.toFixed(2) || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.Duration}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      position.PositionType === "long"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {position.PositionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.AverageEntryPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.AverageExitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.TotalCostBuy?.toFixed(2) || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.TotalCostSell?.toFixed(2) || "—"}
                  </td>
                </tr>
                {orders}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
