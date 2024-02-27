import React from "react";
import { Sparkline } from "@mantine/charts";

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
  const data = balanceHistory.map((item) => ({
    value: item.totalBalance,
    label: new Date(item.timestamp).toLocaleDateString(),
  }));
  console.log(
    "balance map data",
    data.map((item) => item.value)
  );
  return (
    <div>
      <h2>Balance History</h2>
      <Sparkline
        data={data.map((item) => item.value)}
        // labels={data.map((item) => item.label)}
        h={100} // Adjust the height as needed
        w={400} // Adjust the height as needed
        //dotSize={4} // Adjust the dot size as needed
        trendColors={{
          positive: "teal.6",
          negative: "red.6",
          neutral: "gray.5",
        }}
        fillOpacity={0.2}
      />
    </div>
  );
};

export default BalanceHistoryChart;
