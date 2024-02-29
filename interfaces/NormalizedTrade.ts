export default interface NormalizedTrade {
  id: string;
  ordertxid: string;
  pair: string;
  time: number;
  type: string;
  ordertype: string;
  price: string;
  cost: string;
  fee: string;
  vol: number;
  margin: string;
  leverage: string;
  misc: string;
  exchange: string;
}
