import { useState, useEffect } from "react";
import { useFetchTrades } from "./fetchTrades"; // Adjust the import path as needed
import { TradeResponseData } from "@/pages/api/TradeResponseData";
import { Trade } from "@/interfaces/Trade";
import { Order } from "@/interfaces/Order";
import Position from "@/interfaces/Position";

interface ExchangesTradesCache {
  timestamp: number;
  trades: Trade[];
  orders: Order[];
  positions: Position[];
}

export const useFetchAndCacheTrades = (
  fallbackTimestamp: number
): [TradeResponseData | null, string | null] => {
  // Attempt to retrieve the cache from localStorage
  const [cache, setCache] = useState<ExchangesTradesCache | null>(() => {
    const cacheRaw = localStorage.getItem("exchangesTradesCache");
    return cacheRaw ? JSON.parse(cacheRaw) : null;
  });

  // Calculate the current timestamp and check if the cache is still valid (less than 5 minutes old)
  const now = Date.now();
  const isCacheValid = cache && now - cache.timestamp < 5 * 60 * 1000;

  // Determine the timestamp to use for fetching trades
  const startTimestamp = isCacheValid ? cache.timestamp : fallbackTimestamp;

  // Use the wrapped hook to fetch data, potentially using the cached timestamp
  const [data, error] = useFetchTrades(startTimestamp);

  useEffect(() => {
    if (data && !error) {
      // Merge new trades with cached trades if both exist
      const updatedTrades = cache
        ? [...cache.trades, ...data.trades]
        : data.trades;
      const updatedOrders = cache
        ? [...cache.orders, ...data.orders]
        : data.orders;
      const updatedPositions = cache
        ? [...cache.positions, ...data.positions]
        : data.positions;

      // Update the cache with new data
      const newCache: ExchangesTradesCache = {
        timestamp: now, // Use the current timestamp for the new cache
        trades: updatedTrades,
        orders: updatedOrders,
        positions: updatedPositions,
      };

      localStorage.setItem("exchangesTradesCache", JSON.stringify(newCache));
      setCache(newCache); // Update the local state to reflect the new cache
    }
  }, [data, error, cache, now]);

  // If the cache is valid and we have cached data, return it immediately without fetching
  if (isCacheValid && cache) {
    return [{ ...cache, error: "" }, null];
  }

  return [data, error];
};
