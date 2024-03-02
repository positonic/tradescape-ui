"use client";
import { useEffect, useState } from "react";
import { formatDateTime } from "@/utils";
import { Order } from "@/interfaces/Order";
export default function Orders({ orders }: { orders: Order[] }) {
  const [error, setError] = useState("");

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      {!error && orders && orders.length > 0 && (
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
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(order.time)}
                </td>

                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    order.type === "buy" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {order.type}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.pair.split("/")[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.exchange}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.averagePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.totalCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
