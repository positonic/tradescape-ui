type ExchangeCoinPairs = {
  [exchange: string]: {
    [coinSymbol: string]: string[];
  };
};
const exchangeCoinPairs: ExchangeCoinPairs = {
  kraken: {
    SOL: ["SOL/USDT", "SOL/USD"],
  },
};
/**
 * Each exchange has different pairs for each coin. When we want to fetch balances or trades
 * we may need several pairs to do so
 */
export function getExchangeCoinPairs(
  exchange: string,
  coin: string,
  quote: string | undefined
): string[] {
  console.log("coin is ", coin);
  console.log("quote is ", quote);

  if (exchangeCoinPairs[exchange] && exchangeCoinPairs[exchange][coin]) {
    // Filter pairs to match the quote
    if (quote)
      return exchangeCoinPairs[exchange][coin].filter((pair) =>
        pair.includes(quote)
      );
    else return exchangeCoinPairs[exchange][coin];
  }
  throw new Error(`No exchangeCoinPair found for ${exchange} and ${coin}`);
}
