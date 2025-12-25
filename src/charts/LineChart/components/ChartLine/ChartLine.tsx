import React from "react";
import {
  filterValues,
  getMedianConfig,
  extractSeriesValues,
  calculateMedian,
  getFontSize,
} from "../../utils";
import styles from "./ChartLine.module.css";
import type { ChartInteraction, DataPoint, Series } from "../../../types";

interface ChartLineProps {
  serie: Series;
  data: DataPoint[];
  xAxisKey: string;
  scaleX: (value: number | string | Date) => number;
  scaleY: (value: number) => number;
  innerWidth: number;
  innerHeight: number;
  interaction: ChartInteraction;
  tooltip: boolean;
  formatYValue: (value: number) => string;
  onPointMouseEnter: (
    event: React.MouseEvent<SVGCircleElement>,
    pointData: DataPoint,
    seriesKey: string
  ) => void;
  onPointMouseLeave: () => void;
}

export const ChartLine: React.FC<ChartLineProps> = ({
  serie,
  data,
  xAxisKey,
  scaleX,
  scaleY,
  innerWidth,
  innerHeight,
  interaction,
  tooltip,
  formatYValue,
  onPointMouseEnter,
  onPointMouseLeave,
}) => {
  // Собираем точки для линии
  const allPoints = data.map((point, index) => ({
    x: scaleX(point[xAxisKey]),
    y: scaleY(point[serie.dataKey] as number),
    originalX: point[xAxisKey],
    originalY: point[serie.dataKey] as number,
    value: point[serie.dataKey] as number,
    index,
  }));

  // Строим путь для линии
  let pathData = "";
  allPoints.forEach((point, i) => {
    if (i === 0) {
      pathData = `M ${point.x} ${point.y}`;
    } else {
      pathData += ` L ${point.x} ${point.y}`;
    }
  });

  // Фильтруем точки для отображения значений
  const pointsForValues = filterValues(
    allPoints,
    serie.valueStep || "all",
    serie.valueFilter
  );

  // Рассчитываем медиану если нужно
  const medianConfig = getMedianConfig(serie, serie.color || "#1976d2");
  let medianLine = null;
  let medianLabel = null;

  if (medianConfig) {
    const seriesValues = extractSeriesValues(data, serie.dataKey);
    const medianValue = calculateMedian(seriesValues);

    if (seriesValues.length > 0) {
      const medianY = scaleY(medianValue);
      const strokeDasharray =
        medianConfig.style === "dashed"
          ? "6 4"
          : medianConfig.style === "dotted"
          ? "2 4"
          : "none";

      medianLine = (
        <line
          x1={0}
          y1={medianY}
          x2={innerWidth}
          y2={medianY}
          stroke={medianConfig.color}
          strokeWidth={medianConfig.width}
          strokeDasharray={strokeDasharray}
          strokeOpacity={medianConfig.opacity}
          className={styles.medianLine}
        />
      );

      if (medianConfig.showLabel) {
        const formattedMedian = serie.valueFormat
          ? serie.valueFormat(medianValue)
          : formatYValue(medianValue);

        let labelX = 0;
        let labelY = medianY - (medianConfig.labelOffset || 10);
        let textAnchor: "start" | "middle" | "end" = "start";

        switch (medianConfig.labelPosition) {
          case "center":
            labelX = innerWidth / 2;
            textAnchor = "middle";
            break;
          case "right":
            labelX = innerWidth;
            textAnchor = "end";
            break;
        }

        const fontSize = getFontSize(medianConfig.labelSize || "sm");

        medianLabel = (
          <text
            x={labelX}
            y={labelY}
            textAnchor={textAnchor}
            dominantBaseline="auto"
            className={styles.medianLabel}
            style={{
              fontSize,
              fill: medianConfig.color,
              opacity: medianConfig.opacity,
              fontWeight: "500",
            }}
          >
            Медиана: {formattedMedian}
          </text>
        );
      }
    }
  }

  return (
    <g key={serie.dataKey}>
      {/* Основная линия */}
      <path
        d={pathData}
        fill="none"
        stroke={serie.color || "#1976d2"}
        strokeWidth={serie.strokeWidth || 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.line}
      />

      {/* Медиана */}
      {medianLine}
      {medianLabel}

      {/* Точки */}
      {!interaction.verticalLine &&
        serie.showDots !== false &&
        allPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={serie.dotSize || 4}
            fill={serie.color || "#1976d2"}
            className={styles.dot}
            onMouseEnter={(e) => onPointMouseEnter(e, data[i], serie.dataKey)}
            onMouseLeave={onPointMouseLeave}
          />
        ))}

      {/* Значения над точками */}
      {serie.showValues &&
        pointsForValues.map((point) => {
          const valueOffset = serie.valueOffset || 8;
          const valueSize = serie.valueSize || "default";

          let textX = point.x;
          let textY = point.y;
          let textAnchor: "start" | "middle" | "end" = "middle";
          let dominantBaseline: "auto" | "middle" | "hanging" = "auto";

          switch (serie.valuePosition) {
            case "top":
              textY = point.y - valueOffset;
              break;
            case "bottom":
              textY = point.y + valueOffset;
              dominantBaseline = "hanging";
              break;
            case "left":
              textX = point.x - valueOffset;
              textAnchor = "end";
              dominantBaseline = "middle";
              break;
            case "right":
              textX = point.x + valueOffset;
              textAnchor = "start";
              dominantBaseline = "middle";
              break;
            default:
              textY = point.y - valueOffset;
          }

          const formattedValue = serie.valueFormat
            ? serie.valueFormat(point.originalY)
            : formatYValue(point.originalY);

          const fontSize = getFontSize(valueSize);

          return (
            <text
              key={`${serie.dataKey}-value-${point.index}`}
              x={textX}
              y={textY}
              textAnchor={textAnchor}
              dominantBaseline={dominantBaseline}
              className={styles.valueLabel}
              style={{
                fontSize,
                fill: serie.color || "#000",
                fontWeight: "500",
              }}
            >
              {formattedValue}
            </text>
          );
        })}
    </g>
  );
};
