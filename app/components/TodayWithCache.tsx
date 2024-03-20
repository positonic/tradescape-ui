"use client";
import React, { Suspense, useEffect, useState } from "react";
//import { useFetchTrades } from "../hooks/fetchTrades";
import { useFetchAndCacheTrades } from "../hooks/fetchAndCacheTrades";
import { getStartOfYesterdayTimestamp } from "@/utils";
import { TradeResponseData } from "@/pages/api/TradeResponseData";
import Positions from "./Positions";
import Orders from "./Orders";
import Signin from "./Signin";
// Import useAccount from wagmi instead of RainbowKit
import { useAccount } from "wagmi";
import Settings from "./Settings";
import { useExchangeManager } from "../hooks/exchangeManager";

const MarketContent = () => {
  const startTimestamp = getStartOfYesterdayTimestamp();
  const [data, error] = useFetchAndCacheTrades(startTimestamp);

  // Use the useAccount hook from wagmi to check wallet connection

  if (error) {
    return <div>Error: {error}</div>;
  }

  // If not connected, render the Signin component

  // Render the content if the user's wallet is connected
  return (
    <div>
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
    </div>
  );
};

export default function Today() {
  //const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [isSettingsSaved, apiKeys] = useExchangeManager();

  const { isConnected } = useAccount();

  // useEffect(() => {
  //   // Check if API keys are stored in localStorage
  //   const apiKeys = localStorage.getItem("encryptedApiKeys");
  //   if (apiKeys) {
  //     debugger;
  //     const keysObject = JSON.parse(apiKeys);
  //     // Basic check to see if both keys exist
  //     if (keysObject.binance && keysObject.kraken) {
  //       setIsSettingsSaved(true);
  //     }
  //   }
  // }, []);

  if (!isConnected) {
    return <Signin />;
  }

  return (
    <div className="container mx-auto">
      <h1>Today</h1>
      <Suspense fallback={<div>Loading...</div>}>
        {isSettingsSaved && <MarketContent />}
        {!isSettingsSaved && <Settings />}
      </Suspense>
    </div>
  );
}
