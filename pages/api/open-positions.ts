// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import { apiKeys } from "@/ApiKeys";
import Exchange, { ExchangeName, isExchangeName } from "@/Exchange";
import ccxt from "ccxt";

type ResponseData = {
  positions: any[];
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const since = req.query.since ? Number(req.query.since) : undefined;

  const exchangeIdRaw = req.query.exchangeId;
  //const market = req.query.market;
  const pair = "BTC/USDT";

  if (typeof exchangeIdRaw !== "string" || !isExchangeName(exchangeIdRaw)) {
    return res
      .status(400)
      .json({ positions: [], error: "Invalid or missing exchangeId" });
  }

  const exchangeId: ExchangeName = exchangeIdRaw;

  const exchange = new Exchange(
    ccxt,
    apiKeys[exchangeId].apiKey,
    apiKeys[exchangeId].apiSecret,
    exchangeId
  );

  try {
    console.log("fetching positions for ", pair, since);
    const positions: any = await exchange.fetchOpenPositions(["BTC/USDT"]);

    const response: ResponseData = { positions, error: "" };
    res.status(200).json(response);
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
    res.status(500).json({ positions: [], error: "Failed to fetch TRADES" });
  }
}
