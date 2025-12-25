import React from "react";
import cn from "classnames";
import { useChartDimensions } from "./hooks/useChartDimensions";
import { useChartScales } from "./hooks/useChartScales";
import { useChartInteraction } from "./hooks/useChartInteraction";
import { generateXTicks, generateYTicks, formatTickValue } from "./utils";
import {
  ChartGrid,
  ChartAxes,
  ChartLine,
  ChartLegend,
  ChartTooltip,
  VerticalLine,
} from "./components";
import styles from "./LineChart.module.css";
import type { LineChartProps } from "../types";

export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  width,
  height,
  margin = {},
  xAxisKey = "x",
  xAxis = {},
  yAxis = {},
  grid = { x: false, y: false },
  tooltip = false,
  legend = false,
  title,
  className,
  interaction = {
    verticalLine: false,
    snapToPoint: false,
    lineColor: "#666",
    lineWidth: 1,
    lineDasharray: "4 4",
    showIntersectionPoints: false,
    intersectionPointSize: 6,
  },
}) => {
  // Используем кастомные хуки
  const { containerRef, dimensions, isLoading } = useChartDimensions(
    width,
    height,
    margin,
    legend
  );

  const { scaleX, scaleY, yMin, yMax } = useChartScales(
    data,
    series,
    xAxisKey,
    dimensions.innerWidth,
    dimensions.innerHeight,
    yAxis
  );

  const {
    verticalLine,
    hoveredPoint,
    handleMouseMove,
    handleMouseLeave,
    handlePointMouseEnter,
    setHoveredPoint,
  } = useChartInteraction(
    data,
    xAxisKey,
    scaleX,
    interaction,
    tooltip,
    dimensions.innerWidth,
    dimensions.margin.left,
    dimensions.margin.top
  );

  // Генерируем деления осей
  const xTicks = generateXTicks(data, xAxisKey, xAxis.tickCount);
  const yTicks = generateYTicks(yMin, yMax, yAxis.tickCount);

  // Форматирование значений
  const formatYValue = (value: number): string => {
    return formatTickValue(value, yAxis.tickFormat);
  };

  const formatXValue = (value: number | string | Date): string => {
    return formatTickValue(value, xAxis.tickFormat);
  };

  // Если размеры еще не известны, показываем лоадер
  if (isLoading) {
    return (
      <div
        ref={containerRef}
        className={cn(styles.chartContainer, className)}
        style={{ width, height }}
      >
        <div className={styles.chartSkeleton}>Загрузка графика...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(styles.chartContainer, className)}
      style={{ width, height }}
    >
      {title && <div className={styles.chartTitle}>{title}</div>}

      <div className={styles.chartWrapper}>
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className={styles.chartSvg}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect
            width={dimensions.width}
            height={dimensions.height}
            fill="transparent"
            className={styles.chartBackground}
          />

          {/* Сетка */}
          <ChartGrid
            grid={grid}
            xTicks={xTicks}
            yTicks={yTicks}
            scaleX={scaleX}
            scaleY={scaleY}
            margin={dimensions.margin}
            innerWidth={dimensions.innerWidth}
            innerHeight={dimensions.innerHeight}
          />

          {/* Оси */}
          <ChartAxes
            xAxis={xAxis}
            yAxis={yAxis}
            xTicks={xTicks}
            yTicks={yTicks}
            scaleX={scaleX}
            scaleY={scaleY}
            margin={dimensions.margin}
            innerWidth={dimensions.innerWidth}
            innerHeight={dimensions.innerHeight}
            width={dimensions.width}
            height={dimensions.height}
          />

          {/* Графики */}
          <g
            transform={`translate(${dimensions.margin.left}, ${dimensions.margin.top})`}
          >
            {series.map((serie) => (
              <ChartLine
                key={serie.dataKey}
                serie={serie}
                data={data}
                xAxisKey={xAxisKey}
                scaleX={scaleX}
                scaleY={scaleY}
                innerWidth={dimensions.innerWidth}
                innerHeight={dimensions.innerHeight}
                interaction={interaction}
                tooltip={tooltip}
                formatYValue={formatYValue}
                onPointMouseEnter={handlePointMouseEnter}
                onPointMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </g>

          {/* Вертикальная линия */}
          <VerticalLine
            verticalLine={verticalLine}
            interaction={interaction}
            series={series}
            data={data}
            scaleY={scaleY}
            margin={dimensions.margin}
            innerHeight={dimensions.innerHeight}
          />
        </svg>

        {/* Легенда */}
        {legend && (
          <ChartLegend
            series={series}
            position={{
              right: dimensions.margin.right,
              top: dimensions.margin.top,
            }}
          />
        )}

        {/* Всплывающая подсказка для вертикальной линии */}
        {tooltip && verticalLine.visible && verticalLine.index !== null && (
          <ChartTooltip
            type="vertical"
            position={{
              x: dimensions.margin.left + verticalLine.x + 10,
              y: dimensions.margin.top + 10,
            }}
            data={data}
            series={series}
            xAxisKey={xAxisKey}
            formatXValue={formatXValue}
            formatYValue={formatYValue}
            verticalLineIndex={verticalLine.index}
          />
        )}

        {/* Всплывающая подсказка для обычного режима */}
        {tooltip && hoveredPoint && !interaction.verticalLine && (
          <ChartTooltip
            type="point"
            position={{
              x: hoveredPoint.x + 10,
              y: hoveredPoint.y - 10,
            }}
            data={hoveredPoint.data}
            series={series}
            xAxisKey={xAxisKey}
            formatXValue={formatXValue}
            formatYValue={formatYValue}
          />
        )}
      </div>
    </div>
  );
};
