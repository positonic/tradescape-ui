import Exchange, { ExchangeName } from "./Exchange";
import { ApiKeys } from "./interfaces/ApiKeys";
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
  exchanges: Exchange[];
  config: ExchangeConfig[];

  constructor(config: ExchangeConfig[], exchanges: Exchange[] = []) {
    this.config = config;
    this.exchanges = exchanges;
  }

  /**
   * This gets all markets, all trades based on the config it's given
   */
  async getAllTrades(lastTimestamp: number | undefined) {
    console.log("lastTimestamp is:", lastTimestamp);
    const since = lastTimestamp ? lastTimestamp : undefined; // Fetch trades after the last recorded trade

    for (const { exchange: exchangeName, pairs } of this.config) {
      const exchange = this.exchanges[exchangeName];
      if (!exchange) continue; // Skip if the exchange is not initialized

      for (const pair of pairs) {
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
