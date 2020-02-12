import React, { FC, useState, useCallback, useMemo } from "react";
import { LinearGradient } from "@vx/gradient";
import { scaleTime, scaleLinear } from "@vx/scale";
import { Brush } from "@vx/brush";
import { PatternLines } from "@vx/pattern";
import { Bounds } from "@vx/brush/lib/types";
import { Margin, ShowProvidedProps } from "./types";
import { AppleStock } from "@vx/mock-data/lib/mocks/appleStock";
import { extent, max } from "d3-array";

import { stock } from "./brush/constants";
import { getDate, getStockValue } from "./brush/utils";
import AreaChart from "./brush/AreaChart";

type BrushChatProps = {
  compact: boolean;
  data: AppleStock[];
} & ShowProvidedProps;

const BrushChat: FC<BrushChatProps> = ({
  compact,
  width,
  height,
  margin,
  data
}) => {
  const [filteredStock, setFilteredStock] = useState(data);

  const handleBrushChange = useCallback((domain: Bounds | null) => {
    if (!domain) return;

    const { x0, x1, y0, y1 } = domain;
    const stockCopy = stock.filter(s => {
      const x = getDate(s).getTime();
      const y = getStockValue(s);
      return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    });
    setFilteredStock(stockCopy);
  }, []);

  const handleBrushClick = useCallback(() => {
    setFilteredStock(data);
  }, [data]);

  const brushMargin: Margin = { top: 0, bottom: 20, left: 50, right: 20 };
  const chartSeparation = 10;
  const heightTopChart = 0.8 * (height as number);
  const heightBottomChart =
    (height as number) - heightTopChart - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(heightTopChart - margin.top - margin.bottom, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    heightBottomChart - brushMargin.top - brushMargin.bottom,
    0
  );

  // area chart scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredStock, getDate) as [Date, Date]
      }),
    [xMax, filteredStock]
  );
  const stockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, (max(filteredStock, getStockValue) || 0) + yMax / 3]
      }),
    [yMax, filteredStock]
  );

  // brush chart scales
  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(data, getDate) as [Date, Date]
      }),
    [xBrushMax, data]
  );
  const brushStockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yBrushMax, 0],
        domain: [0, (max(data, getStockValue) || 0) + yBrushMax / 3],
        nice: true
      }),
    [data, yBrushMax]
  );

  return (
    <svg width={width} height={height}>
      <LinearGradient
        id="brush-gradient"
        from="#b9257a"
        fromOpacity={0.8}
        to="#7c1d6f"
        toOpacity={0.8}
      />
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#brush-gradient)"
        rx={14}
      />
      <AreaChart
        hideBottomAxis={compact}
        data={filteredStock}
        width={width}
        height={heightTopChart}
        margin={margin}
        yMax={yMax}
        xScale={dateScale}
        yScale={stockScale}
      />

      <AreaChart
        hideBottomAxis
        hideLeftAxis
        data={data}
        width={width}
        height={heightBottomChart}
        yMax={yBrushMax}
        xScale={brushDateScale}
        yScale={brushStockScale}
        margin={brushMargin}
        top={heightTopChart + chartSeparation}
      >
        <PatternLines
          id="brush_pattern"
          height={8}
          width={8}
          stroke="white"
          strokeWidth={1}
          orientation={["diagonal"]}
        />

        <Brush
          xScale={brushDateScale}
          yScale={brushStockScale}
          width={xBrushMax}
          height={yBrushMax}
          handleSize={8}
          resizeTriggerAreas={["left", "right", "bottomRight"]}
          brushDirection="horizontal"
          onChange={handleBrushChange}
          onClick={handleBrushClick}
          selectedBoxStyle={{
            fill: "url(#brush_pattern)",
            stroke: "white"
          }}
        />
      </AreaChart>
    </svg>
  );
};

const App = () => {
  return (
    <div className="App">
      <BrushChat
        data={stock}
        compact={false}
        margin={{
          top: 50,
          left: 50,
          bottom: 0,
          right: 20
        }}
        width={900}
        height={600}
      />
    </div>
  );
};

export default App;
