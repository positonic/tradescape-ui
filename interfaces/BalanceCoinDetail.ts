export interface CoinDetail {
  free: number;
  used: number;
  total: number;
  usdValue: { [coin: string]: number };
}
export interface ExchangeDetail {
  [coin: string]: CoinDetail;
}
export interface Balances {
  [exchange: string]: ExchangeDetail;
}
