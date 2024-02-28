import React from "react";
import { LineChart } from "@mantine/charts";

// Define the BalanceHistoryItem interface
interface BalanceHistoryItem {
  timestamp: number;
  totalBalance: number;
}

// Props expected by the component
interface BalanceHistoryChartProps {
  balanceHistory: BalanceHistoryItem[];
}

// The component
const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  balanceHistory,
}) => {
  // Transform BalanceHistoryItem[] into Sparkline data

  const data = balanceHistory
    ? balanceHistory.map((item) => ({
        Balance: item.totalBalance,
        date: new Date(item.timestamp).toLocaleString("en-UK", {
          year: "2-digit", // "2021"
          month: "short", // "July"
          day: "numeric", // "19"
          hour: "2-digit", // "12" AM/PM format
          minute: "2-digit", // "00"
          hour12: true, // Use AM/PM
        }),
      }))
    : [];

  return (
    <div>
      <h2>Balance History</h2>
      <LineChart
        data={data}
        dataKey="date"
        // labels={data.map((item) => item.label)}
        h={300} // Adjust the height as needed
        series={[
          { name: "Balance", color: "indigo.6" },
          //   ,
          //   { name: "BTC", color: "blue.6" },
          //   { name: "ETH", color: "teal.6" },
        ]}
        curveType="linear"
      />
    </div>
  );
};

export default BalanceHistoryChart;
