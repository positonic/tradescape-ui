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

import { TradeManager, getExchangeConfig } from "@/TradeManager";
import { ExchangeConfig } from "@/interfaces/ExchangeConfig";
import { Trade } from "@/interfaces/Trade";
import { Order } from "@/interfaces/Order";
import { TradeResponseData } from "./TradeResponseData";
import { getExchangeCoinPairs } from "@/exchangeCoinPairs";
import { matchOrdersToPositions } from "@/PositionManager";

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

// Parses orders and creates positions
