import React from "react";
import { calculateIntersectionPoints } from "../../utils";
import styles from "./VerticalLine.module.css";
import type {
  ChartInteraction,
  DataPoint,
  Series,
  VerticalLineState,
} from "../../../types";

interface VerticalLineProps {
  verticalLine: VerticalLineState;
  interaction: ChartInteraction;
  series: Series[];
  data: DataPoint[];
  scaleY: (value: number) => number;
  margin: { top: number; left: number };
  innerHeight: number;
}

export const VerticalLine: React.FC<VerticalLineProps> = ({
  verticalLine,
  interaction,
  series,
  data,
  scaleY,
  margin,
  innerHeight,
}) => {
  if (!verticalLine.visible || !interaction.verticalLine) return null;

  const lineX = margin.left + verticalLine.x;
  const points =
    verticalLine.index !== null
      ? calculateIntersectionPoints(series, data[verticalLine.index], scaleY)
      : [];

  return (
    <g className={styles.verticalLineGroup}>
      {/* Вертикальная линия */}
      <line
        x1={lineX}
        y1={margin.top}
        x2={lineX}
        y2={margin.top + innerHeight}
        stroke={interaction.lineColor || "#666"}
        strokeWidth={interaction.lineWidth || 1}
        strokeDasharray={interaction.lineDasharray || "4 4"}
        className={styles.verticalLine}
      />

      {/* Точки пересечения */}
      {interaction.showIntersectionPoints &&
        points.map((point, i) => {
          const serie = series.find((s) => s.dataKey === point.seriesKey);
          return (
            <circle
              key={i}
              cx={lineX}
              cy={margin.top + point.y}
              r={interaction.intersectionPointSize || 6}
              fill={serie?.color || "#1976d2"}
              className={styles.intersectionPoint}
            />
          );
        })}
    </g>
  );
};
