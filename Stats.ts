import Position from "./interfaces/Position";
import TradingStatistics from "./interfaces/TradingStatistics";

export function calculateTradingStatistics(
  positions: Position[]
): TradingStatistics {
  let wins = 0;
  let losses = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  const holdingTimes: number[] = [];
  const profitsAndLosses: number[] = [];

  positions.forEach((position) => {
    if (!position.ProfitLoss)
      throw new Error(`ProfitLoss is not defined, ${position}`);
    const profitOrLoss: number = position.ProfitLoss;
    profitsAndLosses.push(profitOrLoss);

    // Calculate holding time
    const duration = new Date(position.Date).getTime(); // Assuming all trades have the same date for simplicity
    holdingTimes.push(duration);

    if (profitOrLoss > 0) {
      wins++;
      totalProfit += profitOrLoss;
    } else {
      losses++;
      totalLoss += profitOrLoss;
    }
  });

  const totalTrades = wins + losses;
  const strikeRate = (wins / totalTrades) * 100;
  const averageLossPerTrade = totalLoss / losses || 0;
  const averageWinPerTrade = totalProfit / wins || 0;

  // Sort profits and losses to find the biggest 3 wins and losses
  const sortedProfitsAndLosses = profitsAndLosses.sort((a, b) => a - b);
  const biggestLosses = sortedProfitsAndLosses.slice(0, 3);
  const biggestWins = sortedProfitsAndLosses.slice(-3).reverse();

  // Calculate average holding time
  const averageHoldingTime =
    holdingTimes.length > 0
      ? new Date(
          holdingTimes.reduce((a, b) => a + b, 0) / holdingTimes.length
        ).toISOString()
      : "";

  return {
    totalTrades,
    strikeRate,
    averageLossPerTrade,
    averageWinPerTrade,
    biggestLosses,
    biggestWins,
    averageHoldingTime,
  };
}
