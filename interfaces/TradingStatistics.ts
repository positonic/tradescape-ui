export default interface TradingStatistics {
  totalTrades: number;
  strikeRate: number;
  averageLossPerTrade: number;
  averageWinPerTrade: number;
  biggestLosses: number[];
  biggestWins: number[];
  averageHoldingTime: string;
}
