import { useMemo } from "react";
import { calculateYRange, createXScale, createYScale } from "../utils";
import type { DataPoint, Series } from "../../types";

interface UseChartScalesReturn {
  scaleX: (value: number | string | Date) => number;
  scaleY: (value: number) => number;
  yMin: number;
  yMax: number;
}

export const useChartScales = (
  data: DataPoint[],
  series: Series[],
  xAxisKey: string,
  innerWidth: number,
  innerHeight: number,
  yAxis?: { min?: number; max?: number }
): UseChartScalesReturn => {
  const { min: yMin, max: yMax } = useMemo(
    () => calculateYRange(data, series, yAxis?.min, yAxis?.max, 0.1),
    [data, series, yAxis?.min, yAxis?.max]
  );

  const scaleX = useMemo(
    () => createXScale(data, xAxisKey, innerWidth),
    [data, xAxisKey, innerWidth]
  );

  const scaleY = useMemo(
    () => createYScale(yMin, yMax, innerHeight),
    [yMin, yMax, innerHeight]
  );

  return { scaleX, scaleY, yMin, yMax };
};
