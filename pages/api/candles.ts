// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parseExchangePair, transformExchangePairFormat } from "@/utils";

type Time = {
  time: number;
  high: number;
  low: number;
  open: number;
  volumefrom: number;
  volumeto: number;
  close: number;
  string: string;
  conversionSymbol: string;
};

type ChartRequest = {
  resolution: string;
  market: string;
  from: number;
  to: number;
  first: boolean;
  limit: number | undefined;
};

type ResponseData = {
  Response: string;
  Type: number;
  Aggregated: boolean;
  TimeTo: number;
  TimeFrom: number;
  FirstValueInArray: boolean;
  ConversionType: { type: string; conversionSymbol: string };
  Data: Time[];
};
function validateAndConvertQuery(query: any): ChartRequest {
  // Implement validation and conversion here
  // This is a critical step to ensure runtime safety
  return {
    resolution: query.resolution,
    market: query.market as string,
    from: parseInt(query.from),
    to: parseInt(query.to),
    first: query.first === "true",
    limit: query.limit ? parseInt(query.limit) : undefined,
  };
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const qMarket = req.query.market;

  const { resolution, market, from, to, first, limit } =
    validateAndConvertQuery(req.query);

  console.log("fetching candles for ", qMarket);
  // const market: string | undefined = Array.isArray(qMarket)
  //   ? qMarket[0]
  //   : qMarket;
  if (!market) {
    throw Error("Invalid or missing market");
  }
  const { pair } = parseExchangePair(
    transformExchangePairFormat(market) as string
  );
  console.log("pair: ", pair);
  const fsym = pair.split("/")[0];
  const tsym = pair.split("/")[1];
  //defaultWidgetProps.symbol = `${exchange}:${pair}`;
  const toTs = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  const queryLimit = limit ? limit : "1000";
  const dataPeriod =
    resolution === "D"
      ? "data/histoday"
      : Number(resolution) >= 60
      ? "data/histohour"
      : "data/histominute";

  const url = `https://min-api.cryptocompare.com/${dataPeriod}?fsym=${fsym}&tsym=${tsym}&toTs=${toTs}&limit=${queryLimit}`;

  console.log("cryptocompare url: ", url);
  try {
    const response = await axios.get(url);
    // Assuming the API response structure matches what you're expecting
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
    // res.status(500).json({ Response: "Failed to fetch candle data" });
    throw new Error("Failed to fetch candle data");
  }
}
