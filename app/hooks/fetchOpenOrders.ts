import { Order } from "@/interfaces/Order";
import axios from "axios";
import { useState, useEffect } from "react";

export const useFetchOpenOrders = (
  exchangeId: string,
  since: string | null,
  pair: string
) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOpenOrders = async () => {
      try {
        // Construct the query string
        const queryParams = new URLSearchParams({
          exchangeId,
          since: since || "",
          pair,
        }).toString();

        // Make the API call
        const response = await axios.get(`/api/open-orders?${queryParams}`);
        const fetchedOrders: Order[] = response.data.map((order: any) => ({
          id: order.id,
          ordertxid: order.ordertxid,
          time: order.time,
          date: new Date(order.time), // Convert timestamp to Date object
          type: order.type,
          pair: order.pair,
          amount: order.amount,
          highestPrice: order.highestPrice,
          lowestPrice: order.lowestPrice,
          averagePrice: order.averagePrice,
          exchange: order.exchange,
          trades: order.trades,
          orderId: order.orderId,
          status: order.status,
          totalCost: order.totalCost,
          fee: order.fee,
        }));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch open orders:", error);
        // Handle error appropriately
      }
    };

    fetchOpenOrders();
  }, [exchangeId, since, pair]); // Refetch when these dependencies change

  return orders;
};
