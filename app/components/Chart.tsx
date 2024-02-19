"use client";
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library.min";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useState } from "react";

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  //const defaultWidgetProps: Partial<any> = {
  //symbol: "AAPL",
  symbol: "Binance:BTC/USD",
  interval: "1D" as ResolutionString,
  library_path: "/static/charting_library/",
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: false,
  autosize: true,
};
const TVChartContainer = dynamic(
  () => import("./TVChartContainer").then((mod) => mod.TVChartContainer),
  { ssr: false }
);
const trades = [
  { time: "2022-01-01", price: 48000, type: "Buy" },
  { time: "2022-01-02", price: 47000, type: "Sell" },
  { time: "2022-01-03", price: 47500, type: "Buy" },
  { time: "2022-01-04", price: 48500, type: "Buy" },
  { time: "2022-01-05", price: 49000, type: "Sell" },
  { time: "2022-01-06", price: 49500, type: "Buy" },
  { time: "2022-01-07", price: 50000, type: "Sell" },
  { time: "2022-01-08", price: 50500, type: "Buy" },
  { time: "2022-01-09", price: 51000, type: "Sell" },
  { time: "2022-01-10", price: 51500, type: "Buy" },
  // Continue adding more trades as needed
];
export default function Chart({ market }: { market: string }) {
  const [isScriptReady, setIsScriptReady] = useState(false);
  return (
    <div>
      {/* <LightChart trades={trades} /> */}
      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {/* <div id="container_id" className="TVChartContainer" /> */}

      {isScriptReady && <TVChartContainer {...defaultWidgetProps} />}
    </div>
  );
}
