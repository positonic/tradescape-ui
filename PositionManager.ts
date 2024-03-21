import { Order } from "@/interfaces/Order";
import Position from "./interfaces/Position";
export const matchOrdersToPositions = (orders: Order[]): Position[] => {
  const buyOrders = orders.filter((order) => order.type === "buy");
  const sellOrders = orders.filter((order) => order.type === "sell");
  const positions: Position[] = [];

  // Simplistic approach: match each buy with the closest sell in time
  for (const buy of buyOrders) {
    const matchingSell = sellOrders.reduce((prev, current) => {
      return prev === null ||
        Math.abs(current.time - buy.time) < Math.abs(prev.time - buy.time)
        ? current
        : prev;
    }, null as Order | null);

    if (matchingSell) {
      const duration = matchingSell.time - buy.time;
      positions.push({
        Date: new Date(buy.time).toISOString(),
        // ProfitLoss:
        //   matchingSell.totalCost - matchingSell.fee - (buy.totalCost + buy.fee),
        //ProfitLoss: matchingSell.totalCost - (buy.totalCost + buy.fee),
        ProfitLoss: matchingSell.totalCost - buy.totalCost,
        Duration: formatDuration(duration),
        PositionType: buy.time < matchingSell.time ? "long" : "short",
        AverageEntryPrice: buy.averagePrice,
        AverageExitPrice: matchingSell.averagePrice,
        //TotalCostBuy: buy.totalCost + buy.fee,
        TotalCostBuy: buy.totalCost,
        //TotalCostSell: matchingSell.totalCost - matchingSell.fee,
        TotalCostSell: matchingSell.totalCost,
        Orders: [buy, matchingSell],
      });

      // Remove the matched sell order
      sellOrders.splice(sellOrders.indexOf(matchingSell), 1);
    }
  }

  return positions;
};

const formatDuration = (durationInMs: number): string => {
  const durationInDays = durationInMs / (1000 * 60 * 60 * 24);
  if (durationInDays < 1) return "< 1 day";
  if (durationInDays < 2) return "> 1 day";
  if (durationInDays < 3) return "> 2 days";
  if (durationInDays < 4) return "> 3 days";
  if (durationInDays < 7) return "> 7 days";
  if (durationInDays < 30) return "> 1 week";
  return "> 1 month";
};
