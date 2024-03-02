"use client";
import React, { Suspense } from "react";
import { useFetchTrades } from "../hooks/fetchTrades";
import { getStartOfDayTimestamp } from "@/utils";
import { TradeResponseData } from "@/pages/api/TradeResponseData";
import Positions from "./Positions";
import Orders from "./Orders";

const MarketContent = () => {
  const todayTimestamp = getStartOfDayTimestamp();
  const [data, error]: [TradeResponseData | null, any] =
    useFetchTrades(todayTimestamp);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {data && data.positions && (
        <>
          <h3>Positions</h3>
          <Positions positions={data.positions} />
        </>
      )}
      {data && data.positions && (
        <>
          <h3>Orders</h3>
          <Orders orders={data.orders} />
        </>
      )}

      {/* <div className="flex">
          <div className="w-[400px] p-4 text-white"></div>
          <div className="flex-grow p-4 text-white">
            <TradingStats statistics={statistics} />
          </div>
        </div> */}
      {/* <Trades trades={trades} /> */}
    </div>
  );
};

export default function Today() {
  return (
    <div className="container mx-auto">
      <h1>Today</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <MarketContent />
      </Suspense>
    </div>
  );
}
