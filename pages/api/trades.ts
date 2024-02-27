// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import ccxt from "ccxt";
import { parseExchangePair } from "@/utils";
import { AggregatedOrder, aggregateTrades } from "@/Exchange";

const sortDescending = (a: NormalizedTrade, b: NormalizedTrade) =>
  b.time - a.time;
const sortAscending = (a: NormalizedTrade, b: NormalizedTrade) =>
  a.time - b.time;

export interface NormalizedTrade {
  id: string;
  ordertxid: string;
  pair: string;
  time: number;
  type: string;
  ordertype: string;
  price: string;
  cost: string;
  fee: string;
  vol: number;
  margin: string;
  leverage: string;
  misc: string;
  exchange: string;
}
// Define the interface for the Trade array
export type FetchTradesReturnType = Record<string, NormalizedTrade>;
interface ApiKeys {
  [key: string]: ApiKey;
}
interface ApiKeys {
  kraken: ApiKey;
  binance: ApiKey;
}
interface ApiKey {
  apiKey: string;
  apiSecret: string;
}

interface Position {
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

type ResponseData = {
  trades: NormalizedTrade[];
  orders: AggregatedOrder[];
  positions: Position[];
  error: string;
};

const apiKeys: ApiKeys = {
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY as string,
    apiSecret: process.env.KRAKEN_API_SECRET as string,
  },
  binance: {
    apiKey: process.env.BINANCE_API_KEY as string,
    apiSecret: process.env.BINANCE_API_SECRET as string,
  },
};
import Exchange from "@/Exchange";
type ExchangeName = "kraken" | "binance";
// Utility type guard to check if a string is a valid ExchangeName
function isExchangeName(value: string): value is ExchangeName {
  return ["binance", "kraken"].includes(value);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const since = req.query.since ? Number(req.query.since) : undefined;
  // Attempt to retrieve exchangeId from the query, with a fallback
  const exchangeIdRaw = req.query.exchangeId;
  const market = req.query.market;
  //const pair = "BTC/USDT";
  const { pair } = parseExchangePair(market as string);
  // Ensure exchangeId is a string and matches ExchangeName; otherwise, handle the error
  if (typeof exchangeIdRaw !== "string" || !isExchangeName(exchangeIdRaw)) {
    return res
      .status(400)
      .json({ trades: [], error: "Invalid or missing exchangeId" });
  }

  const exchangeId: ExchangeName = exchangeIdRaw;

  const exchange = new Exchange(
    ccxt,
    apiKeys[exchangeId].apiKey,
    apiKeys[exchangeId].apiSecret,
    "binance"
  );

  try {
    console.log("fetching trades for ", pair, since);
    const exchangeTrades: FetchTradesReturnType = await exchange.fetchTrades(
      pair,
      since
    );
    const trades: NormalizedTrade[] =
      Object.values(exchangeTrades).sort(sortAscending);
    const orders: AggregatedOrder[] =
      aggregateTrades(trades).sort(sortDescending);
    // Assuming the API response structure matches what you're expecting
    // Example usage:

    const positions = matchOrdersToPositions(orders);

    const response: ResponseData = { trades, orders, positions, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
    res.status(500).json({ error: "Failed to fetch candle data" });
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
const matchOrdersToPositions = (orders: AggregatedOrder[]): Position[] => {
  const buyOrders = orders.filter((order) => order.type === "buy");
  const sellOrders = orders.filter((order) => order.type === "sell");
  const positions: Position[] = [];

  // Simplistic approach: match each buy with the closest sell in time
  for (const buy of buyOrders) {
    let matchingSell = sellOrders.reduce((prev, current) => {
      return prev === null ||
        Math.abs(current.time - buy.time) < Math.abs(prev.time - buy.time)
        ? current
        : prev;
    }, null as AggregatedOrder | null);

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
