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
  conversionType: string;
  conversionSymbol: string;
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const market = req.query.market;
  console.log("fetching candles for ", market);
  const { exchange, pair } = parseExchangePair(
    transformExchangePairFormat(market) as string
  );
  console.log("pair: ", pair);
  const fsym = pair.split("/")[0];
  const tsym = pair.split("/")[1];
  //defaultWidgetProps.symbol = `${exchange}:${pair}`;
  const toTs = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const limit = "1000"; // Example: Get 1000 data points
  const url = `https://min-api.cryptocompare.com/data/histoday?fsym=${fsym}&tsym=${tsym}&toTs=${toTs}&limit=${limit}`;

  try {
    const response = await axios.get(url);
    // Assuming the API response structure matches what you're expecting
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
    res.status(500).json({ error: "Failed to fetch candle data" });
  }
}