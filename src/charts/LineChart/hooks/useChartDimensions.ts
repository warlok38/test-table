import { useRef, useState, useEffect } from "react";
import type { ChartMargin } from "../../types";

interface UseChartDimensionsReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: {
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
    margin: ChartMargin;
  };
  isLoading: boolean;
}

export const useChartDimensions = (
  width?: number,
  height?: number,
  margin?: Partial<ChartMargin>,
  legend?: boolean
): UseChartDimensionsReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  const actualWidth = width || containerSize.width;
  const actualHeight = height || containerSize.height;

  const defaultWidth = 800;
  const defaultHeight = 400;

  // Конфигурация отступов графика
  const chartMargin: ChartMargin = {
    top: 50,
    right: legend ? 120 : 50,
    bottom: 70,
    left: 70,
    ...margin,
  };

  const innerWidth = Math.max(
    0,
    actualWidth - chartMargin.left - chartMargin.right
  );
  const innerHeight = Math.max(
    0,
    actualHeight - chartMargin.top - chartMargin.bottom
  );

  return {
    containerRef,
    dimensions: {
      width: actualWidth || defaultWidth,
      height: actualHeight || defaultHeight,
      innerWidth,
      innerHeight,
      margin: chartMargin,
    },
    isLoading: actualWidth === 0 || actualHeight === 0,
  };
};
