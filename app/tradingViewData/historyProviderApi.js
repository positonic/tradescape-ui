import axios from "axios";
// Assuming your Next.js app is running on localhost:3000 during development
const api_root = "http://localhost:3000/api";

// Updated history object to be consistent with ES6 syntax enhancements
const history = {};

export default {
  history: history,

  getBars: function (symbolInfo, resolution, from, to, first, limit) {
    var split_symbol = symbolInfo.name.split(/[:/]/);
    const url =
      resolution === "D"
        ? "/data/histoday"
        : resolution >= 60
        ? "/data/histohour"
        : "/data/histominute";
    // console.log("pairs is ", pairs);
    // console.log("between is ", split_symbol[1] + "/" + split_symbol[2]);
    // console.log("e is", pairs[split_symbol[1] + "/" + split_symbol[2]]);
    const qs = {
      //e: pairs[split_symbol[1] + "/" + split_symbol[2]],
      e: "BTC/USDT", // Hard coding for eslint
      fsym: split_symbol[1],
      tsym: split_symbol[2],
      toTs: to ? to : "",
      limit: limit ? limit : 2000,
      // aggregate: 1//resolution
    };
    console.log("qs is ", { qs });
    return axios({
      url: `${api_root}${url}`,
      qs,
    }).then((response) => {
      // console.log({data})
      const data = response.data;
      if (data.Response && data.Response === "Error") {
        console.log("CryptoCompare API error:", data.Message);
        return [];
      }
      if (data.Data.length) {
        // console.log(`Actually returned: ${new Date(data.TimeFrom * 1000).toISOString()} - ${new Date(data.TimeTo * 1000).toISOString()}`)
        var bars = data.Data.map((el) => {
          return {
            time: el.time * 1000, //TradingView requires bar time in ms
            low: el.low,
            high: el.high,
            open: el.open,
            close: el.close,
            volume: el.volumefrom,
          };
        });
        if (first) {
          var lastBar = bars[bars.length - 1];
          history[symbolInfo.name] = { lastBar: lastBar };
        }
        return bars;
      } else {
        return [];
      }
    });
  },
};
