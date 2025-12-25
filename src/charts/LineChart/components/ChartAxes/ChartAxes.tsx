import React from "react";
import { formatTickValue } from "../../utils";
import styles from "./ChartAxes.module.css";
import type { AxisConfig, DataPoint } from "../../../types";

interface ChartAxesProps {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  xTicks: DataPoint[];
  yTicks: number[];
  scaleX: (value: number | string | Date) => number;
  scaleY: (value: number) => number;
  margin: { top: number; left: number; bottom: number; right: number };
  innerWidth: number;
  innerHeight: number;
  width: number;
  height: number;
}

export const ChartAxes: React.FC<ChartAxesProps> = ({
  xAxis,
  yAxis,
  xTicks,
  yTicks,
  scaleX,
  scaleY,
  margin,
  innerWidth,
  innerHeight,
  width,
  height,
}) => {
  const formatYValue = (value: number): string => {
    return formatTickValue(value, yAxis.tickFormat);
  };

  const formatXValue = (value: number | string | Date): string => {
    return formatTickValue(value, xAxis.tickFormat);
  };

  return (
    <>
      {/* Оси */}
      <g className={styles.axes}>
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerHeight}
          className={styles.axisLine}
        />
        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={margin.left + innerWidth}
          y2={margin.top + innerHeight}
          className={styles.axisLine}
        />
      </g>

      {/* Подписи оси Y */}
      <g className={styles.yLabels}>
        {yTicks.map((tick, i) => {
          const y = margin.top + scaleY(tick);
          return (
            <text
              key={`y-tick-${i}`}
              x={margin.left - 10}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className={styles.tickLabel}
            >
              {formatYValue(tick)}
            </text>
          );
        })}
      </g>

      {/* Подписи оси X */}
      <g className={styles.xLabels}>
        {xTicks.map((tick, i) => {
          const x = margin.left + scaleX(tick.x);
          return (
            <text
              key={`x-tick-${i}`}
              x={x}
              y={margin.top + innerHeight + 25}
              textAnchor="middle"
              className={styles.tickLabel}
            >
              {formatXValue(tick.x)}
            </text>
          );
        })}
      </g>

      {/* Название оси Y */}
      {yAxis.label && (
        <text
          x={15}
          y={margin.top + innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${margin.top + innerHeight / 2})`}
          className={styles.axisLabel}
        >
          {yAxis.label}
        </text>
      )}

      {/* Название оси X */}
      {xAxis.label && (
        <text
          x={margin.left + innerWidth / 2}
          y={height - 10}
          textAnchor="middle"
          className={styles.axisLabel}
        >
          {xAxis.label}
        </text>
      )}
    </>
  );
};
