import { useState, useCallback } from "react";
import { calculateVerticalLineX } from "../utils";
import type {
  ChartInteraction,
  DataPoint,
  HoveredPoint,
  VerticalLineState,
} from "../../types";

interface UseChartInteractionReturn {
  verticalLine: VerticalLineState;
  hoveredPoint: HoveredPoint | null;
  handleMouseMove: (event: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseLeave: () => void;
  handlePointMouseEnter: (
    event: React.MouseEvent<SVGCircleElement>,
    pointData: DataPoint,
    seriesKey: string
  ) => void;
  setHoveredPoint: (point: HoveredPoint | null) => void;
}

export const useChartInteraction = (
  data: DataPoint[],
  xAxisKey: string,
  scaleX: (value: number | string | Date) => number,
  interaction: ChartInteraction,
  tooltip: boolean,
  safeInnerWidth: number,
  marginLeft: number,
  marginTop: number
): UseChartInteractionReturn => {
  const [verticalLine, setVerticalLine] = useState<VerticalLineState>({
    visible: false,
    x: 0,
    index: null,
    mouseX: 0,
  });

  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!interaction.verticalLine || safeInnerWidth <= 0) return;

      const svgRect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - svgRect.left - marginLeft;

      if (mouseX < 0 || mouseX > safeInnerWidth) {
        setVerticalLine({ visible: false, x: 0, index: null, mouseX: 0 });
        setHoveredPoint(null);
        return;
      }

      const { x, index } = calculateVerticalLineX(
        data,
        xAxisKey,
        scaleX,
        mouseX,
        interaction.snapToPoint || true
      );

      setVerticalLine({
        visible: true,
        x,
        index,
        mouseX,
      });

      if (index !== null && tooltip) {
        const pointData = data[index];
        setHoveredPoint({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
          data: pointData,
        });
      } else {
        setHoveredPoint(null);
      }
    },
    [data, xAxisKey, scaleX, interaction, tooltip, marginLeft, safeInnerWidth]
  );

  const handleMouseLeave = useCallback(() => {
    setVerticalLine({ visible: false, x: 0, index: null, mouseX: 0 });
    setHoveredPoint(null);
  }, []);

  const handlePointMouseEnter = useCallback(
    (
      event: React.MouseEvent<SVGCircleElement>,
      pointData: DataPoint,
      seriesKey: string
    ) => {
      if (!tooltip || interaction.verticalLine) return;

      const circle = event.currentTarget;
      const circleX = circle.cx.baseVal.value + marginLeft;
      const circleY = circle.cy.baseVal.value + marginTop;

      setHoveredPoint({
        x: circleX,
        y: circleY,
        data: { ...pointData, seriesKey },
      });
    },
    [tooltip, interaction.verticalLine, marginLeft, marginTop]
  );

  return {
    verticalLine,
    hoveredPoint,
    handleMouseMove,
    handleMouseLeave,
    handlePointMouseEnter,
    setHoveredPoint,
  };
};
