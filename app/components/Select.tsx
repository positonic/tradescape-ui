import { Select } from "@mantine/core";
import { useRouter } from "next/navigation";

const largeData = [
  { value: "Binance", label: "Binance" },
  { value: "Bybit", label: "Bybit" },
  { value: "Kraken", label: "Kraken" },
];

export default function Select() {
  const router = useRouter();
  function onChange(value: string | null) {
    if (!value) return;
    const url = `/coin/${encodeURIComponent(value)}`;
    console.log("redirect to ", url);
    router.push(url);
  }
  return (
    <Select
      label="Select exchange"
      placeholder="Select exchange"
      onChange={onChange}
      limit={5}
      data={largeData}
      searchable
    />
  );
}
