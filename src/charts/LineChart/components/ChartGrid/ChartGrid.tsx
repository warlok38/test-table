import React from "react";
import styles from "./ChartGrid.module.css";
import type { DataPoint } from "../../../types";

interface ChartGridProps {
  grid: { x?: boolean; y?: boolean };
  xTicks: DataPoint[];
  yTicks: number[];
  scaleX: (value: number | string | Date) => number;
  scaleY: (value: number) => number;
  margin: { top: number; left: number };
  innerWidth: number;
  innerHeight: number;
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  grid,
  xTicks,
  yTicks,
  scaleX,
  scaleY,
  margin,
  innerWidth,
  innerHeight,
}) => {
  return (
    <>
      {grid.y &&
        yTicks.map((tick, i) => {
          const y = margin.top + scaleY(tick);
          return (
            <g key={`y-grid-${i}`}>
              <line
                x1={margin.left}
                y1={y}
                x2={margin.left + innerWidth}
                y2={y}
                className={styles.gridLine}
              />
            </g>
          );
        })}

      {grid.x &&
        xTicks.map((tick, i) => {
          const x = margin.left + scaleX(tick.x);
          return (
            <g key={`x-grid-${i}`}>
              <line
                x1={x}
                y1={margin.top}
                x2={x}
                y2={margin.top + innerHeight}
                className={styles.gridLine}
              />
            </g>
          );
        })}
    </>
  );
};
