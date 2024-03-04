// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import { apiKeys } from "@/ApiKeys";
import Exchange, { ExchangeName, isExchangeName } from "@/Exchange";
import ccxt, { Trade as CCxtLibTrade } from "ccxt";
import { Order } from "@/interfaces/Order";

interface CCxtTrade extends CCxtLibTrade {
  margin?: string;
  leverage?: string;
  misc?: string;
}

type ResponseData = {
  orders: Order[];
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  //const since = req.query.since ? Number(req.query.since) : undefined;

  const exchangeIdRaw = req.query.exchangeId;

  const pairIdRaw: string | string[] | undefined = req.query.pair;
  const pairString: string | undefined = Array.isArray(pairIdRaw)
    ? pairIdRaw[0]
    : pairIdRaw;
  const pair = pairString
    ? pairString.replace("_", "/").toUpperCase()
    : pairString;
  //   const pair = "BTC/USDT";

  if (typeof exchangeIdRaw !== "string" || !isExchangeName(exchangeIdRaw)) {
    return res
      .status(400)
      .json({ orders: [], error: "Invalid or missing exchangeId" });
  }

  const exchangeId: ExchangeName = exchangeIdRaw;

  const exchange = new Exchange(
    ccxt,
    apiKeys[exchangeId].apiKey,
    apiKeys[exchangeId].apiSecret,
    exchangeId
  );

  try {
    //23 mins rate limit binance: const orders: any = await exchange.fetchOpenOrders();
    const orders: Order[] = await exchange.fetchOpenOrders(exchangeId, pair);

    const response: ResponseData = { orders, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch open order data:", error);
    res.status(500).json({ orders: [], error: "Failed to fetch open orders" });
  }
}
