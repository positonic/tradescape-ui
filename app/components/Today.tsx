"use client";
import { useEffect, useState } from "react";
import Chart from "@/app/components/Chart";
import Trades from "@/app/components/Trades";
import TradingStats from "./TradeStats";
import { calculateTradingStatistics } from "@/Stats";
import Orders from "./Orders";
import Positions from "./Positions";
import { useSearchParams } from "next/navigation";
import { getStartOfDayTimestamp } from "@/utils";

export default function Market() {
  const searchParams = useSearchParams();

  const since = searchParams ? searchParams.get("since") : undefined;

  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const todayTimestamp = getStartOfDayTimestamp();
  //const statistics = calculateTradingStatistics(positions);
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // Update the URL to match your Next.js API route
        const response = await fetch(`/api/all-trades?since=${todayTimestamp}`);
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
  }, []);

  return (
    <div className="container mx-auto">
      <div className="">
        <h1>Today</h1>

        {/* <Chart market={market} trades={orders} /> */}
        <h3>Positions</h3>
        <Positions positions={positions} />
        <h3>Orders</h3>
        <Orders orders={orders} />
        {/* <div className="flex">
          <div className="w-[400px] p-4 text-white"></div>
          <div className="flex-grow p-4 text-white">
            <TradingStats statistics={statistics} />
          </div>
        </div> */}
        {/* <Trades trades={trades} /> */}
      </div>
    </div>
  );
}