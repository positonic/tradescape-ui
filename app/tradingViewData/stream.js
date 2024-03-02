// api/stream.js
import historyProvider from "./historyProvider.js";
// we use Socket.io client to connect to cryptocompare's socket.io stream
// eslint-disable-next-line
var io = require("socket.io-client");

window.appUrl = process.env.REACT_APP_API_URL;
window.socket =
  typeof window.socket !== "undefined" ? window.socket : io(window.appUrl);
const socket = window.socket;

// keep track of subscriptions
var _subs = [];
var subscription = {};
let marketKey;

export default {
  subscribeBars: function (symbolInfo, resolution, updateCb, uid, resetCache) {
    marketKey = createMarketKey(symbolInfo, resolution);
    // socket.emit('SubAdd', {subs: [channelString]})
    console.log(
      "---------------------- subscribe bars -----------------------"
    );
    console.log(`resolution ---> : ${resolution}`);
    console.log(`channelString ---> : ${marketKey}`);
    updateCb.marketKey = marketKey;
    socket.emit("SubAdd", marketKey);
    // socket.emit('SubAdd', { subs: [marketKey] })

    const newSub = {
      marketKey,
      uid,
      resolution,
      symbolInfo,
      lastBar: historyProvider.history[symbolInfo.name].lastBar,
      listener: updateCb,
    };
    _subs.push(newSub);
  },
  unsubscribeBars: function (uid) {
    var subIndex = _subs.findIndex((e) => e.uid === uid);

    if (subIndex === -1) {
      return;
    }
    var sub = _subs[subIndex];
    socket.emit("SubRemove", { subs: [sub.channelString] });
    _subs.splice(subIndex, 1);
  },
};

socket.on("connect", () => {
  console.log("===Socket connected");
});
socket.on("disconnect", (e) => {
  console.log("===Socket disconnected:", e);
});
socket.on("error", (err) => {
  console.log("====socket error", err);
});
socket.on("lastCandle", (lastCandle) => {
  // console.log(`!!!!LAST**** : ${lastCandle.timestampMs}`)

  // console.log(`lastCandle : ${JSON.stringify(lastCandle, null, 2)}`)
  console.log(
    `lastCandle : ${lastCandle.timestampMs} - ${lastCandle.marketKey} - ${lastCandle.close}`
  );

  // console.log(`this : ${JSON.stringify(this, null, 2)}`)

  const sub = _subs.find((e) => e.marketKey === lastCandle.marketKey);

  if (sub) {
    if (sub.symbolInfo) {
      const data = {
        sub_type: 0,
        exchange: sub.symbolInfo.exchange,
        to_sym: sub.symbolInfo.ticker.split(":")[1].split("/")[0],
        from_sym: sub.symbolInfo.ticker.split(":")[1].split("/")[1],
        trade_id: "xxxxx",
        ts: parseInt(lastCandle.timestampMs, 10) / 1000,
        volume: parseFloat(lastCandle.volume),
        price: parseFloat(lastCandle.close),
      };
      // disregard the initial catchup snapshot of trades for already closed candles
      if (data.ts < sub.lastBar.time / 1000) {
        return;
      }

      var _lastBar = updateBar(data, sub);

      //  console.log(`_lastBar : ${JSON.stringify(_lastBar, null, 2)}`)

      // send the most recent bar back to TV's realtimeUpdate callback
      sub.listener(_lastBar);
      // update our own record of lastBar
      sub.lastBar = _lastBar;
    }

    // var _lastBar = updateBar(data, sub)

    // sub.listener(_lastBar)
    // sub.lastBar = _lastBar
  }

  // here we get all events the CryptoCompare connection has subscribed to
  // we need to send this new data to our subscribed charts
  // const _data = lastCandle.split('~')
  // if (_data[0] === '3') {
  //   // console.log('Websocket Snapshot load event complete')
  //   return
  // }

  // if (_subs.length) {
  //   console.log(`subs : ${JSON.stringify(_subs, null, 2)}`)

  //   console.log(`lastCandle : ${JSON.stringify(lastCandle, null, 2)}`)
  // }

  // const data = {
  //   sub_type: parseInt(_data[0], 10),
  //   exchange: _data[1],
  //   to_sym: _data[2],
  //   from_sym: _data[3],
  //   trade_id: _data[5],
  //   ts: parseInt(_data[6], 10),
  //   volume: parseFloat(_data[7]),
  //   price: parseFloat(_data[8])
  // }

  // const channelString = `${data.sub_type}~${data.exchange}~${data.to_sym}~${data.from_sym}`

  // console.log('channelString', channelString)

  // const sub = _subs.find(lastCandle => lastCandle.channelString === channelString)

  // if (sub) {
  //   // disregard the initial catchup snapshot of trades for already closed candles
  //   if (data.ts < sub.lastBar.time / 1000) {
  //     return
  //   }

  //   var _lastBar = updateBar(data, sub)

  //   // send the most recent bar back to TV's realtimeUpdate callback
  //   sub.listener(_lastBar)
  //   // update our own record of lastBar
  //   sub.lastBar = _lastBar
  // }
});

// Take a single trade, and subscription record, return updated bar
function updateBar(data, sub) {
  var lastBar = sub.lastBar;
  let resolution = sub.resolution;
  if (resolution.includes("D")) {
    // 1 day in minutes === 1440
    resolution = 1440;
  } else if (resolution.includes("W")) {
    // 1 week in minutes === 10080
    resolution = 10080;
  }
  var coeff = resolution * 60;
  // console.log({coeff})
  var rounded = Math.floor(data.ts / coeff) * coeff;
  var lastBarSec = lastBar.time / 1000;
  var _lastBar;

  if (rounded > lastBarSec) {
    // create a new candle, use last close as open **PERSONAL CHOICE**
    _lastBar = {
      time: rounded * 1000,
      open: lastBar.close,
      high: lastBar.close,
      low: lastBar.close,
      close: data.price,
      volume: data.volume,
    };
  } else {
    // update lastBar candle!
    if (data.price < lastBar.low) {
      lastBar.low = data.price;
    } else if (data.price > lastBar.high) {
      lastBar.high = data.price;
    }

    lastBar.volume = data.volume;
    lastBar.close = data.price;
    _lastBar = lastBar;
  }
  return _lastBar;
}

// takes symbolInfo object as input and creates the subscription string to send to CryptoCompare
function createChannelStringCryptoCompare(symbolInfo) {
  console.log("CreateChannelString", symbolInfo);
  var channel = symbolInfo.name.split(/[:/]/);
  const exchange = channel[0] === "GDAX" ? "Coinbase" : channel[0];
  const to = channel[2];
  const from = channel[1];
  // subscribe to the CryptoCompare trade channel for the pair and exchange
  return `0~${exchange}~${from}~${to}`;
}

// takes symbolInfo object as input and creates the subscription string to send to CryptoCompare
function createMarketKey(symbolInfo, resolution) {
  console.log("CreateChannelString", symbolInfo);
  var channel = symbolInfo.name.split(/[:/]/);
  const exchange = channel[0] === "GDAX" ? "Coinbase" : channel[0];
  const to = channel[2];
  const from = channel[1];
  // subscribe to the CryptoCompare trade channel for the pair and exchange
  return `${exchange.toLowerCase()}:${from}${to}`;
  // return `${exchange}:${from}${to}-${resolution}`
}
