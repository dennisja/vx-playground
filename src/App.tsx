import React, { FC, useState, useCallback } from "react";
import { Group } from "@vx/group";
import { LinearGradient } from "@vx/gradient";
import { AxisBottom, AxisLeft } from "@vx/axis";
import { AreaClosed, Bar } from "@vx/shape";
import { curveMonotoneX } from "@vx/curve";
import { scaleTime, scaleLinear } from "@vx/scale";
import { Brush } from "@vx/brush";
import { PatternLines } from "@vx/pattern";
import { ScaleType } from "@vx/shape/lib/types";
import { Bounds } from "@vx/brush/lib/types";
import appleStock, { AppleStock } from "@vx/mock-data/lib/mocks/appleStock";
import { Margin, ShowProvidedProps } from "./types";
import { extent, max } from "d3-array";

const stock = appleStock.slice(1200);
const axisColor = "#fff";
const axisBottomTickLabelProps = {
  textAnchor: "middle" as const,
  fontFamily: "Arial",
  fontSize: 10,
  fill: axisColor
};
const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "Arial",
  fontSize: 10,
  textAnchor: "end" as const,
  fill: axisColor
};

const getDate = (d: AppleStock) => new Date(d.date);
const getStockValue = (d: AppleStock) => d.close;

type AreaChatProps = {
  data: AppleStock[];
  width: number;
  height: number;
  top?: number;
  left?: number;
  yMax: number;
  xScale: ScaleType;
  yScale: ScaleType;
  margin: Margin;
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
};

const AreaChat: FC<AreaChatProps> = ({
  data,
  width,
  height,
  top,
  left,
  margin,
  yMax,
  xScale,
  yScale,
  hideLeftAxis,
  hideBottomAxis,
  children
}) => {
  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id="gradient"
        from={axisColor}
        fromOpacity={1}
        to={axisColor}
        toOpacity={0.2}
      />
      {!hideBottomAxis && (
        <AxisBottom<Date>
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          // TODO: put this function outside
          tickLabelProps={() => axisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft<number>
          scale={yScale}
          numTicks={5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisLeftTickLabelProps}
        />
      )}
      <AreaClosed<AppleStock>
        data={data}
        yScale={yScale}
        x={d => xScale(getDate(d)) || 0}
        y={d => yScale(getStockValue(d)) || 0}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveMonotoneX}
      />
      <Bar
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        rx={14}
      />
      {children}
    </Group>
  );
};

AreaChat.defaultProps = {
  hideBottomAxis: false,
  hideLeftAxis: false
};

type BrushChatProps = {
  compact: boolean;
} & ShowProvidedProps;

const BrushChat: FC<BrushChatProps> = ({ compact, width, height, margin }) => {
  const [filteredStock, setFilteredStock] = useState(stock);

  const handleBrushChange = useCallback((domain: Bounds | null) => {
    if (!domain) return;

    const { x0, x1, y0, y1 } = domain;
    const stockCopy = stock.filter(s => {
      const x = getDate(s).getTime();
      const y = getStockValue(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredStock(stockCopy);
  }, []);

  const handleBrushClick = useCallback(() => {
    setFilteredStock(stock);
  }, []);

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

  // scales
  const dateScale = scaleTime<number>({
    range: [0, xMax],
    domain: extent(filteredStock, getDate) as [Date, Date]
  });
  const stockScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, (max(filteredStock, getStockValue) || 0) + yMax / 3]
  });

  const brushDateScale = scaleTime<number>({
    range: [0, xBrushMax],
    domain: extent(stock, getDate) as [Date, Date]
  });
  const brushStockScale = scaleLinear<number>({
    range: [yBrushMax, 0],
    domain: [0, (max(stock, getStockValue) || 0) + yBrushMax / 3],
    nice: true
  });

  return (
    <svg width={width} height={height}>
      <LinearGradient
        id="brush-gradient"
        from="#b9257a"
        fromOpacity={0.8}
        to="#7c1d6f"
        toOpacity={0.8}
      ></LinearGradient>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#brush-gradient)"
        rx={14}
      />
      <AreaChat
        hideBottomAxis={compact}
        data={filteredStock}
        width={width}
        height={heightTopChart}
        margin={margin}
        yMax={yMax}
        xScale={dateScale}
        yScale={stockScale}
      ></AreaChat>

      <AreaChat
        hideBottomAxis
        hideLeftAxis
        data={stock}
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
      </AreaChat>
    </svg>
  );
};

const App = () => {
  return (
    <div className="App">
      <BrushChat
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
