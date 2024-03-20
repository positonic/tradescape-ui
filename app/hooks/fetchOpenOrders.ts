import { Order } from "@/interfaces/Order";
import { useState, useEffect } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";

type OpenOrdersPerPair = {
  [pair: string]: Order[];
};

export const useFetchOpenOrders = (
  exchangeId: string,
  coins: string[],
  since: string | undefined
) => {
  //console.log(inCoins);
  // const coins = ["MATIC"];
  console.log("fetch: useFetchOpenOrders coins: ", coins);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [openOrdersPerPair, setOpenOrdersPerPair] = useState<OpenOrdersPerPair>(
    {}
  );

  const pair = coins[0];
  const exchange = exchangeId === "All" ? "binance" : exchangeId;
  console.log(
    "fetch: Fetching open orders for ",
    pair,
    " on ",
    exchangeId,
    " since ",
    since
  );
  useEffect(() => {
    console.log(
      "fetch: openOrdersPerPair has been updated:",
      openOrdersPerPair
    );
    console.log("openOrdersPerPair is ", openOrdersPerPair);
    const ordersArrays = Object.values(openOrdersPerPair);
    const allOrders = ordersArrays.reduce(
      (acc, orders) => acc.concat(orders),
      []
    );
    console.log("fetch: All Open orders ", allOrders);
    // setOpenOrders(allOrders);
  }, [openOrdersPerPair]);

  useDeepCompareEffect(() => {
    console.log("fetch: fetchOpenOrders useEffect running");

    //const throttledFetchOpenOrders = throttle(fetchOpenOrders, 1000); // Throttle calls to every 2 seconds
    const skipCoin = ["USDT", "USD", "USDC", "ALL"];

    const fetchAllOpenOrders = async (exchange: string, coins: string[]) => {
      if (pair === "All") {
        for (const coin of coins) {
          const pairSymbol =
            skipCoin.indexOf(coin) === -1 ? `${coin}/USDT` : "";
          if (pairSymbol) {
            const fetchedOpenOrders = await fetchOpenOrders(
              exchange,
              pairSymbol
            );
            console.log(
              "fetch: fetchedOpenOrders ",
              pairSymbol,
              fetchedOpenOrders
            );
            if (fetchedOpenOrders && fetchedOpenOrders.length)
              setOpenOrdersPerPair((prevState) => ({
                ...prevState,
                [coin]: fetchedOpenOrders,
              }));
          }
        }
      } else {
        const pairSymbol = skipCoin.indexOf(pair) === -1 ? `${pair}/USDT` : "";
        await fetchOpenOrders(exchange, pairSymbol);
      }
    };
    fetchAllOpenOrders(exchange, coins);
  }, [exchangeId, since, pair, coins]); // Refetch when these dependencies change

  return openOrders;
};
