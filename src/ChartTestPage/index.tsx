import { LineChart, type Series } from "../charts";
import { mockData } from "./mock";

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
    dataKey: "plan",
    label: "План",
    color: "#666",
    strokeWidth: 2,
    showDots: false,
    showValues: true,
    valueStep: 2,
  },
];

export const ChartTestPage = () => {
  return (
    <div style={{ maxWidth: 900, height: 400 }}>
      <LineChart
        data={mockData}
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
