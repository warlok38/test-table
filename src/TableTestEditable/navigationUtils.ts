/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CellInfo, CellMap } from "./utils";

export interface NavigationContext {
  rowOffset: number; // 0..rowSpan-1 (позиция внутри вертикального span)
  colOffset: number; // 0..colSpan-1 (позиция внутри горизонтального span)
  lastDirection: "up" | "down" | "left" | "right" | null;
}

export interface NavigationResult {
  cell: CellInfo<any>;
  context: NavigationContext;
}

/**
 * Находит ячейку по координатам с учетом объединений
 */
function findCellAtPosition(
  row: number,
  col: number,
  cellMap: CellMap<any>
): CellInfo<any> | null {
  // Прямой поиск
  const key = `${row},${col}`;
  const directCell = cellMap[key];
  if (directCell && directCell.row === row && directCell.col === col) {
    return directCell;
  }

  // Поиск ячейки, которая покрывает эти координаты своим span
  for (const key in cellMap) {
    const cell = cellMap[key];
    const rowEnd = cell.row + cell.rowSpan;
    const colEnd = cell.col + cell.colSpan;

    if (row >= cell.row && row < rowEnd && col >= cell.col && col < colEnd) {
      return cell;
    }
  }

  return null;
}

/**
 * Рассчитывает смещение внутри span-ячейки
 */
// function calculateOffset(
//   row: number,
//   col: number,
//   cell: CellInfo<any>
// ): { rowOffset: number; colOffset: number } {
//   return {
//     rowOffset: row - cell.row,
//     colOffset: col - cell.col,
//   };
// }

/**
 * Ищет следующую ячейку для вертикального движения
 */
function findVerticalCell(
  startRow: number,
  startCol: number,
  direction: "up" | "down",
  cellMap: CellMap<any>,
  data: any[],
  context: NavigationContext
): NavigationResult | null {
  const currentCell = findCellAtPosition(startRow, startCol, cellMap);
  if (!currentCell) return null;

  const step = direction === "down" ? 1 : -1;
  const { colOffset } = context;

  // Ищем ячейку, которая может принять наше смещение
  for (
    let row = startRow + step;
    direction === "down" ? row < data.length : row >= 0;
    row += step
  ) {
    // Пробуем сначала ту же колонку
    const targetCol = startCol;
    const targetCell = findCellAtPosition(row, targetCol, cellMap);

    if (targetCell) {
      // Проверяем, можем ли мы занять ту же относительную позицию
      if (colOffset < targetCell.colSpan) {
        const newContext = {
          ...context,
          lastDirection: direction,
          colOffset: Math.min(colOffset, targetCell.colSpan - 1),
        };
        return { cell: targetCell, context: newContext };
      }
    }

    // Если не получилось, ищем ближайшую подходящую ячейку в строке
    for (let colOffsetSearch = 0; colOffsetSearch < 10; colOffsetSearch++) {
      // Пробуем колонки в обе стороны от целевой
      const offsets = [colOffsetSearch, -colOffsetSearch];

      for (const offset of offsets) {
        const searchCol = startCol + offset;
        if (searchCol >= 0 && searchCol < 100) {
          // разумный лимит
          const searchCell = findCellAtPosition(row, searchCol, cellMap);
          if (searchCell) {
            // Вычисляем новое смещение
            const newColOffset = Math.max(
              0,
              Math.min(colOffset, searchCell.colSpan - 1)
            );
            const newContext = {
              ...context,
              lastDirection: direction,
              colOffset: newColOffset,
            };
            return { cell: searchCell, context: newContext };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Ищет следующую ячейку для горизонтального движения
 */
function findHorizontalCell(
  startRow: number,
  startCol: number,
  direction: "left" | "right",
  cellMap: CellMap<any>,
  columns: any[],
  context: NavigationContext
): NavigationResult | null {
  const currentCell = findCellAtPosition(startRow, startCol, cellMap);
  if (!currentCell) return null;

  const step = direction === "right" ? 1 : -1;
  const { rowOffset } = context;

  // Ищем ячейку, которая может принять наше смещение
  for (
    let col = startCol + step;
    direction === "right" ? col < columns.length : col >= 0;
    col += step
  ) {
    // Пробуем сначала ту же строку
    const targetRow = startRow;
    const targetCell = findCellAtPosition(targetRow, col, cellMap);

    if (targetCell) {
      // Проверяем, можем ли мы занять ту же относительную позицию
      if (rowOffset < targetCell.rowSpan) {
        const newContext = {
          ...context,
          lastDirection: direction,
          rowOffset: Math.min(rowOffset, targetCell.rowSpan - 1),
        };
        return { cell: targetCell, context: newContext };
      }
    }

    // Если не получилось, ищем ближайшую подходящую ячейку в колонке
    for (let rowOffsetSearch = 0; rowOffsetSearch < 10; rowOffsetSearch++) {
      const offsets = [rowOffsetSearch, -rowOffsetSearch];

      for (const offset of offsets) {
        const searchRow = startRow + offset;
        if (searchRow >= 0 && searchRow < 100) {
          const searchCell = findCellAtPosition(searchRow, col, cellMap);
          if (searchCell) {
            const newRowOffset = Math.max(
              0,
              Math.min(rowOffset, searchCell.rowSpan - 1)
            );
            const newContext = {
              ...context,
              lastDirection: direction,
              rowOffset: newRowOffset,
            };
            return { cell: searchCell, context: newContext };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Основная функция навигации
 */
export function navigateToCell(
  startRow: number,
  startCol: number,
  direction: "up" | "down" | "left" | "right" | "next",
  cellMap: CellMap<any>,
  data: any[],
  columns: any[],
  context: NavigationContext
): NavigationResult | null {
  console.log(
    `[NAV] Start: ${startRow},${startCol} ${direction} ctx:`,
    context
  );

  if (direction === "up" || direction === "down") {
    return findVerticalCell(
      startRow,
      startCol,
      direction,
      cellMap,
      data,
      context
    );
  }

  if (direction === "left" || direction === "right") {
    return findHorizontalCell(
      startRow,
      startCol,
      direction,
      cellMap,
      columns,
      context
    );
  }

  // Tab navigation (next)
  return (
    findVerticalCell(startRow, startCol, "down", cellMap, data, context) ||
    findHorizontalCell(startRow, startCol, "right", cellMap, columns, context)
  );
}
