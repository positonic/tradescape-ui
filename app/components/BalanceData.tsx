import ExchangeBalance from "@/interfaces/ExchangeBalance";

export default interface BalanceData {
  timestamp: number;
  balances: ExchangeBalance[];
  totalBalance: number;
}
