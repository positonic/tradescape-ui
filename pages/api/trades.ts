// pages/api/candles.js
import type { NextApiRequest, NextApiResponse } from 'next';
import Exchange, {
  initExchanges,
  isExchangeName,
  aggregateTrades,
} from '@/Exchange';

import {
  sortDescending,
  parseExchangePair,
  parseQuoteBaseFromPair,
} from '@/utils';
const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || '';

// Define the interface for the Trade array
export type FetchTradesReturnType = Record<string, Trade>;

import { TradeManager, getExchangeConfig } from '@/TradeManager';
import { ExchangeConfig } from '@/interfaces/ExchangeConfig';
import { Trade } from '@/interfaces/Trade';
import { Order } from '@/interfaces/Order';
import { TradeResponseData } from './TradeResponseData';
import { getExchangeCoinPairs } from '@/exchangeCoinPairs';
import { matchOrdersToPositions } from '@/PositionManager';

const rotkiUrl =
  'http://127.0.0.1:4242/api/1/trades?limit=10&base_asset=SOL-2&only_cache=true';
const rotkiCoins = {
  SOL: 'SOL-2',
};
interface RotkiTradeInput {
  result: {
    entries: Array<{
      entry: RotkiTrade;
      ignored_in_accounting: boolean;
    }>;
  };
}
interface RotkiTrade {
  timestamp: number;
  location: string;
  base_asset: string;
  quote_asset: string;
  trade_type: string;
  amount: string;
  rate: string;
  fee: string;
  fee_currency: string;
  link: string;
  notes: null | string;
  trade_id: string;
}
interface TradeOutput {
  trades: Trade[];
}
function mapTrades(input: RotkiTradeInput): TradeOutput {
  return {
    trades: input.result.entries.map((entry) => ({
      id: entry.entry.trade_id,
      ordertxid: entry.entry.link,
      pair: `${entry.entry.base_asset.replace('-2', '')}/${
        entry.entry.quote_asset
      }`,
      time: entry.entry.timestamp * 1000, // Convert to milliseconds
      type: entry.entry.trade_type,
      ordertype: 'stop market', // Assuming a fixed value as it's not provided in the input
      price: entry.entry.rate,
      cost: (
        parseFloat(entry.entry.amount) * parseFloat(entry.entry.rate)
      ).toString(),
      fee: entry.entry.fee,
      vol: parseFloat(entry.entry.amount),
      margin: '', // Assuming empty as it's not provided in the input
      leverage: '', // Assuming empty as it's not provided in the input
      misc: '', // Assuming empty as it's not provided in the input
      exchange:
        entry.entry.location.charAt(0).toUpperCase() +
        entry.entry.location.slice(1),
      date: new Date(entry.entry.timestamp * 1000),
    })),
  };
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleResponseData {
  candles: Candle[];
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TradeResponseData | CandleResponseData>
) {
  //http://localhost:3000/api/trades?exchangeId=binance&since=null

  //const pair = "BTC/USDT";
  const pair = req.query.pair as string;
  const rotki = req.query.rotki as string;

  console.log('rotki url ', rotkiUrl);
  if (rotki) {
    try {
      const rotkiCoin =
        rotkiCoins[pair.split('/')[0] as keyof typeof rotkiCoins];
      const response = await fetch(rotkiUrl);
      console.log('Rotki response', response);
      const rotkiTrades: RotkiTradeInput = await response.json();
      const trades = mapTrades(rotkiTrades).trades;
      const orders: Order[] = aggregateTrades(trades).sort(sortDescending);
      const positions = matchOrdersToPositions(orders);
      console.log('Rotki data', trades);

      res.status(200).json({
        trades: trades,
        positions,
        orders: orders,
        error: '',
        rotki: true,
      });
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      res.status(500).json({
        trades: [],
        orders: [],
        positions: [],
        error: 'Failed to fetch TRADES',
      });
    }
    return;
  } else {
    console.log('not rotki');
  }
  const since = req.query.since ? Number(req.query.since) : undefined;

  const exchange: string | undefined = req.query.exchangeId as string;

  if (exchange === 'radium' && pair === 'BONK/USD') {
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-API-KEY': BIRDEYE_API_KEY,
        },
      };
      //const BIRDEYE_API_URL: string = `https://public-api.birdeye.so/defi/txs/pair?address=${POOL_ADDRESS}&offset=0&limit=50&tx_type=swap&sort_type=desc`;

      const apiUrl =
        'https://public-api.birdeye.so/defi/ohlcv/pair?address=HVNwzt7Pxfu76KHCMQPTLuTCLTm6WnQ1esLv4eizseSv&type=15m';
      console.log('apiUrl is ', apiUrl);
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      if (data.success) {
        const candles: Candle[] = data.data.items.map((item: any) => ({
          time: item.unixTime * 1000, // Convert to milliseconds
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
          volume: item.v,
        }));
        console.log('birdeye candles is ', candles);
        res.status(200).json({
          candles,
          error: '',
        });
      } else {
        res.status(500).json({
          candles: [],
          error: 'Failed to fetch candles from Birdeye',
        });
      }
    } catch (error) {
      console.error('Failed to fetch candles from Birdeye:', error);
      res.status(500).json({
        candles: [],
        error: 'Failed to fetch candles',
      });
    }
    return;
  }

  if (
    !since &&
    (!pair || !exchange || (exchange && !isExchangeName(exchange)))
  ) {
    return res.status(400).json({
      trades: [],
      orders: [],
      positions: [],
      error:
        "Error: api/trades: If you don't specify an exchnage and pair, you must specify a since parameter",
    });
  }

  const config: ExchangeConfig[] = getExchangeConfig(exchange);

  const exchanges: Record<string, Exchange> = initExchanges();

  const tradeManager = new TradeManager(config, exchanges);

  let trades: Trade[] = [];

  const { base, quote } = parseQuoteBaseFromPair(pair);
  const pairs = getExchangeCoinPairs(exchange, base, undefined);
  // const pairs = [
  //   "MSOL/EUR",
  //   "MSOL/USD",
  //   "SOL/BTC",
  //   "SOL/ETH",
  //   "SOL/EUR",
  //   "SOL/GBP",
  //   "SOL/USD",
  //   "SOL/USDT",
  // ];
  const pairsList = pair ? [pair] : undefined;
  console.log('pairs is ', pairs);
  console.log('exchangeId is ', exchange);
  try {
    trades = await tradeManager.getAllTrades(pairsList, since);

    console.log('trades is ', trades);

    const orders: Order[] = aggregateTrades(trades).sort(sortDescending);

    console.log('orders is ', orders);

    const positions = matchOrdersToPositions(orders);

    const response: TradeResponseData = {
      trades,
      orders,
      positions,
      error: '',
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    res.status(500).json({
      trades: [],
      orders: [],
      positions: [],
      error: 'Failed to fetch TRADES',
    });
  }
}

// Helper to format duration

// Parses orders and creates positions
