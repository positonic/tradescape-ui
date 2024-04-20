import { Order } from "@/interfaces/Order";
import Position from "./interfaces/Position";
export const matchOrdersToPositionsOld = (orders: Order[]): Position[] => {
  const buyOrders = orders.filter((order) => order.type === "buy");
  const sellOrders = orders.filter((order) => order.type === "sell");
  const totalBought = buyOrders.reduce((acc, order) => acc + order.amount, 0);
  const totalSold = sellOrders.reduce((acc, order) => acc + order.amount, 0);
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
        amount: buy.amount,
      });

      // Remove the matched sell order
      sellOrders.splice(sellOrders.indexOf(matchingSell), 1);
    }
  }

  return positions;
};
function positionIsClosed(balance: number): boolean {
  return Math.abs(balance) < 1;
}
export function matchOrdersToPositions(
  orders: Order[],
  initialBalance: number = 0
): Position[] {
  const positions: Position[] = [];
  let openBalance: number = initialBalance;
  let openPositionOrders: Order[] = [];
  let openPositionTotalAmountBuy: number = 0;
  let openPositionTotalAmountSell: number = 0;
  let openPositionTotalCostBuy: number = 0;
  let openPositionTotalCostSell: number = 0;

  orders.forEach((order: Order, key: number) => {
    console.log("order.type is ", key, order.type);
    if (order.type === "buy") {
      openPositionTotalAmountBuy += order.amount;
      openPositionTotalCostBuy += order.totalCost;
      openBalance += order.amount; // Reflect the buy order in openBalance
    } else {
      // Assuming order.type === "sell"
      openPositionTotalAmountSell += order.amount;
      openPositionTotalCostSell += order.totalCost;
      openBalance -= order.amount; // Reflect the sell order in openBalance
    }

    openPositionOrders.push(order);
    console.log("openBalance ", openBalance);
    // Evaluate if position should be considered closed
    if (positionIsClosed(openBalance)) {
      const averageBuyPrice =
        openPositionTotalAmountBuy > 0
          ? openPositionTotalCostBuy / openPositionTotalAmountBuy
          : 0;
      const averageSellPrice =
        openPositionTotalAmountSell > 0
          ? openPositionTotalCostSell / openPositionTotalAmountSell
          : 0;

      const profitLoss = openPositionTotalCostSell - openPositionTotalCostBuy; // Adjust based on your profit/loss logic

      const positionType =
        openPositionTotalCostBuy >= openPositionTotalCostSell
          ? "long"
          : "short";
      const positionAmount =
        positionType === "long"
          ? openPositionTotalAmountBuy
          : openPositionTotalAmountSell;
      positions.push({
        Date: new Date(order.time).toISOString(), // Consider adjusting this based on actual opening/closing time
        ProfitLoss: profitLoss,
        Duration: "0", // Placeholder, calculate actual duration
        PositionType:
          openPositionTotalCostBuy >= openPositionTotalCostSell
            ? "long"
            : "short",
        AverageEntryPrice: averageBuyPrice,
        AverageExitPrice: averageSellPrice,
        TotalCostBuy: openPositionTotalCostBuy,
        TotalCostSell: openPositionTotalCostSell,
        Orders: openPositionOrders,
        amount: positionAmount,
      });

      // Reset for the next position
      openPositionOrders = [];
      openPositionTotalAmountBuy = 0;
      openPositionTotalAmountSell = 0;
      openPositionTotalCostBuy = 0;
      openPositionTotalCostSell = 0;
      openBalance = 0; // Reset balance for the next position
    }
  });

  return positions;
}
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
