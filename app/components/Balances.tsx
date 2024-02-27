"use client";
import { useState, useEffect } from "react";
import { Loader } from "@mantine/core";
import ExchangeBalance from "@/interfaces/ExchangeBalance";
import PieChart from "./PieChart";

// interface BalanceData {
//   timestamp: number;
//   balances: {
//     accountId: string;
//     balance: number;
//   }[];
// }
interface BalanceData {
    timestamp: number;
    balances: ExchangeBalance[];
    totalBalance: number;
  }
  interface FetchUpdate {
    balances: ExchangeBalance[];
    totalBalance: number;
  
  }
const fetchAndUpdateBalances = async (): Promise<FetchUpdate> => {
  const localStorageKey = "balancesData";
  const storedDataJSON = localStorage.getItem(localStorageKey);
  const storedData: BalanceData | null = storedDataJSON
    ? JSON.parse(storedDataJSON)
    : null;
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

  if (storedData && storedData.timestamp > fifteenMinutesAgo) {
    console.log("Using cached data", storedData);
    return {
        balances: storedData.balances,
        totalBalance: storedData.totalBalance
    }
  } else {
    try {
      const response = await fetch("/api/balances");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const { balances } : {balances: ExchangeBalance[]}= await response.json();
      const totalBalance = balances.reduce(
        (total, { usdValue }) => total + usdValue,
        0
      )
      const localStorageObj = { balances, totalBalance, timestamp: Date.now() }
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(localStorageObj)
      );
      
      console.log("Set localStorage data as", localStorageObj)
      console.log("Fetched new data");
      return { balances, totalBalance }
    } catch (error) {
      console.error("Failed to fetch new data:", error);
      throw error;
    }
  }
};
const colors = {
  "BTC": "rgb(247, 147, 26)",
  "BLUR": "rgb(113, 87, 194)",
  "MATIC": "rgb(130, 71, 229)",
  "USD": "rgb(0, 122, 51)",
  "ZETA": "rgb(72, 130, 180)",
  "JUP": "rgb(255, 165, 0)",
  "ONDO": "rgb(255, 99, 71)",
  "PYTH": "rgb(255, 223, 186)",
  "BEAM": "rgb(76, 175, 80)",
  "LENDS": "rgb(250, 250, 250)",
  "TIA": "rgb(64, 224, 208)",
  "GRT": "rgb(96, 125, 139)",
  "SUI": "rgb(255, 105, 180)",
  "ETH": "rgb(108, 92, 231)",
  "MAV": "rgb(255, 215, 0)",
  "UMA": "rgb(0, 191, 255)",
  "ARB": "rgb(0, 206, 209)",
  "STX": "rgb(255, 69, 0)",
  "JTO": "rgb(153, 50, 204)",
  "SUPER": "rgb(233, 30, 99)",
  "VET": "rgb(0, 0, 255)",
  "NEAR": "rgb(255, 48, 79)",
  "DOT": "rgb(233, 30, 99)",
  "ALGO": "rgb(0, 178, 255)",
  "ADA": "rgb(57, 154, 202)",
  "AVAX": "rgb(227, 38, 54)",
  "USDT": "rgb(7, 193, 96)",
  "USDC": "rgb(255, 255, 255)"
}

const BalancesComponent: React.FC = () => {
  const [balances, setBalances] = useState<BalanceData["balances"] | null>(null);
  const [totalBalance, setTotalBalances] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAndUpdateBalances()
      .then(({balances, totalBalance}) => {
        setBalances(balances);
        setTotalBalances(totalBalance);
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
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Account Balances</h1>
        <PieChart assets={balances} colors={colors}/>
          <div>
            <h2 className="text-lg font-semibold">{totalBalance}</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr >
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
                {balances && balances.map(
                  ({ coin, free, used, total, usdValue, exchange }) => {
                    if (total > 0 && usdValue > 100) {
                      return (
                        <tr key={exchange+"-"+coin} className="mb-2">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" >
                          <svg  className="inline-block" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
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
        ))
      ) : (
        <p>No balance data available.</p>
      )}
    </div>
  );
};

export default BalancesComponent;
