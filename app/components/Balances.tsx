"use client";
import { useState, useEffect } from "react";
import { Loader } from "@mantine/core";
import ExchangeBalance from "@/interfaces/ExchangeBalance";
import DonutChart from "./DonutChart";
//import BalanceHistory from "./BalanceHistory";
import BalanceHistoryLineChart from "./BalanceHistoryLineChart";
import { formatCurrency, colors } from "@/utils";

interface BalanceData {
  timestamp: number;
  balances: ExchangeBalance[];
  totalBalance: number;
}
interface FetchUpdate {
  balances: ExchangeBalance[];
  totalBalance: number;
  history: BalanceHistoryItem[];
}
interface BalanceHistoryItem {
  timestamp: number;
  totalBalance: number;
}
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
  const storedDataJSON = localStorage.getItem(localStorageKey);
  const historyJSON = localStorage.getItem(balanceHistoryKey);
  const storedData: BalanceData | null = storedDataJSON
    ? JSON.parse(storedDataJSON)
    : null;
  const history: BalanceHistoryItem[] | null = historyJSON
    ? JSON.parse(historyJSON)
    : null;
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

  if (storedData && storedData.timestamp > fifteenMinutesAgo) {
    console.log("Using cached data", storedData);
    return {
      balances: storedData.balances,
      totalBalance: storedData.totalBalance,
      history: history || [],
    };
  } else {
    try {
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
  }
};

const BalancesComponent: React.FC = () => {
  const [balances, setBalances] = useState<BalanceData["balances"] | null>(
    null
  );
  const [totalBalance, setTotalBalances] = useState<number>(0);
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAndUpdateBalances()
      .then(({ balances, totalBalance, history }) => {
        setBalances(balances);
        setTotalBalances(totalBalance);
        setHistory(history);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching balances:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }
  console.log("balances are", balances);
  console.log("history are", history);
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Free
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                $USD Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exchange
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
                          {free}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {used}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${usdValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {exchange}
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
