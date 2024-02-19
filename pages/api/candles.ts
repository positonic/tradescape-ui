// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

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
  const toTs = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const limit = "1000"; // Example: Get 1000 data points
  const url = `https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&toTs=${toTs}&limit=${limit}`;

  try {
    const response = await axios.get(url);
    // Assuming the API response structure matches what you're expecting
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
    res.status(500).json({ error: "Failed to fetch candle data" });
  }
}
