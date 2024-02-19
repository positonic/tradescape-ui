import styles from "./index.module.css";
import { useEffect, useRef } from "react";
import {
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
  widget,
} from "@/public/static/charting_library/charting_library.min";
import Link from "next/link";
import tradingViewData from "@/app/tradingViewData";

export const TVChartContainer = (
  props: Partial<ChartingLibraryWidgetOptions>
) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      // datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
      //   "https://demo_feed.tradingview.com",
      //   undefined,
      //   {
      //     maxResponseLength: 1000,
      //     expectedOrder: "latestFirst",
      //   }
      // ),
      datafeed: tradingViewData,
      interval: props.interval as ResolutionString,
      //   container: chartContainerRef.current,
      container_id: "container_id",
      library_path: props.library_path,
      locale: props.locale as LanguageCode,
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: props.charts_storage_url,
      charts_storage_api_version: props.charts_storage_api_version,
      client_id: props.client_id,
      user_id: props.user_id,
      fullscreen: props.fullscreen,
      autosize: props.autosize,
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      const chart = tvWidget.chart();
      const trades = [
        { time: "2024-02-14", price: 48000, type: "Buy" },
        { time: "2024-02-17", price: 49000, type: "Sell" },
        // Add more trades as needed
      ];
      // Add trades to the chart
      trades.forEach((trade) => {
        const time = new Date(trade.time).getTime() / 1000; // Convert to UNIX timestamp
        chart.createShape(
          // First argument: point
          {
            time: time,
            price: trade.price,
          },
          // Second argument: options
          {
            shape: trade.type === "Buy" ? "arrow_up" : "arrow_down",
            text: trade.type,
            // Include other options as necessary
            // color: trade.type === "Buy" ? "green" : "red", // Example color customization
            // fontSize: 12, // Example font size customization
            // Note: The available options might vary, adjust according to the actual API documentation
          }
        );
      });
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute("title", "Click to show a notification popup");
        button.classList.add("apply-common-tooltip");
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!");
            },
          })
        );

        button.innerHTML = "Check API";
      });
    });

    return () => {
      tvWidget.remove();
    };
  }, [props]);

  return (
    <>
      <header className={styles.VersionHeader}>
        <br />
        <p>
          <Link href="/crypto/binance-btc_usdt">BTC / USDT</Link>
        </p>
      </header>
      <div
        id="container_id"
        ref={chartContainerRef}
        className={styles.TVChartContainer}
      />
    </>
  );
};
