const dotenv = require("dotenv");

dotenv.config();

const ccxt = require("ccxt");

async function fetchKrakenSymbols() {
  const kraken = new ccxt.kraken({
    apiKey: process.env.KRAKEN_API_KEY,
    secret: process.env.KRAKEN_API_SECRET,
    urls: {
      api: {
        Public: "https://api.binance.com/api/v3/",
        Private: "https://api.binance.com/api/v3/",
      },
    },
  });
  const trades = await kraken.fetchMyTrades(undefined, 1709197168225, 10);
  console.log("Kraken trades:", trades);

  return symbols;
}

fetchKrakenSymbols()
  .then((symbols) => {
    console.log("Kraken symbols:", symbols);
    console.log(
      "Solana symbols",
      symbols.filter((symbol) => symbol.includes("SOL"))
    );
  })
  .catch((error) => console.error(error));
