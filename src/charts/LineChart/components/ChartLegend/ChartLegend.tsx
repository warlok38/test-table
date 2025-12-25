import React from "react";
import styles from "./ChartLegend.module.css";
import type { Series } from "../../../types";

interface ChartLegendProps {
  series: Series[];
  position: { right: number; top: number };
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  series,
  position,
}) => {
  return (
    <div
      className={styles.legend}
      style={{
        right: position.right - 20,
        top: position.top,
      }}
    >
      {series.map((serie) => (
        <div key={serie.dataKey} className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: serie.color || "#000" }}
          />
          <span className={styles.legendLabel}>{serie.label}</span>
        </div>
      ))}
    </div>
  );
};
