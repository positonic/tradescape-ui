import React from "react";
import { DonutChart } from "@mantine/charts";
//import { formatCurrency } from "@/utils";

// Define the shape of a single data entry
interface Asset {
  coin: string;
  free: number;
  used: number;
  total: number;
  exchange: string;
  usdValue: number;
}

// Define the props expected by the component
interface Props {
  assets: Asset[];
  colors: any;
}
type CryptoColors = {
  [key: string]: string;
};

const cryptoColors: CryptoColors = {
  BTC: "orange",
  BLUR: "blue",
  MATIC: "#8247e5",
  USD: "#007a33",
  ZETA: "#4882b4",
  JUP: "#ffa500",
  ONDO: "#ff6347",
  PYTH: "#ffdfba",
  BEAM: "#4caf50",
  LENDS: "#fafafa",
  TIA: "#40e0d0",
  GRT: "#607d8b",
  SUI: "#ff69b4",
  ETH: "#6c5ce7",
  MAV: "#ffd700",
  UMA: "#00bfff",
  ARB: "#00ced1",
  STX: "#ff4500",
  JTO: "#9932cc",
  SUPER: "#e91e63",
  VET: "#0000ff",
  NEAR: "#ff304f",
  DOT: "#e91e63",
  ALGO: "#00b2ff",
  ADA: "#399aca",
  AVAX: "#e32636",
  USDT: "#07c160",
  USDC: "#ffffff",
};
// A utility function to aggregate data by coin
const aggregateDataByCoin = (assets: Asset[]) => {
  const aggregation: Record<string, number> = {};

  assets.forEach((asset) => {
    if (aggregation[asset.coin]) {
      aggregation[asset.coin] += asset.usdValue;
    } else {
      aggregation[asset.coin] = asset.usdValue;
    }
  });

  return Object.entries(aggregation).map(([name, value]) => ({
    name,
    value,
  }));
};
type CryptoAsset = {
  name: string;
  value: number;
  color: string; // Optional property to be added
};

const CryptoPieChart: React.FC<Props> = ({ assets }: { assets: any[] }) => {
  const data = aggregateDataByCoin(assets);

  const addColorToCryptoItem = (item: CryptoAsset): CryptoAsset => {
    return {
      ...item,
      color: cryptoColors[item.name] || "rgb(255, 255, 255)", // Default color if not found
    };
  };

  const dataWithColors: CryptoAsset[] = data.map(
    (item: { name: string; value: number }) =>
      addColorToCryptoItem({ ...item, color: "" })
  );

  return (
    <>
      <h3>Pie chart</h3>
      <DonutChart
        tooltipDataSource="segment"
        withTooltip
        data={dataWithColors}
        // label={(data: any) =>
        //   `${data.label} (${formatCurrency(data.value)} USD)`
        // }

        size={300}
      />
    </>
  );
};

export default CryptoPieChart;
