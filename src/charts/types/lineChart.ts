export interface DataPoint {
  x: number | string | Date;
  [key: string]: number | string | Date;
}

export interface MedianConfig {
  color?: string;
  style?: "dashed" | "dotted" | "solid";
  width?: number;
  opacity?: number;
  showLabel?: boolean;
  labelPosition?: "left" | "right" | "center";
  labelOffset?: number;
  labelSize?: number | "xs" | "sm" | "default" | "lg" | "xl";
}

export interface Series {
  dataKey: string;
  label: string;
  color?: string;
  strokeWidth?: number;
  showDots?: boolean;
  dotSize?: number;
  showValues?: boolean;
  valueFormat?: (value: number) => string;
  valuePosition?: "top" | "bottom" | "left" | "right";
  valueOffset?: number;
  valueSize?: number | "xs" | "sm" | "default" | "lg" | "xl";
  valueStep?: number | "all" | "first-last" | "min-max";
  valueFilter?: (value: number, index: number, values: number[]) => boolean;
  median?: boolean | MedianConfig;
}

export interface AxisConfig {
  label?: string;
  tickFormat?: (value: number | string | Date) => string;
  tickCount?: number;
  min?: number;
  max?: number;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartInteraction {
  verticalLine?: boolean;
  snapToPoint?: boolean;
  lineColor?: string;
  lineWidth?: number;
  lineDasharray?: string;
  showIntersectionPoints?: boolean;
  intersectionPointSize?: number;
}

export interface LineChartProps {
  data: DataPoint[];
  series: Series[];
  width?: number;
  height?: number;
  margin?: Partial<ChartMargin>;
  xAxisKey?: string;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: {
    x?: boolean;
    y?: boolean;
  };
  tooltip?: boolean;
  legend?: boolean;
  title?: string;
  className?: string;
  interaction?: ChartInteraction;
}

export interface FilteredPoint {
  x: number;
  y: number;
  originalX: number | string | Date;
  originalY: number;
  value: number;
  index: number;
}

export interface InteractionPoint {
  x: number;
  y: number;
  seriesKey: string;
  value: number;
}

export interface NearestPoint {
  index: number;
  point: DataPoint;
  distance: number;
}

export interface VerticalLineState {
  visible: boolean;
  x: number;
  index: number | null;
  mouseX: number;
}

export interface HoveredPoint {
  x: number;
  y: number;
  data: DataPoint & { seriesKey?: string };
}
