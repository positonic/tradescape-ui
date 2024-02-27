export default interface Position {
  Date: string;
  ProfitLoss: number | null;
  Duration: string;
  PositionType: "long" | "short";
  AverageEntryPrice: number;
  AverageExitPrice: number;
  TotalCostBuy: number | null;
  TotalCostSell: number | null;
  Orders: any[];
}
