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
