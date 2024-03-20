// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import Exchange, {
  initExchanges,
  isExchangeName,
  aggregateTrades,
} from "@/Exchange";

import {
  sortDescending,
  parseExchangePair,
  parseQuoteBaseFromPair,
} from "@/utils";

// Define the interface for the Trade array
export type FetchTradesReturnType = Record<string, Trade>;

interface Position {
  Date: string;
  ProfitLoss: number;
  Duration: string;
  PositionType: "long" | "short";
  AverageEntryPrice: number;
  AverageExitPrice: number;
  TotalCostBuy: number;
  TotalCostSell: number;
  Orders: Order[];
}

import { TradeManager, getExchangeConfig } from "@/TradeManager";
import { ExchangeConfig } from "@/interfaces/ExchangeConfig";
import { Trade } from "@/interfaces/Trade";
import { Order } from "@/interfaces/Order";
import { TradeResponseData } from "./TradeResponseData";
import { getExchangeCoinPairs } from "@/exchangeCoinPairs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TradeResponseData>
) {
  //http://localhost:3000/api/trades?exchangeId=binance&since=null

  //const pair = "BTC/USDT";
  const pair = req.query.pair as string;

  const since = req.query.since ? Number(req.query.since) : undefined;

  const exchange: string | undefined = req.query.exchangeId as string;

  if (
    !since &&
    (!pair || !exchange || (exchange && !isExchangeName(exchange)))
  ) {
    return res.status(400).json({
      trades: [],
      orders: [],
      positions: [],
      error:
        "Error: api/trades: If you don't specify an exchnage and pair, you must specify a since parameter",
    });
  }

  const config: ExchangeConfig[] = getExchangeConfig(exchange);

  const exchanges: Record<string, Exchange> = initExchanges();
  console.log("exchanges is ", exchanges);
  const tradeManager = new TradeManager(config, exchanges);

  let trades: Trade[] = [];

  const { base, quote } = parseQuoteBaseFromPair(pair);
  const pairs = getExchangeCoinPairs(exchange, base, undefined);
  const pairsList = pair ? [pair] : undefined;
  console.log("pairs is ", pairs);
  console.log("exchangeId is ", exchange);
  try {
    trades = await tradeManager.getAllTrades(pairsList, since);

    console.log("trades is ", trades);

    const orders: Order[] = aggregateTrades(trades).sort(sortDescending);

    console.log("orders is ", orders);

    const positions = matchOrdersToPositions(orders);

    const response: TradeResponseData = {
      trades,
      orders,
      positions,
      error: "",
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch trades:", error);
    res.status(500).json({
      trades: [],
      orders: [],
      positions: [],
      error: "Failed to fetch TRADES",
    });
  }
}

// Helper to format duration
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

// Parses orders and creates positions
const matchOrdersToPositions = (orders: Order[]): Position[] => {
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
