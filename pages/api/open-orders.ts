// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import { apiKeys } from "@/ApiKeys";
import Exchange, { ExchangeName, isExchangeName } from "@/Exchange";
import ccxt from "ccxt";

type ResponseData = {
  orders: any[];
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const since = req.query.since ? Number(req.query.since) : undefined;

  const exchangeIdRaw = req.query.exchangeId;
  const market = req.query.market;
  const pair = "BTC/USDT";

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
    const orders: any = await exchange.fetchOpenOrders();
    console.log("IIIII", orders);
    const response: ResponseData = { orders, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch open order data:", error);
    res.status(500).json({ orders: [], error: "Failed to fetch open orders" });
  }
}
