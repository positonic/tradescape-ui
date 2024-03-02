import NormalizedTrade from "./interfaces/NormalizedTrade";

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);

  // Extract date components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Extract time components
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Construct the formatted date and time string
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
export function parseExchangePair(input: string): {
  exchange: string;
  pair: string;
} {
  // Split the input string into exchange and pair parts
  const [exchangePart, pairPart] = input.split("-");

  // Capitalize the first letter of the exchange part
  const exchange = exchangePart.charAt(0).toUpperCase() + exchangePart.slice(1);

  // Replace underscores with slashes and convert the pair part to uppercase
  const pair = pairPart.replace("_", "/").toUpperCase();

  return { exchange, pair };
}

/**
 *
 * @param input Turn "Bybit:BTC/USD" into "bybit-btc_usd"
 * @returns
 */
export function transformExchangePairFormat(input: string): string {
  // Lowercase the entire string
  let transformedString = input.toLowerCase();

  // Replace ':' with '-' and '/' with '_'
  transformedString = transformedString.replace(":", "-").replace("/", "_");

  return transformedString;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
interface ColorMap {
  [key: string]: string;
}
export const colors: ColorMap = {
  BTC: "rgb(247, 147, 26)",
  BLUR: "rgb(113, 87, 194)",
  MATIC: "rgb(130, 71, 229)",
  USD: "rgb(0, 122, 51)",
  ZETA: "rgb(72, 130, 180)",
  JUP: "rgb(255, 165, 0)",
  ONDO: "rgb(255, 99, 71)",
  PYTH: "rgb(255, 223, 186)",
  BEAM: "rgb(76, 175, 80)",
  LENDS: "rgb(250, 250, 250)",
  TIA: "rgb(64, 224, 208)",
  GRT: "rgb(96, 125, 139)",
  SUI: "rgb(255, 105, 180)",
  ETH: "rgb(108, 92, 231)",
  MAV: "rgb(255, 215, 0)",
  UMA: "rgb(0, 191, 255)",
  ARB: "rgb(0, 206, 209)",
  STX: "rgb(255, 69, 0)",
  JTO: "rgb(153, 50, 204)",
  SUPER: "rgb(233, 30, 99)",
  VET: "rgb(0, 0, 255)",
  NEAR: "rgb(255, 48, 79)",
  DOT: "rgb(233, 30, 99)",
  ALGO: "rgb(0, 178, 255)",
  ADA: "rgb(57, 154, 202)",
  AVAX: "rgb(227, 38, 54)",
  USDT: "rgb(7, 193, 96)",
  USDC: "rgb(255, 255, 255)",
};

export const sortDescending = (a: any, b: any) => b.time - a.time;
export const sortAscending = (a: any, b: any) => a.time - b.time;

/**
 *
 * @returns a timestamp representing the start of the current day in my timezone
 */
export function getStartOfDayTimestamp(): number {
  const now = new Date(); // Get the current date and time
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Set time to 00:00:00.000
  const timestamp = startOfDay.getTime(); // Get the timestamp in milliseconds since the Unix Epoch
  return timestamp;
}
