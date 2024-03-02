// Define the structure of your trades data. Update this according to your actual data structure.

import { TradeResponseData } from "@/pages/api/TradeResponseData";
import { useState, useEffect } from "react";

export const useFetchTrades = (
  todayTimestamp: number
): [TradeResponseData | null, string | null] => {
  const [data, setData] = useState<TradeResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch(`/api/trades?since=${todayTimestamp}`);
        const jsonData: TradeResponseData = await response.json();
        if (jsonData.error) {
          // Assuming `jsonData.error` is a string. Adjust if it's structured differently.
          setError(jsonData.error as unknown as string);
        } else {
          setData(jsonData);
        }
      } catch (err) {
        // If you're sure the error will have a message, you might need to cast the error to any
        setError((err as any).message || "Failed to fetch trades");
      }
    };

    fetchTrades();
  }, [todayTimestamp]);

  return [data, error];
};
