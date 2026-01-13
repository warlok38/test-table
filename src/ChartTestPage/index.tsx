import { LineChart, type DataPoint, type Series } from "../charts";
import { mockData } from "./mock";

function calculateTrendLine(points: Array<{ x: number; y: number }>) {
  const n = points.length;

  const numericPoints = points.map((p, index) => ({
    x: typeof p.x === "number" ? p.x : index,
    y: p.y,
  }));

  let sx = 0,
    sy = 0,
    sxy = 0,
    sx2 = 0;

  for (const p of numericPoints) {
    sx += p.x;
    sy += p.y;
    sxy += p.x * p.y;
    sx2 += p.x * p.x;
  }

  const a = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const b = (sy - a * sx) / n;

  return (x: number) => a * x + b;
}

function createTrendData(
  sourceData: DataPoint[],
  dataKey: string,
  xAxisKey: string
) {
  const validPoints = sourceData
    .filter((item) => item[dataKey] !== null)
    .map((item, index) => ({
      x: typeof item[xAxisKey] === "number" ? item[xAxisKey] : index,
      y: item[dataKey] as number,
    }));

  if (validPoints.length < 2) return [];

  const trendFunction = calculateTrendLine(validPoints);

  return sourceData.map((item, index) => {
    const xValue = typeof item[xAxisKey] === "number" ? item[xAxisKey] : index;
    return {
      ...item,
      trend: trendFunction(xValue),
    };
  });
}

const monthlySeries: Series[] = [
  {
    dataKey: "fact",
    label: "Факт",
    color: "#fa3",
    strokeWidth: 3,
    showDots: true,
    showValues: true,
    valueStep: 2,
  },
  {
    dataKey: "trend",
    label: "Тренд (Факт)",
    color: "#939393",
    strokeWidth: 1,
    showDots: false,
    showValues: false,
  },
];

export const ChartTestPage = () => {
  const dataWithTrend = createTrendData(mockData, "fact", "x");

  return (
    <div style={{ maxWidth: 900, height: 400 }}>
      <LineChart
        data={dataWithTrend}
        series={monthlySeries}
        xAxisKey="x"
        xAxis={{
          tickFormat: (value) => {
            const date = new Date(value as string);
            return date.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            });
          },
          tickCount: 8,
        }}
        yAxis={{
          tickFormat: (value) => {
            if (typeof value === "number") {
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toFixed(0);
            }
            return String(value);
          },
        }}
        grid={{ x: true }}
        tooltip={true}
        interaction={{
          verticalLine: true,
          showIntersectionPoints: true,
        }}
      />
    </div>
  );
};
