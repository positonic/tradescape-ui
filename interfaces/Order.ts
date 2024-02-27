import { Trade } from "./Trade";
export type Order = {
  totalCost: number;
  ordertxid: string;
  time: number;
  date: string; // ISO 8601 format date
  type: "buy" | "sell"; // Assuming type can be 'buy' or 'sell'
  pair: string;
  amount: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  exchange: string;
  trades: Trade[];
};
