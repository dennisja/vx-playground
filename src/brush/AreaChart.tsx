import React, { FC } from "react";
import { Group } from "@vx/group";
import { LinearGradient } from "@vx/gradient";
import { AxisBottom, AxisLeft } from "@vx/axis";
import { AreaClosed, Bar } from "@vx/shape";
import { curveMonotoneX } from "@vx/curve";
import { ScaleType } from "@vx/shape/lib/types";
import { AppleStock } from "@vx/mock-data/lib/mocks/appleStock";

import { Margin } from "../types";
import { axisColor } from "./constants";
import {
  getDate,
  getStockValue,
  getBottonAxisTickLableProps,
  getLeftAxisTickLabelProps
} from "./utils";

type AreaChartProps = {
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

const AreaChart: FC<AreaChartProps> = ({
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
          tickLabelProps={getBottonAxisTickLableProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft<number>
          scale={yScale}
          numTicks={5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={getLeftAxisTickLabelProps}
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

AreaChart.defaultProps = {
  hideBottomAxis: false,
  hideLeftAxis: false
};

export default AreaChart;
