// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from "next";
import Exchange from "../../interfaces/Exchange";
import { calculateUsdValues } from "../../prices";
import ccxt from "ccxt";
import ExchangeBalance from "@/interfaces/ExchangeBalance";
import { Balances } from "@/interfaces/BalanceCoinDetail";
const reformatData = (data: Balances): ExchangeBalance[] => {
  const reformattedArray: ExchangeBalance[] = [];

  Object.entries(data).forEach(([exchange, details]) => {
    Object.entries(details).forEach(([coin, coinDetail]: [string, any]) => {
      const coinUsdValue =
        details.usdValue[coin as keyof typeof details.usdValue];
      if (coin !== "usdValue" && coinUsdValue !== undefined) {
        reformattedArray.push({
          coin,
          free: coinDetail.free,
          used: coinDetail.used,
          total: coinDetail.total,
          exchange,
          usdValue: coinUsdValue as number,
        });
      }
    });
  });

  // Sorting by usdValue in descending order
  reformattedArray.sort((a, b) => b.usdValue - a.usdValue);

  return reformattedArray;
};
type ResponseData = {
  balances: ExchangeBalance[];
  error?: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const balances: any = {};
  // Function to fetch and display balances from an exchange
  async function fetchBalances(exchange: any, config: any) {
    try {
      const balance = await exchange.fetchBalance(config);
      return balance;
    } catch (error) {
      console.error(exchange.id, "an error occurred:", error);
    }
  }

  // Initialize exchanges with your API keys from .env
  const bybit = new ccxt.bybit({
    apiKey: process.env.BYBIT_API_KEY, // Loaded from .env
    secret: process.env.BYBIT_API_SECRET, // Loaded from .env
  });

  const binance = new ccxt.binance({
    apiKey: process.env.BINANCE_API_KEY, // Loaded from .env
    secret: process.env.BINANCE_API_SECRET, // Loaded from .env
  });

  const kraken = new ccxt.kraken({
    apiKey: process.env.KRAKEN_API_KEY, // Loaded from .env
    secret: process.env.KRAKEN_API_SECRET, // Loaded from .env
  });

  // Define an array of exchanges with their respective names and instances
  const exchanges: Exchange[] = [
    { name: "Kraken", instance: kraken, fetchConfig: { type: "margin" } },
    // ,
    // { name: "Bybit", instance: bybit, fetchConfig: { type: "spot" } },
    // { name: "Binance", instance: binance, fetchConfig: {} },
  ];

  let portfolioTotalUsdValue = 0;

  for (const exchange of exchanges) {
    try {
      // Fetch balances for each exchange
      const balance = await fetchBalances(
        exchange.instance,
        exchange.fetchConfig
      );
      //console.log("balance", balance);
      // Calculate USD values for the fetched balances
      const { balance: updatedBalance, totalUsdValue } =
        await calculateUsdValues(exchange, balance);

      if (exchange.name === "Kraken") {
        const marginBalance = await fetchBalances(exchange.instance, {
          type: "margin",
        });
        console.log("marginBalance", marginBalance);
        res.status(200).json({ balances: marginBalance, error: "" });
      }
      // Accumulate the total USD value from all exchanges
      portfolioTotalUsdValue += totalUsdValue;

      console.log(
        "updatedBalance.usdValue: ",
        "For: " + exchange.name,
        updatedBalance.usdValue
      );
      //Insert the updated balance and total USD value into Notion
      //   await insertOrUpdateBalanceToNotion(updatedBalance, exchange.name);
      balances[exchange.name] = updatedBalance;
      // Log a success message
      console.log(
        `${exchange.name} exchange processed successfully. Total USD Value: ${totalUsdValue}`
      );
      console.log(" ");
      console.log("________________\n\n");
    } catch (error) {
      // Log the error for the specific exchange
      console.error(`Error processing ${exchange.name} exchange:`, error);
    }
  }

  // After the loop, portfolioTotalUsdValue contains the total value from all exchanges
  console.log("Total Portfolio Value in USD:", portfolioTotalUsdValue);

  //   savePortfolioValueToNotion(portfolioTotalUsdValue);

  try {
    // Assuming the API response structure matches what you're expecting
    const balanceArray = reformatData(balances);
    res.status(200).json({ balances: balanceArray, error: "" });
  } catch (error) {
    console.error("Failed to fetch candle data:", error);
    res
      .status(500)
      .json({ balances: [], error: "Failed to fetch candle data" });
  }
}
