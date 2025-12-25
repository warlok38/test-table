import { useCallback, useMemo } from "react";
import type { ColumnType } from "../types";
import {
  buildCellMap,
  findCellIndices,
  findNextEditableCell,
  type CellMap,
} from "../utils";

export function useTableNavigation<T extends { id: string | number }>(
  data: T[],
  columns: ColumnType<T>[]
) {
  // Карта ячеек (мемоизирована)
  const cellMap = useMemo<CellMap<T>>(
    () => buildCellMap(data, columns),
    [data, columns]
  );

  // Навигация по ячейкам
  const navigate = useCallback(
    (
      currentId: T["id"],
      currentKey: keyof T,
      direction: "up" | "down" | "left" | "right" | "next"
    ): { id: T["id"]; key: keyof T } | null => {
      const { rowIndex, colIndex } = findCellIndices(
        currentId,
        currentKey,
        data,
        columns
      );

      const nextCell = findNextEditableCell(
        rowIndex,
        colIndex,
        direction,
        cellMap,
        data,
        columns
      );

      if (!nextCell) {
        return null;
      }

      return {
        id: nextCell.rowData.id,
        key: nextCell.column.dataIndex,
      };
    },
    [data, columns, cellMap]
  );

  return {
    cellMap,
    navigate,
  };
}
