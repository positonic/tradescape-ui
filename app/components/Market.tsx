"use client";
import { useEffect, useState } from "react";
import Chart from "@/app/components/Chart";
import Trades from "@/app/components/Trades";
import TradingStats from "./TradeStats";
import { calculateTradingStatistics } from "@/Stats";
import Orders from "./Orders";
import Positions from "./Positions";
import { useSearchParams } from "next/navigation";
import { Order } from "@/interfaces/Order";
import { Trade } from "@/interfaces/Trade";
import { parseExchangePair } from "@/utils";

export default function Market({ market }: { market: string }) {
  const searchParams = useSearchParams();

  const since = searchParams ? searchParams.get("since") : undefined;

  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  console.log("market is ", market);
  const { pair, exchange } = parseExchangePair(market as string);
  const statistics = calculateTradingStatistics(positions);
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        console.log("fetching trades for ", market);
        // Update the URL to match your Next.js API route
        const response = await fetch(
          `/api/trades?exchangeId=${exchange}&pair=${encodeURIComponent(
            pair
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
        <h1>{market}</h1>

        <Chart market={market} trades={orders} />
        <h3>Positions</h3>
        <Positions positions={positions} />
        <h3>Orders</h3>
        <Orders orders={orders} />
        <div className="flex">
          <div className="w-[400px] p-4 text-white"></div>
          <div className="flex-grow p-4 text-white">
            <TradingStats statistics={statistics} />
          </div>
        </div>
        {/* <Trades trades={trades} /> */}
      </div>
    </div>
  );
}
