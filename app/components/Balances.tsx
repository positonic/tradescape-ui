"use client";
import BalanceHistoryLineChart from "./BalanceHistoryLineChart";
import { formatCurrency, colors } from "@/utils";
import { Loader, Select } from "@mantine/core";
import { useState } from "react";
import DonutChart from "./DonutChart";
//import OpenOrders from "./OpenOrders";
import { Checkbox } from "@mantine/core";
import { Order } from "@/interfaces/Order";
import { useFetchBalances } from "../hooks/fetchBalances";
import { useExchangeManager } from "../hooks/exchangeManager";
//import { useFetchOpenOrders } from "../hooks/fetchOpenOrders";
import { useAccount } from "wagmi";
import Signin from "./Signin";
import Settings from "./Settings";

const exchangeSelectOptions = [
  { value: "All", label: "All" },
  { value: "Binance", label: "Binance" },
  { value: "Bybit", label: "Bybit" },
  { value: "Kraken", label: "Kraken" },
];

const BalancesComponent: React.FC = () => {
  const [hideStables, setHideStables] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string>("All");
  const [selectedCoin, setSelectedCoin] = useState<string>("All");
  const openOrders: Order[] = [];
  const [isSettingsSaved, apiKeys] = useExchangeManager();

  const { balances, totalBalance, history, isLoading, coins } =
    useFetchBalances({
      selectedExchange,
      selectedCoin,
      hideStables,
      openOrders,
      apiKeys,
    });
  console.log("Balances.tsx coins: ", coins);

  // useEffect(() => {
  //   const openOrders = useFetchOpenOrders(selectedExchange, coins, undefined);
  //   console.log("fetch: openOrders Is ", openOrders);
  // }, [selectedExchange, coins]);

  //openOrders = useFetchOpenOrders(selectedExchange, coins, undefined);
  console.log("fetch: openOrders Is ", openOrders);

  const { isConnected } = useAccount();
  if (!isConnected) {
    return <Signin />;
  }

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
  const balanceTotal = balances
    ? balances.reduce((accumulator, item) => accumulator + item.usdValue, 0)
    : 0;
  return (
    <div className="p-4">
      {isSettingsSaved && (
        <>
          <div className="flex justify-end">
            <span className="text-3xl font-semibold">
              {formatCurrency(totalBalance)}
            </span>
          </div>
          <div className="flex">
            <div className="w-[400px] p-4 text-white">
              {balances && colors && (
                <DonutChart assets={balances} colors={colors} />
              )}
            </div>
            <div className="flex-grow p-4 text-white">
              {/* <BalanceHistory balanceHistory={history} /> */}
              <BalanceHistoryLineChart balanceHistory={history} />
            </div>
          </div>
          <div>
            <h2>Balances per Exchange</h2>
            <div className="flex justify-end">
              <span className="text-3xl font-semibold">
                {formatCurrency(balanceTotal)}({" "}
                {Math.round((balanceTotal / totalBalance) * 100)})%
              </span>
            </div>
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
                  onChange={(event) =>
                    setHideStables(event.currentTarget.checked)
                  }
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balances &&
                  balances.map(({ coin, total, usdValue, exchange, safe }) => {
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
                              <circle
                                cx="10"
                                cy="10"
                                r="5"
                                fill={colors[coin]}
                              />
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <svg
                              width="7"
                              height="7"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle cx="3.5" cy="3.5" r="3.5" fill="red" />
                            </svg>
                            {safe}
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })}
              </tbody>
            </table>
          </div>
          {/* <OpenOrders orders={openOrders} apiKeys={apiKeys} /> */}
        </>
      )}
      {!isSettingsSaved && <Settings />}
    </div>
  );
};

export default BalancesComponent;
