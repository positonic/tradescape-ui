"use client";
import { useEffect, useState } from "react";
import Chart from "@/app/components/Chart";
import Trades from "@/app/components/Trades";
import TradingStats from "./TradeStats";
import { calculateTradingStatistics } from "@/Stats";
import Orders from "./Orders";
import Positions from "./Positions";
import { useSearchParams } from "next/navigation";

export default function Market({ market }: { market: string }) {
  const searchParams = useSearchParams();

  const since = searchParams ? searchParams.get("since") : undefined;

  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const statistics = calculateTradingStatistics(positions);
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        console.log("fetching trades for ", market);
        // Update the URL to match your Next.js API route
        const response = await fetch(
          `/api/trades?exchangeId=binance&market=${encodeURIComponent(
            market
          )}&since=${since}`
        );
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setTrades(data.trades);
          console.log("data.positions is ", data.positions);
          setPositions(data.positions);
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch trades:", err);
        setError("Failed to fetch trades");
      }
    };

    fetchTrades();
  }, [market]);

  return (
    <div className="container mx-auto">
      <div className="">
        <TradingStats statistics={statistics} />
        <Chart market={market} trades={orders} />
        <h3>Positions</h3>
        <Positions positions={positions} />
        <h3>Orders</h3>
        <Orders orders={orders} />

        {/* <Trades trades={trades} /> */}
      </div>
    </div>
  );
}