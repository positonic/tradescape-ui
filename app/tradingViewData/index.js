/* eslint-disable */
import historyProvider from "./historyProvider";
//import historyProvider from "./historyProviderCryptoCompare";
//import historyProvider from "./historyProviderApi";
// Was this one, I guess it's cryptoSockets import stream from "./stream";
import stream from "./streamCryptoCompare";

const supportedResolutions = [
  "1",
  "3",
  "5",
  "15",
  "30",
  "60",
  "120",
  "240",
  "D",
];

const config = {
  supported_resolutions: supportedResolutions,
};

export default {
  onReady: (cb) => {
    console.log("=====onReady running");
    setTimeout(() => cb(config), 0);
  },
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    onResultReadyCallback([
      {
        symbol: "Binance:BTC/USD",
        full_name: "Bitcoin/US dollar", // e.g. BTCE:BTCUSD
        description: "Bitcoin / US Dollar tether",
        exchange: "Binance",
        ticker: "Binance:BTC/USD",
        type: "crypto", // or "futures" or "bitcoin" or "forex" or "index"
      },
      {
        symbol: "Binance:ETH/USDT",
        full_name: "ETH/US dollar", // e.g. BTCE:BTCUSD
        description: "Ethereum /US dollar tether",
        exchange: "Binance",
        ticker: "Binance:ETH/USDT",
        type: "crypto", // or "futures" or "bitcoin" or "forex" or "index"
      },
      {
        symbol: "Binance:LTC/USDT",
        full_name: "Litecoin/US dollar", // e.g. BTCE:BTCUSD
        description: "Litecoin / US Dollar tether",
        exchange: "Binance",
        ticker: "Binance:LTC/USDT",
        type: "crypto", // or "futures" or "bitcoin" or "forex" or "index"
      },
      {
        symbol: "Binance:XRP/USDT",
        full_name: "Ripple/US dollar", // e.g. BTCE:BTCUSD
        description: "Ripple / US Dollar tether",
        exchange: "Binance",
        ticker: "Binance:XRP/USDT",
        type: "crypto", // or "futures" or "bitcoin" or "forex" or "index"
      },
      {
        symbol: "Binance:XRP/USDT",
        full_name: "BCH/US dollar", // e.g. BTCE:BTCUSD
        description: "BCH / US Dollar tether",
        exchange: "Binance",
        ticker: "Binance:BCH/USDT",
        type: "crypto", // or "futures" or "bitcoin" or "forex" or "index"
      },
      {
        symbol: "Binance:BOME/USDT",
        full_name: "Book of Meme / US dollar", // e.g. BTCE:BTCUSD
        description: "Book of Meme / US dollar",
        exchange: "Binance",
        ticker: "Binance:BOME/USDT",
        type: "crypto", // or "futures" or "bitcoin" or "forex" or "index"
      },
    ]);
    console.log("====Search Symbols running");
  },
  resolveSymbol: (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback
  ) => {
    // expects a symbolInfo object in response
    console.log("======resolveSymbol running");
    // console.log('resolveSymbol:', { symbolName })
    console.log(`symbolName ---> : ${symbolName}`);
    var split_data = symbolName.split(/[:/]/);
    // console.log({split_data})
    // console.log({split_data})this.props.symbol.split(':')[1]
    const pair = symbolName.split(":")[1];
    var symbol_stub = {
      name: symbolName,
      description: "",
      type: "crypto",
      session: "24x7",
      timezone: "Europe/Berlin",
      ticker: symbolName,
      exchange: split_data[0],
      minmov: 1,
      pricescale: 100000000,
      has_intraday: true,
      intraday_multipliers: ["1", "60"],
      supported_resolution: supportedResolutions,
      volume_precision: 8,
      data_status: "streaming",
    };

    // console.log('split_data is ', symbolName, split_data);
    if (split_data[2].match(/USD|EUR|JPY|AUD|GBP|KRW|CNY|USDT/)) {
      symbol_stub.pricescale = 100;
    }
    setTimeout(function () {
      onSymbolResolvedCallback(symbol_stub);
    }, 0);

    // onResolveErrorCallback('Not feeling it today')
  },
  getBars: function (
    symbolInfo,
    resolution,
    from,
    to,
    onHistoryCallback,
    onErrorCallback,
    firstDataRequest
  ) {
    console.log("=====getBars running");
    // console.log('function args',arguments)
    // console.log(`Requesting bars between ${new Date(from * 1000).toISOString()} and ${new Date(to * 1000).toISOString()}`)
    historyProvider
      .getBars(symbolInfo, resolution, from, to, firstDataRequest)
      .then((bars) => {
        if (bars.length) {
          onHistoryCallback(bars, { noData: false });
        } else {
          onHistoryCallback(bars, { noData: true });
        }
      })
      .catch((err) => {
        console.log("Error gettingBars");

        console.log({ err });
        //debugger;
        onErrorCallback(err);
      });
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback
  ) => {
    console.log("=====subscribeBars runnning");
    stream.subscribeBars(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscribeUID,
      onResetCacheNeededCallback
    );
  },
  unsubscribeBars: (subscriberUID) => {
    // console.log('=====unsubscribeBars running')

    stream.unsubscribeBars(subscriberUID);
  },
  calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
    // optional
    // console.log('=====calculateHistoryDepth running')
    // while optional, this makes sure we request 24 hours of minute data at a time
    // CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
    return resolution < 60
      ? { resolutionBack: "D", intervalBack: "1" }
      : undefined;
  },
  getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    // optional
    // console.log('=====getMarks running')
  },
  getTimeScaleMarks: (
    symbolInfo,
    startDate,
    endDate,
    onDataCallback,
    resolution
  ) => {
    // optional
    // console.log('=====getTimeScaleMarks running')
  },
  getServerTime: (cb) => {
    // console.log('=====getServerTime running')
  },
};
