import Exchange, { ExchangeName, FetchTradesReturnType } from "./Exchange";
import { ExchangeConfig } from "./interfaces/ExchangeConfig";
import { apiKeys } from "./ApiKeys";

interface ExchangePairs {
  [key: string]: string[];
}
const binancePairs = [
  "DOT/USDT",
  "COTI/USD",
  "JUP/USDT",
  "INJ/USDT",
  "ALGO/USDT",
  "AGIX/USDT",
  "ATOM/USDT",
  "FIL/USDT",
];
const binancePairsOld = [
  "DOT/USDT",
  "COTI/USD",
  "JUP/USDT",
  "INJ/USDT",
  "BTC/USDT",
  "ETH/USDT",
  "MATIC/USDT",
  "ENS/USDT",
  "TIA/USDT",
  "OP/USDT",
  "OP/USD",
  "BLUR/USDT",
  "LINK/USDT",
  "LINK/USD",
  "ARB/USDT",
  "PENDLE/USDT",
];
const config: ExchangeConfig[] = [
  {
    exchange: "binance",
    pairs: binancePairs,
  },
  {
    exchange: "kraken",
    pairs: ["BTC/USDT", "BTC/USDT", "OP/USD", "LINK/USD"],
  },
];

export function getExchangeConfig(exchangeId: string | string[] | undefined) {
  if (!exchangeId) {
    return config;
  } else {
    return config.filter((c) => c.exchange === exchangeId);
  }
}
export class TradeManager {
  allTrades: any = [];
  exchanges: Record<string, Exchange>;
  config: ExchangeConfig[];

  constructor(config: ExchangeConfig[], exchanges: Record<string, Exchange>) {
    this.config = config;
    this.exchanges = exchanges;
  }

  /**
   * This specific markets for the exchanges that the class was set up for
   */
  async getMarketTrades(market: string, lastTimestamp: number | undefined) {
    return this.getAllTrades([market], lastTimestamp);
  }
  /**
   * This gets all markets, all trades based on the config it's given
   */
  async getAllTrades(
    pairs: string[] | undefined,
    lastTimestamp: number | undefined
  ) {
    console.log("lastTimestamp is:", lastTimestamp);
    const since = lastTimestamp ? lastTimestamp : undefined; // Fetch trades after the last recorded trade

    for (const { exchange: exchangeName, pairs: exchangePairs } of this
      .config) {
      const exchange = this.exchanges[exchangeName];
      if (!exchange) continue; // Skip if the exchange is not initialized

      // If pairs are provided, use them; otherwise, use the pairs for the exchange from the config
      const marketPairs = pairs ? pairs : exchangePairs;

      for (const pair of marketPairs) {
        try {
          const exchangeTrades: FetchTradesReturnType =
            await exchange.fetchTrades(pair, since);
          const trades = Object.values(exchangeTrades);
          console.log(
            `${exchangeName} - ${pair}: Found ${trades.length} trades`
          );
          this.allTrades = this.allTrades.concat(trades);
        } catch (error) {
          console.error(
            `Error fetching trades from ${exchangeName} for ${pair}:`,
            error
          );
        }
      }
    }
    return this.allTrades;
    // console.log(allTrades);
    // console.log(`Found ${allTrades.length} trades in total`);
  }
}
