import { ApiKeys } from "./interfaces/ApiKeys";

export const apiKeys: ApiKeys = {
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY as string,
    apiSecret: process.env.KRAKEN_API_SECRET as string,
  },
  binance: {
    apiKey: process.env.BINANCE_API_KEY as string,
    apiSecret: process.env.BINANCE_API_SECRET as string,
  },
  bybit: {
    apiKey: process.env.BYBIT_API_KEY as string, // Loaded from .env
    apiSecret: process.env.BYBIT_API_SECRET as string, // Loaded from .env
  },
};
