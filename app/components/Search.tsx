import { Select } from "@mantine/core";
import { useRouter } from "next/navigation";

const largeData = [
  { value: "kraken-btc_usdt", label: "Kraken: BTC" },
  { value: "kraken-eth_usdt", label: "Kraken: ETH" },
  { value: "matic-eth_usdt", label: "Binance: Matic" },
];

export default function Search() {
  const router = useRouter();
  function onChange(value: string | null) {
    if (!value) return;
    const url = `/coin/${encodeURIComponent(value)}`;
    console.log("redirect to ", url);
    router.push(url);
  }
  return (
    <Select
      placeholder="Search"
      onChange={onChange}
      limit={5}
      data={largeData}
      searchable
    />
  );
}
