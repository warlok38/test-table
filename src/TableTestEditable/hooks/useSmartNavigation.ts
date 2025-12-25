import { useState, useCallback, useMemo } from "react";
import { type CellMap, buildCellMap, findCellIndices } from "../utils";
import { type NavigationContext, navigateToCell } from "../navigationUtils";
import type { ColumnType } from "../types";

export function useSmartNavigation<T extends { id: string | number }>(
  data: T[],
  columns: ColumnType<T>[]
) {
  const [navigationContext, setNavigationContext] = useState<NavigationContext>(
    {
      rowOffset: 0,
      colOffset: 0,
      lastDirection: null,
    }
  );

  const cellMap = useMemo<CellMap<T>>(
    () => buildCellMap(data, columns),
    [data, columns]
  );

  const navigate = useCallback(
    (
      currentId: T["id"],
      currentKey: keyof T,
      direction: "up" | "down" | "left" | "right" | "next"
    ): { id: T["id"]; key: keyof T; context: NavigationContext } | null => {
      const { rowIndex, colIndex } = findCellIndices(
        currentId,
        currentKey,
        data,
        columns
      );

      // Находим текущую ячейку и обновляем контекст
      const currentCell = cellMap[`${rowIndex},${colIndex}`];
      if (!currentCell) return null;

      const result = navigateToCell(
        rowIndex,
        colIndex,
        direction,
        cellMap,
        data,
        columns,
        navigationContext
      );

      if (!result) return null;

      // Сохраняем новый контекст
      setNavigationContext(result.context);

      return {
        id: result.cell.rowData.id,
        //@ts-ignore
        key: result.cell.column.dataIndex,
        context: result.context,
      };
    },
    [data, columns, cellMap, navigationContext]
  );

  const updateContextFromCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      const cell = cellMap[`${rowIndex},${colIndex}`];
      if (cell) {
        const newContext: NavigationContext = {
          rowOffset: 0,
          colOffset: 0,
          lastDirection: null,
        };
        setNavigationContext(newContext);
      }
    },
    [cellMap]
  );

  return {
    cellMap,
    navigate,
    navigationContext,
    updateContextFromCell,
  };
}
