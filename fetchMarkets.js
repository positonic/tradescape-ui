const ccxt = require("ccxt");

async function fetchKrakenSymbols() {
  const kraken = new ccxt.kraken();
  await kraken.loadMarkets();
  const symbols = kraken.symbols;

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
