import type {
  DataPoint,
  Series,
  MedianConfig,
  FilteredPoint,
  InteractionPoint,
  NearestPoint,
} from "../types";

/**
 * Получает все числовые значения из данных по указанным ключам
 */
export const extractAllValues = (
  data: DataPoint[],
  keys: string[]
): number[] => {
  const values: number[] = [];

  data.forEach((item) => {
    keys.forEach((key) => {
      const value = item[key];
      if (typeof value === "number" && !isNaN(value)) {
        values.push(value);
      }
    });
  });

  return values;
};

/**
 * Находит минимальное значение среди всех серий
 */
export const getMinValue = (data: DataPoint[], keys: string[]): number => {
  const values = extractAllValues(data, keys);
  if (values.length === 0) return 0;

  return Math.min(...values);
};

/**
 * Находит максимальное значение среди всех серий
 */
export const getMaxValue = (data: DataPoint[], keys: string[]): number => {
  const values = extractAllValues(data, keys);
  if (values.length === 0) return 100;

  return Math.max(...values);
};

/**
 * Рассчитывает оптимальный диапазон для оси Y
 */
export const calculateYRange = (
  data: DataPoint[],
  series: Series[],
  userMin?: number,
  userMax?: number,
  paddingPercent: number = 0.1
): { min: number; max: number } => {
  const keys = series.map((s) => s.dataKey);

  if (userMin !== undefined && userMax !== undefined) {
    return { min: userMin, max: userMax };
  }

  let min = getMinValue(data, keys);
  let max = getMaxValue(data, keys);

  if (min === max) {
    return {
      min: min - Math.abs(min * 0.1),
      max: max + Math.abs(max * 0.1),
    };
  }

  const range = max - min;
  const padding = range * paddingPercent;
  const actualMin = min >= 0 && min < range * 0.2 ? 0 : min - padding;

  return {
    min: actualMin,
    max: max + padding,
  };
};

/**
 * Создает линейную функцию масштабирования для оси X
 */
export const createXScale = (
  data: DataPoint[],
  xAxisKey: string,
  width: number
): ((value: any) => number) => {
  if (data.length <= 1) {
    return () => width / 2;
  }

  const firstValue = data[0][xAxisKey];

  if (typeof firstValue === "number") {
    const values = data.map((d) => d[xAxisKey] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    return (value: number) => {
      if (range === 0) return width / 2;
      return ((value - min) / range) * width;
    };
  } else {
    const uniqueValues = [...new Set(data.map((d) => d[xAxisKey]))];

    return (value: any) => {
      const index = uniqueValues.indexOf(value);
      if (index === -1 || uniqueValues.length === 1) return width / 2;
      return (index / (uniqueValues.length - 1)) * width;
    };
  }
};

/**
 * Создает линейную функцию масштабирования для оси Y
 */
export const createYScale = (
  yMin: number,
  yMax: number,
  height: number
): ((value: number) => number) => {
  const range = yMax - yMin;

  return (value: number) => {
    const normalized = range === 0 ? 0.5 : (value - yMin) / range;
    return height - normalized * height;
  };
};

/**
 * Генерирует деления для оси Y
 */
export const generateYTicks = (
  yMin: number,
  yMax: number,
  count: number = 6
): number[] => {
  const ticks: number[] = [];
  const step = (yMax - yMin) / (count - 1);

  for (let i = 0; i < count; i++) {
    ticks.push(yMin + step * i);
  }

  return ticks;
};

/**
 * Генерирует деления для оси X
 */
export const generateXTicks = (
  data: DataPoint[],
  xAxisKey: string,
  count: number = 10
): DataPoint[] => {
  const tickCount = Math.min(count, data.length);

  if (data.length <= tickCount) {
    return [...data];
  }

  const step = Math.floor(data.length / tickCount);
  return data.filter((_, index) => index % step === 0);
};

/**
 * Форматирует значение для отображения
 */
export const formatTickValue = (
  value: number | string | Date,
  formatter?: (value: number | string | Date) => string
): string => {
  if (formatter) {
    return formatter(value);
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  }

  if (typeof value === "string") {
    const date = Date.parse(value);
    if (!isNaN(date)) {
      return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
    return value;
  }

  return String(value);
};

/**
 * Находит ближайшую точку данных к указанной координате X
 */
export const findNearestPoint = (
  data: DataPoint[],
  xAxisKey: string,
  xScale: (value: number | string | Date) => number,
  mouseX: number,
  innerWidth: number
): NearestPoint | null => {
  if (data.length === 0) return null;

  let nearestIndex = 0;
  let minDistance = Infinity;

  data.forEach((point, index) => {
    const pointX = xScale(point[xAxisKey]);
    const distance = Math.abs(pointX - mouseX);

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  const maxDistance = innerWidth * 0.1;
  if (minDistance > maxDistance) return null;

  return {
    index: nearestIndex,
    point: data[nearestIndex],
    distance: minDistance,
  };
};

/**
 * Рассчитывает координату X для вертикальной линии
 */
export const calculateVerticalLineX = (
  data: DataPoint[],
  xAxisKey: string,
  xScale: (value: number | string | Date) => number,
  mouseX: number,
  snapToPoint: boolean
): { x: number; index: number | null } => {
  if (data.length === 0 || !snapToPoint) {
    return { x: mouseX, index: null };
  }

  const nearest = findNearestPoint(data, xAxisKey, xScale, mouseX, Infinity);

  if (nearest) {
    return { x: xScale(nearest.point[xAxisKey]), index: nearest.index };
  }

  return { x: mouseX, index: null };
};

/**
 * Рассчитывает координаты Y для точек пересечения
 */
export const calculateIntersectionPoints = (
  series: Series[],
  dataPoint: DataPoint,
  yScale: (value: number) => number
): InteractionPoint[] => {
  const points: InteractionPoint[] = [];

  series.forEach((serie) => {
    const value = dataPoint[serie.dataKey];
    if (typeof value === "number") {
      points.push({
        x: 0,
        y: yScale(value),
        seriesKey: serie.dataKey,
        value: value,
      });
    }
  });

  return points;
};

export const filterValues = (
  points: FilteredPoint[],
  step: number | "all" | "first-last" | "min-max" = "all",
  customFilter?: (value: number, index: number, values: number[]) => boolean
): FilteredPoint[] => {
  if (points.length === 0) return [];

  if (typeof step === "number" && step > 1) {
    return points.filter((_, index) => index % step === 0);
  }

  if (step === "first-last") {
    return points.filter(
      (_, index) => index === 0 || index === points.length - 1
    );
  }

  if (step === "min-max") {
    const numericValues = points.map((v) => v.value);
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);

    return points.filter((v) => v.value === min || v.value === max);
  }

  if (customFilter) {
    const allValues = points.map((v) => v.value);
    return points.filter((v, index) => customFilter(v.value, index, allValues));
  }

  return points;
};

/**
 * Конвертирует px в rem относительно базового размера 16px
 */
export const pxToRem = (px: number): string => {
  return `${px / 16}rem`;
};

/**
 * Возвращает значение из системы font-size
 */
export const getFontSize = (
  size: number | "xs" | "sm" | "default" | "lg" | "xl" = "default"
): string => {
  if (typeof size === "number") {
    return pxToRem(size);
  }

  const sizes = {
    xs: "0.75rem",
    sm: "0.875rem",
    default: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  } as const;

  return sizes[size];
};

/**
 * Рассчитывает медиану массива чисел
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

/**
 * Получает все числовые значения из данных по ключу
 */
export const extractSeriesValues = (
  data: DataPoint[],
  dataKey: string
): number[] => {
  return data
    .map((point) => point[dataKey])
    .filter((value): value is number => typeof value === "number")
    .filter((value) => !isNaN(value));
};

/**
 * Получает конфигурацию медианы
 */
export const getMedianConfig = (
  serie: Series,
  defaultColor: string
): MedianConfig | null => {
  if (!serie.median) return null;

  if (serie.median === true) {
    return {
      color: defaultColor,
      style: "dashed",
      width: serie.strokeWidth || 1,
      opacity: 0.5,
      showLabel: false,
      labelPosition: "right",
      labelOffset: 10,
      labelSize: "sm",
    };
  }

  return {
    color: defaultColor,
    style: "dashed",
    width: serie.strokeWidth || 1,
    opacity: 0.5,
    showLabel: false,
    labelPosition: "right",
    labelOffset: 10,
    labelSize: "sm",
    ...serie.median,
  };
};
