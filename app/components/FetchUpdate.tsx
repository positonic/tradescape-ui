import ExchangeBalance from "@/interfaces/ExchangeBalance";
import BalanceHistoryItem from "./BalanceHistoryItem";

export default interface FetchUpdate {
  balances: ExchangeBalance[];
  totalBalance: number;
  history: BalanceHistoryItem[];
}
