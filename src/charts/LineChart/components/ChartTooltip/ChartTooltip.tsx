import React from "react";
import styles from "./ChartTooltip.module.css";
import type { DataPoint, Series } from "../../../types";

interface ChartTooltipProps {
  type: "vertical" | "point";
  position: { x: number; y: number };
  data: DataPoint | DataPoint[];
  series: Series[];
  xAxisKey: string;
  formatXValue: (value: number | string | Date) => string;
  formatYValue: (value: number) => string;
  verticalLineIndex?: number | null;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  type,
  position,
  data,
  series,
  xAxisKey,
  formatXValue,
  formatYValue,
  verticalLineIndex,
}) => {
  const tooltipClass =
    type === "vertical" ? styles.verticalLineTooltip : styles.tooltip;

  const getDataPoint = (): DataPoint | null => {
    if (
      type === "vertical" &&
      verticalLineIndex !== null &&
      Array.isArray(data)
    ) {
      return data[verticalLineIndex!];
    }
    if (!Array.isArray(data)) {
      return data;
    }
    return null;
  };

  const dataPoint = getDataPoint();
  if (!dataPoint) return null;

  return (
    <div
      className={tooltipClass}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className={styles.tooltipContent}>
        <div className={styles.tooltipTitle}>
          {formatXValue(dataPoint[xAxisKey])}
        </div>
        {series.map((serie) => {
          const value = dataPoint[serie.dataKey];
          if (typeof value !== "number") return null;

          return (
            <div key={serie.dataKey} className={styles.tooltipItem}>
              <div
                className={styles.tooltipColor}
                style={{ backgroundColor: serie.color || "#1976d2" }}
              />
              <span className={styles.tooltipLabel}>{serie.label}:</span>
              <span className={styles.tooltipValue}>{formatYValue(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
