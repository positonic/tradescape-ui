export type Trade = {
  id: string;
  ordertxid: string;
  pair: string;
  time: number;
  type: "buy" | "sell"; // Assuming type can be 'buy' or 'sell'
  ordertype: string;
  price: string;
  cost: string;
  fee: string;
  vol: number;
  margin: string;
  leverage: string;
  misc: string;
  exchange: string;
};
