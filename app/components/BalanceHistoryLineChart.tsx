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
  console.log("BalanceHistory is ", balanceHistory);
  console.log("Typeof BalanceHistory is ", typeof balanceHistory);
  const data = balanceHistory
    ? balanceHistory.map((item) => ({
        Balance: item.totalBalance,
        date: new Date(item.timestamp).toLocaleDateString(),
      }))
    : [];

  console.log("BalanceHistory", data);
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
