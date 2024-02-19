"use client";
//var rp = require("request-promise").defaults({ json: true });
import axios from "axios";

// const apiRoot = 'https://min-api.cryptocompare.com'
// const apiRoot = 'http://localhost:7770'
const apiRoot = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : "";

const history = {};

export default {
  history: history,

  getBars: async function (symbolInfo, resolution, from, to, first, limit) {
    try {
      const endpoint = `/api/candles`; // Your Next.js endpoint for fetching candle data
      const response = await axios.get(`${apiRoot}${endpoint}`, {
        params: {
          symbol: symbolInfo.name, // Assuming your Next.js endpoint expects a 'symbol' param
          resolution, // Passing resolution directly, adjust according to your API
          from, // Adjust if your API expects different param names
          to,
          limit,
        },
      });

      const { data } = response;
      if (data.Response && data.Response === "Error") {
        console.log("API error:", data.Message);
        return [];
      }

      if (data.Data && data.Data.length) {
        const bars = data.Data.map((el) => ({
          time: el.time * 1000, // Convert to milliseconds if necessary
          low: el.low,
          high: el.high,
          open: el.open,
          close: el.close,
          volume: el.volumefrom,
        }));

        if (first) {
          const lastBar = bars[bars.length - 1];
          history[symbolInfo.name] = { lastBar: lastBar };
        }

        return bars;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch candle data:", error);
      return [];
    }
  },
};
