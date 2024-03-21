"use client";
import { useEffect, useState } from "react";
import Chart from "@/app/components/Chart";
//import Trades from "@/app/components/Trades";
import TradingStats from "./TradeStats";
import { calculateTradingStatistics } from "@/Stats";
import Orders from "./Orders";
import Positions from "./Positions";
import { useSearchParams } from "next/navigation";
import { Order } from "@/interfaces/Order";
import { Trade } from "@/interfaces/Trade";
import { parseExchangePair } from "@/utils";
import { useFetchBalances } from "../hooks/fetchBalances";
import { useExchangeManager } from "../hooks/exchangeManager";
import { DateTimePicker } from "@mantine/dates";
import { matchOrdersToPositions } from "@/PositionManager";
import Position from "@/interfaces/Position";

export default function Market({ market }: { market: string }) {
  const searchParams = useSearchParams();
  const [isSettingsSaved, apiKeys] = useExchangeManager();
  const [fromDateTime, setFromDateTime] = useState<Date | null>(null);
  const [toDateTime, setToDateTime] = useState<Date | null>(null);

  const since = searchParams ? searchParams.get("since") : undefined;
  const sinceFiltered =
    fromDateTime && fromDateTime?.getTime() ? fromDateTime?.getTime() : since;

  console.log("sinceFiltered is ", sinceFiltered);
  const { balances, safeBalances, totalBalance, history, isLoading, coins } =
    useFetchBalances({
      selectedExchange: "kraken",
      selectedCoin: "sol",
      hideStables: true,
      openOrders: [],
      apiKeys,
    });

  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  const { pair, exchange } = parseExchangePair(market as string);
  const statistics = calculateTradingStatistics(positions);

  //Apply any filters such as start and end date time
  useEffect(() => {
    const ordersAfterDate = fromDateTime
      ? orders.filter((order: Order) => order.time >= fromDateTime?.getTime())
      : orders;

    const ordersAfterBeforeDate = toDateTime
      ? ordersAfterDate.filter(
          (order: Order) => order.time <= toDateTime?.getTime()
        )
      : ordersAfterDate;
    const filteredOrders = ordersAfterBeforeDate;

    setFilteredOrders(filteredOrders);
    const positions = matchOrdersToPositions(filteredOrders);
    setPositions(positions);
  }, [fromDateTime, toDateTime]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        // Update the URL to match your Next.js API route
        const response = await fetch(
          `/api/trades?exchangeId=${exchange}&pair=${encodeURIComponent(
            pair
          )}&since=${sinceFiltered}`
        );
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setTrades(data.trades);

          setPositions(data.positions);
          setOrders(data.orders);
          const ordersBeforeDate = toDateTime
            ? data.orders.filter(
                (order: Order) => order.time <= toDateTime?.getTime()
              )
            : data.orders;
          setFilteredOrders(ordersBeforeDate);
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
        <br />
        <div className="flex items-center space-x-2">
          {/* <span className="inline-block">Start date time</span> */}
          <DateTimePicker
            label="Pick from date and time"
            placeholder="Pick date and time"
            value={fromDateTime}
            onChange={setFromDateTime}
          />

          {/* <span className="inline-block">End date time</span> */}
          <DateTimePicker
            label="Pick to date and time"
            placeholder="Pick date and time"
            value={toDateTime}
            onChange={setToDateTime}
          />
        </div>
        <br />
        <br />
        <h3>Positions</h3>
        <Positions positions={positions} />
        <br />
        <h3>Orders</h3>
        <Orders orders={filteredOrders} />
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
