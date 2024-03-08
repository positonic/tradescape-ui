import React from "react";
import { LineChart } from "@mantine/charts";
import { createSummary } from "@/utils";

// Define the BalanceEntry interface

// Props expected by the component
interface BalanceHistoryChartProps {
  balanceHistory: BalanceEntry[];
}

type BalanceEntry = {
  timestamp: string; // Assuming ISO 8601 format for simplicity
  totalBalance: number;
};

type FormattedSlotEntry = {
  Balance: number;
  date: string;
};

const generateFormattedBalancesAtSlots = (
  entries: BalanceEntry[]
): FormattedSlotEntry[] => {
  // Ensure entries are sorted by timestamp
  entries.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const result: FormattedSlotEntry[] = [];
  if (entries.length === 0) return result;

  let currentTime = new Date(entries[0].timestamp);
  const endTime = new Date(entries[entries.length - 1].timestamp);

  // Define slot offsets in hours
  const slotOffsets = [0, 6, 12, 18];

  while (currentTime <= endTime) {
    slotOffsets.forEach((offset) => {
      const slotTime = new Date(currentTime);
      slotTime.setHours(currentTime.getHours() + offset, 0, 0, 0); // Adjust to the nearest slot time

      // Find the entry closest to this slot time
      const closestEntry = entries.reduce((prev, curr) =>
        Math.abs(new Date(curr.timestamp).getTime() - slotTime.getTime()) <
        Math.abs(new Date(prev.timestamp).getTime() - slotTime.getTime())
          ? curr
          : prev
      );

      result.push({
        Balance: closestEntry.totalBalance,
        date: slotTime
          .toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .replace(",", ""),
      });
    });

    // Move to the next day
    currentTime.setDate(currentTime.getDate() + 1);
    currentTime.setHours(0, 0, 0, 0); // Reset to midnight
  }

  return result;
};

// The component
const BalanceHistoryChart: React.FC<BalanceHistoryChartProps> = ({
  balanceHistory,
}) => {
  // Transform BalanceEntry[] into Sparkline data
  const balanceHistorySummary =
    generateFormattedBalancesAtSlots(balanceHistory);

  const chartData: any[] = balanceHistorySummary
    ? balanceHistorySummary.map((item) => ({
        Balance: item.Balance,
        date: new Date(item.date).toLocaleString("en-UK", {
          year: "2-digit", // "2021"
          month: "short", // "July"
          day: "numeric", // "19"
          hour: "2-digit", // "12" AM/PM format
          minute: "2-digit", // "00"
          hour12: true, // Use AM/PM
        }),
      }))
    : [];
  //const chartData = data;

  console.log("balance: balanceHistory is: ", balanceHistory);
  console.log("balance: chartData is ", chartData);

  return (
    <div>
      <h2>Balance History</h2>
      <LineChart
        data={chartData}
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
