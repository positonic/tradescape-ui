"use client";
import { useEffect, useState } from "react";
import { Accordion } from "@mantine/core";
import OrderRowPartial from "./OrderRowPartial";
import { formatCurrency } from "@/utils";
import Position from "@/interfaces/Position";

interface PositionsProps {
  positions: Position[];
}

export default function Positions({ positions }: PositionsProps) {
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  console.log("positions is ", positions);
  console.log("positions is orders ", positions[0]?.Orders);

  function buildOrders(orders: any[]) {
    return orders.length > 0
      ? orders.map((order: any, index: any) => (
          <OrderRowPartial
            key={index}
            order={order}
            index={index}
            extraClass={"bg-gray-100"}
          />
        ))
      : null;
  }
  const toggleExpand = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };
  // function buildTrades(trades: any) {
  //   return (
  //     trades.map((trade: any) => (
  //       <Accordion.Item key={trade.time} value={trade.time}>
  //         <Accordion.Control icon={"🚀"}>
  //           <tr key={trade.time}>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //               {new Date(trade.Date).toLocaleString()}
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //               {/* {trade.ProfitLoss?.toFixed(2) || "—"} */}
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //               {/* {trade.Duration} */}
  //             </td>
  //             <td
  //               className={`px-6 py-4 whitespace-nowrap text-sm ${
  //                 trade.type === "buy" ? "text-green-500" : "text-red-500"
  //               }`}
  //             >
  //               {trade.type}
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //               {trade.exchange}
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //               {trade.averagePrice?.toFixed(2) || "—"}
  //             </td>
  //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //               {trade.totalCost?.toFixed(2) || "—"}
  //             </td>
  //           </tr>
  //         </Accordion.Control>
  //         <Accordion.Panel>trades</Accordion.Panel>
  //       </Accordion.Item>
  //     )) || null
  //   );
  // }
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
                Coin
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
                <tr
                  className="hover:cursor-pointer"
                  key={index}
                  onClick={() => toggleExpand(index)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(position.Date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {position.Orders[0].pair}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      position.ProfitLoss && position.ProfitLoss > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(position.ProfitLoss)}
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
                {expanded[index] && buildOrders(position.Orders)}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
