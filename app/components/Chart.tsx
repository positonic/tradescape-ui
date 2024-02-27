"use client";
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library.min";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useState } from "react";
import { parseExchangePair } from "@/utils";

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

export default function Chart({
  market,
  trades,
}: {
  market: string;
  trades: any;
}) {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const { exchange, pair } = parseExchangePair(market);
  defaultWidgetProps.symbol = `${exchange}:${pair}`;

  return (
    <div>
      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />

      {isScriptReady && (
        <TVChartContainer
          market={market}
          trades={trades}
          {...defaultWidgetProps}
        />
      )}
    </div>
  );
}
