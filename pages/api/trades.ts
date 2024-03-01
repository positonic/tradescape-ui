// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import Exchange, {
  initExchanges,
  isExchangeName,
  aggregateTrades,
} from "@/Exchange";

import { sortDescending, sortAscending, parseExchangePair } from "@/utils";

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

type ResponseData = {
  trades: Trade[];
  orders: Order[];
  positions: Position[];
  error: string;
};

import { TradeManager, getExchangeConfig } from "@/TradeManager";
import { ExchangeConfig } from "@/interfaces/ExchangeConfig";
import { Trade } from "@/interfaces/Trade";
import { Order } from "@/interfaces/Order";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  //http://localhost:3000/api/trades?exchangeId=binance&since=null

  //const pair = "BTC/USDT";
  const market = req.query.market;
  const { pair } = parseExchangePair(market as string);

  const since = req.query.since ? Number(req.query.since) : undefined;
  // Attempt to retrieve exchangeId from the query, with a fallback
  const exchangeIdRaw: string | string[] | undefined = req.query.exchangeId;
  const exchangeId: string | undefined = Array.isArray(exchangeIdRaw)
    ? exchangeIdRaw[0]
    : exchangeIdRaw;

  if (exchangeId && !isExchangeName(exchangeId)) {
    return res.status(400).json({
      trades: [],
      orders: [],
      positions: [],
      error: "Invalid or missing exchangeId",
    });
  }

  const config: ExchangeConfig[] = getExchangeConfig(exchangeId);

  const exchanges: Record<string, Exchange> = initExchanges();
  console.log("exchanges is ", exchanges);
  const tradeManager = new TradeManager(config, exchanges);

  let trades: Trade[] = [];

  const pairs = pair ? [pair] : undefined;
  try {
    trades = await tradeManager.getAllTrades(pairs, since);

    console.log("trades is ", trades);

    const orders: Order[] = aggregateTrades(trades).sort(sortDescending);

    console.log("orders is ", orders);

    const positions = matchOrdersToPositions(orders);

    const response: ResponseData = { trades, orders, positions, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
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
