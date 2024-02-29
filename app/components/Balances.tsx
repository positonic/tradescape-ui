"use client";
import BalanceHistoryLineChart from "./BalanceHistoryLineChart";
import ExchangeBalance from "@/interfaces/ExchangeBalance";
import BalanceHistoryItem from "./BalanceHistoryItem";
import { formatCurrency, colors } from "@/utils";
import { Loader, Select } from "@mantine/core";
import { useState, useEffect } from "react";
import FetchUpdate from "./FetchUpdate";
import BalanceData from "./BalanceData";
import DonutChart from "./DonutChart";
import OpenOrders from "./OpenOrders";
import { Checkbox } from "@mantine/core";

const exchangeSelectOptions = [
  { value: "All", label: "All" },
  { value: "Binance", label: "Binance" },
  { value: "Bybit", label: "Bybit" },
  { value: "Kraken", label: "Kraken" },
];

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
const fetchAndUpdateBalances = async (): Promise<FetchUpdate> => {
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
  if (storedData && storedData.timestamp < fiveMinutesAgo) {
    try {
      console.log("fetch: doing new fetch");
      const response = await fetch("/api/balances");
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
    return {
      balances: storedData.balances,
      totalBalance: storedData.totalBalance,
      history: history || [],
    };
  }
};

const BalancesComponent: React.FC = () => {
  const [balances, setBalances] = useState<BalanceData["balances"] | null>(
    null
  );
  const [totalBalance, setTotalBalances] = useState<number>(0);
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedExchange, setSelectedExchange] = useState<string>("All");
  const [selectedCoin, setSelectedCoin] = useState<string>("All");
  const [coins, setCoins] = useState<string>(["All"]);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [hideStables, setHideStables] = useState(false);

  const fetchData = (postFetchCallback: { (): void; (): void } | undefined) => {
    fetchAndUpdateBalances()
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
        console.log("hideStables is ", hideStables);
        const filteredStables = hideStables
          ? filteredExchangeCoinBalances.filter(
              (balance) =>
                balance.coin !== "USDT" &&
                balance.coin !== "USD" &&
                balance.coin !== "USDC"
            )
          : filteredExchangeCoinBalances;
        setBalances(filteredStables.sort());
        setTotalBalances(totalBalance);
        setHistory(history);
        setIsLoading(false);
        if (postFetchCallback) {
          postFetchCallback();
        }
      })
      .catch((error) => {
        console.error("Error fetching balances:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Fetch data immediately upon component mount
    fetchData(undefined);

    // Set up polling every 5 minutes
    const intervalId = setInterval(() => fetchData(undefined), 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedExchange, selectedCoin, hideStables]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }
  function onChange(value: string | null) {
    if (!value) throw Error("Exchange select value should not be null");
    setSelectedExchange(value);
  }
  function onChangeCoin(value: string | null) {
    console.log("onChangeCoin value is ", value);
    if (!value) throw Error("Coin select value should not be null");
    setSelectedCoin(value);
  }

  return (
    <div className="p-4">
      <div className="flex justify-end">
        <span className="text-3xl font-semibold">
          {formatCurrency(totalBalance)}
        </span>
      </div>
      <div className="flex">
        <div className="w-[400px] p-4 text-white">
          <DonutChart assets={balances} colors={colors} />
        </div>
        <div className="flex-grow p-4 text-white">
          {/* <BalanceHistory balanceHistory={history} /> */}
          <BalanceHistoryLineChart balanceHistory={history} />
        </div>
      </div>
      <div>
        <h2>Balances per Exchange</h2>

        <OpenOrders />
        <div className="flex">
          <div className="w-[400px] p-4 text-white">
            <Select
              label="Select coin"
              placeholder="Select exchange"
              onChange={onChangeCoin}
              data={coins}
              searchable
            />
          </div>
          <div className="flex-grow p-4 text-white">
            <Checkbox
              label="Hide stables"
              checked={hideStables}
              onChange={(event) => setHideStables(event.currentTarget.checked)}
            />
          </div>
          <div className="flex-grow p-4 text-white">
            <Select
              label="Select exchange"
              placeholder="Select exchange"
              onChange={onChange}
              limit={5}
              data={exchangeSelectOptions}
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                $USD Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {balances &&
              balances.map(
                ({ coin, free, used, total, usdValue, exchange }) => {
                  if (total > 0 && usdValue > 100) {
                    return (
                      <tr key={exchange + "-" + coin} className="mb-2">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <svg
                            className="inline-block"
                            width="20"
                            height="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="10" cy="10" r="5" fill={colors[coin]} />
                          </svg>
                          <span className="inline-block">{coin}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exchange}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(usdValue)}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                }
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalancesComponent;
