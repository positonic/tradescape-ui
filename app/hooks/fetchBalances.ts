// hooks/useFetchBalances.ts
import { useState, useEffect } from "react";
import FetchUpdate from "../components/FetchUpdate"; // Adjust the import path
import BalanceData from "../components/BalanceData"; // Adjust the import path
import ExchangeBalance from "@/interfaces/ExchangeBalance"; // Adjust the import path
import BalanceHistoryItem from "../components/BalanceHistoryItem"; // Adjust the import path
import { Order } from "@/interfaces/Order"; // Adjust the import path
import { ApiKeys } from "@/interfaces/ApiKeys";

const balanceHistoryKey = "balanceHistory";
const localStorageKey = "balancesData";
const saveBalanceHistory = (newTotalBalance: number): BalanceHistoryItem[] => {
  const historyJSON = localStorage.getItem(balanceHistoryKey);
  let history: BalanceHistoryItem[] = historyJSON
    ? JSON.parse(historyJSON)
    : [];

  // Add the new balance to the history
  history.push({ timestamp: Date.now(), totalBalance: newTotalBalance });

  // Optional: limit the history size to prevent excessive localStorage usage
  const maxHistorySize = 100; // for example, keep the latest 100 entries
  if (history.length > maxHistorySize) {
    history = history.slice(-maxHistorySize);
  }

  localStorage.setItem(balanceHistoryKey, JSON.stringify(history));

  return history;
};
const fetchAndUpdateBalances = async (
  apiKeys: ApiKeys | undefined
): Promise<FetchUpdate> => {
  console.log("fetchAndUpdateBalances > Fetching new data", new Date());
  const storedDataJSON = localStorage.getItem(localStorageKey);
  const historyJSON = localStorage.getItem(balanceHistoryKey);
  const storedData: BalanceData | null = storedDataJSON
    ? JSON.parse(storedDataJSON)
    : null;
  const history: BalanceHistoryItem[] | null = historyJSON
    ? JSON.parse(historyJSON)
    : null;
  const fiveMinutesAgo = Date.now() - 10 * 60 * 1000;

  console.log(
    "fetch > fiveMinutesAgo is ",
    new Date(fiveMinutesAgo).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Set to true for AM/PM format
    })
  );
  if (storedData) {
    console.log(
      "fetch: balances last saved at ",
      storedData?.timestamp,
      new Date(storedData?.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Set to true for AM/PM format
      })
    );
    console.log("fetch: storedData?.timestamp is ", storedData?.timestamp);
    console.log("fetch: fiveMinutesAgo is ", fiveMinutesAgo);
    console.log(
      "fetch: Last save is more than 5 minutes ago is ",
      storedData?.timestamp < fiveMinutesAgo
    );
  } else {
    console.log("fetch: no storedData");
  }
  if (
    storedData === null ||
    (storedData && storedData.timestamp < fiveMinutesAgo)
  ) {
    try {
      console.log("fetch: doing new fetch");
      //const response = await fetch("/api/balances");
      const response = await fetch("/api/balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKeys,
          // Include other necessary body parameters here
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const { balances }: { balances: ExchangeBalance[] } =
        await response.json();
      const totalBalance = balances.reduce(
        (total, { usdValue }) => total + usdValue,
        0
      );
      const localStorageObj = { balances, totalBalance, timestamp: Date.now() };
      localStorage.setItem(localStorageKey, JSON.stringify(localStorageObj));
      const history: BalanceHistoryItem[] = saveBalanceHistory(totalBalance);
      console.log("Set localStorage data as", localStorageObj);
      console.log("Fetched new data");
      return { balances, totalBalance, history };
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      throw error;
    }
  } else {
    console.log("fetch: Using cached data", storedData);
    if (!storedData) throw Error("storedData should not be null");
    return {
      balances: storedData.balances,
      totalBalance: storedData.totalBalance,
      history: history || [],
    };
  }
};

interface UseFetchBalancesProps {
  selectedExchange: string;
  selectedCoin: string;
  hideStables: boolean;
  hideMajors: boolean;
  openOrders: Order[];
  apiKeys: ApiKeys | undefined;
}

export const useFetchBalances = ({
  selectedExchange,
  selectedCoin,
  hideStables,
  hideMajors,
  openOrders,
  apiKeys,
}: UseFetchBalancesProps) => {
  const [balances, setBalances] = useState<ExchangeBalance[] | null>(null);
  const [safeBalances, setSafeBalances] = useState<ExchangeBalance[] | null>(
    null
  );
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [amountInStables, setAmountInStables] = useState<number>(0);
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [coins, setCoins] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchData = () => {
      fetchAndUpdateBalances(apiKeys)
        .then(({ balances, totalBalance, history }) => {
          console.log(
            `fetch: fetchAndUpdateBalances filter for  ${selectedExchange}`
          );
          console.log(
            `fetch: fetchAndUpdateBalances filter for selectedCoin ${selectedCoin}`
          );
          console.log("init useEffect");
          console.log("firstLoad is ", firstLoad);
          if (firstLoad) {
            const balanceCoins: string[] =
              balances?.map((balance) => balance.coin) || [];
            console.log(
              "init set coins",
              coins.concat([...new Set(balanceCoins)])
            );
            setFirstLoad(false);
            setCoins(coins.concat([...new Set(balanceCoins)]));
          }

          const filteredExchangeBalances =
            selectedExchange === "All"
              ? balances
              : balances.filter(
                  (balance) => balance.exchange === selectedExchange
                );
          const filteredExchangeCoinBalances =
            selectedCoin === "All"
              ? filteredExchangeBalances
              : filteredExchangeBalances.filter(
                  (balance) => balance.coin === selectedCoin
                );
          const amountInStables = filteredExchangeCoinBalances
            .filter(
              (balance) =>
                balance.coin === "USDT" ||
                balance.coin === "USD" ||
                balance.coin === "USDC"
            )
            .reduce(
              (accumulator, balance) => accumulator + balance.usdValue,
              0
            );

          console.log("hideStables is ", hideStables);
          const filteredStables = hideStables
            ? filteredExchangeCoinBalances.filter(
                (balance) =>
                  balance.coin !== "USDT" &&
                  balance.coin !== "USD" &&
                  balance.coin !== "USDC"
              )
            : filteredExchangeCoinBalances;
          const filteredHideMajors = hideMajors
            ? filteredExchangeCoinBalances.filter(
                (balance) =>
                  balance.coin !== "BTC" &&
                  balance.coin !== "ETH" &&
                  balance.coin !== "SOL"
              )
            : filteredExchangeCoinBalances;
          console.log("filteredStables.sort() ", filteredHideMajors.sort());
          setBalances(filteredStables.sort());
          setAmountInStables(amountInStables);
          setTotalBalance(totalBalance);
          setHistory(history);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching balances:", error);
          setIsLoading(false);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // Poll every 5 minutes

    return () => clearInterval(intervalId);
  }, [selectedExchange, selectedCoin, hideStables]);

  return {
    balances,
    safeBalances,
    totalBalance,
    amountInStables,
    history,
    isLoading,
    coins,
  };
};
