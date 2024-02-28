// interface ApiKeys {
//   [key: string]: ApiKey;
// }
export interface ApiKeys {
  kraken: ApiKey;
  binance: ApiKey;
  bybit: ApiKey;
}
interface ApiKey {
  apiKey: string;
  apiSecret: string;
}
