import TradingStatistics from "@/interfaces/TradingStatistics";
import React from "react";

interface TradingStatsProps {
  statistics: TradingStatistics;
}

const TradingStats: React.FC<TradingStatsProps> = ({ statistics }) => {
  // The calculation of statistics would go here. This is a placeholder.

  return (
    <div className="p-4 max-w-xl mx-auto rounded-xl shadow-md space-y-2 sm:p-6">
      <h1 className="font-bold text-xl">Trading Statistics</h1>
      <div>Total Trades: {statistics.totalTrades}</div>
      <div>Strike Rate: {statistics.strikeRate}%</div>
      <div>Average Loss: ${statistics.averageWinPerTrade}</div>
      <div>Average Win: ${statistics.averageLossPerTrade}</div>
      <div>Biggest Losses: ${statistics.biggestLosses.join(", $")}</div>
      <div>Biggest Wins: ${statistics.biggestWins.join(", $")}</div>
      <div>Average Trade Duration: {statistics.averageHoldingTime}</div>
    </div>
  );
};

export default TradingStats;
