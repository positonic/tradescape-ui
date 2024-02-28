import { AggregatedOrder } from "@/Exchange";

export default interface Position {
  Date: string;
  ProfitLoss: number;
  Duration: string;
  PositionType: "long" | "short";
  AverageEntryPrice: number;
  AverageExitPrice: number;
  TotalCostBuy: number;
  TotalCostSell: number;
  Orders: AggregatedOrder[];
}
