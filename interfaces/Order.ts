import { Trade } from "./Trade";

export interface Order {
  id: string;
  ordertxid?: string;
  time: number; // The time the trade position was opened
  date: Date;
  type: "buy" | "sell";
  pair: string;
  amount: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  exchange: string | undefined; // Have to allow undefined due to ccxt
  trades: Trade[]; // Add an array of trades
  orderId?: string;
  status?: string;
  totalCost: number;
  fee: number;
}
