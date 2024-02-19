import React, { useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts';

const TradeChart = ({ trades }) => {
    const chartContainerRef = useRef();
    const chart = useRef(null);

    useEffect(() => {
        if (chart.current === null) {
            chart.current = createChart(chartContainerRef.current, { width: 600, height: 300 });
            const lineSeries = chart.current.addLineSeries();

            lineSeries.setData(trades.map(trade => ({
                time: trade.time, // Assuming 'time' is in 'YYYY-MM-DD' format
                value: trade.price,
            })));

            lineSeries.setMarkers(trades.map(trade => ({
                time: trade.time,
                position: 'aboveBar',
                color: '#2196F3',
                shape: 'circle',
                text: trade.type, // Assuming 'type' is 'Buy' or 'Sell'
            })));
        }

        return () => {
            chart.current.remove();
            chart.current = null;
        };
    }, [trades]);

    return <div ref={chartContainerRef} />;
};

export default TradeChart;
