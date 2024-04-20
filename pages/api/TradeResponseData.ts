import { Order } from "@/interfaces/Order";
import Position from "@/interfaces/Position";
import { Trade } from "@/interfaces/Trade";

export type TradeResponseData = {
  trades: Trade[];
  orders: Order[];
  positions: Position[];
  error: string;
  rotki?: true;
};
