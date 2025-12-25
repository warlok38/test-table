import type { ColumnType, Directions } from "./types";

export interface CellInfo<T> {
  row: number;
  col: number;
  colSpan: number;
  rowSpan: number;
  column: ColumnType<T>;
  rowData: T;
}

export interface CellMap<T> {
  [key: string]: CellInfo<T>;
}

/**
 * Создает карту видимых ячеек таблицы
 */
export function buildCellMap<T extends { id: string | number }>(
  data: T[],
  columns: ColumnType<T>[]
): CellMap<T> {
  const map: CellMap<T> = {};
  const occupied = new Set<string>();

  // Проходим по всем данным и колонкам
  data.forEach((rowData, rowIdx) => {
    let colIdx = 0;

    while (colIdx < columns.length) {
      const key = `${rowIdx},${colIdx}`;

      // Если ячейка уже занята (из-за rowSpan), пропускаем
      if (occupied.has(key)) {
        colIdx++;
        continue;
      }

      const column = columns[colIdx];
      const cellProps = column.onCell?.(rowData, rowIdx) || {};
      const colSpan = cellProps.colSpan || column.colSpan || 1;
      const rowSpan = cellProps.rowSpan || column.rowSpan || 1;

      // Если ячейка видима
      if (colSpan > 0 && rowSpan > 0) {
        map[key] = {
          row: rowIdx,
          col: colIdx,
          colSpan,
          rowSpan,
          column,
          rowData,
        };

        // Помечаем ячейки, занятые rowSpan
        for (let r = 0; r < rowSpan; r++) {
          for (let c = 0; c < colSpan; c++) {
            if (r === 0 && c === 0) continue; // основная ячейка
            occupied.add(`${rowIdx + r},${colIdx + c}`);
          }
        }
      }

      // Пропускаем колонки, занятые colSpan
      colIdx += Math.max(colSpan, 1);
    }
  });

  return map;
}

/**
 * Находит индексы ячейки по id и ключу
 */
export function findCellIndices<T extends { id: string | number }>(
  id: T["id"],
  key: keyof T,
  data: T[],
  columns: ColumnType<T>[]
): { rowIndex: number; colIndex: number } {
  const rowIndex = data.findIndex((row) => row.id === id);
  const colIndex = columns.findIndex((col) => col.dataIndex === key);
  return { rowIndex, colIndex };
}

/**
 * Ищет следующую ячейку для навигации
 */
export function findNextCell<T extends { id: string | number }>(
  currentRow: number,
  currentCol: number,
  direction: Directions,
  cellMap: CellMap<T>,
  data: T[],
  columns: ColumnType<T>[]
): CellInfo<T> | null {
  const currentKey = `${currentRow},${currentCol}`;
  const currentCell = cellMap[currentKey];

  if (!currentCell) {
    return null;
  }

  const { colSpan, rowSpan } = currentCell;
  let targetRow = currentRow;
  let targetCol = currentCol;

  // Рассчитываем целевую позицию С УЧЕТОМ span текущей ячейки
  switch (direction) {
    case "up":
      // Перемещаемся на rowSpan ячеек вверх
      targetRow = Math.max(0, currentRow - rowSpan);
      // Ищем первую видимую ячейку в этой строке с таким же col
      for (let r = targetRow; r >= 0; r--) {
        const key = `${r},${currentCol}`;
        if (cellMap[key] && cellMap[key].row === r) {
          return cellMap[key];
        }
      }
      break;

    case "down":
      // Перемещаемся на rowSpan ячеек вниз
      targetRow = Math.min(data.length - 1, currentRow + rowSpan);
      // Ищем первую видимую ячейку в этой строке с таким же col
      for (let r = targetRow; r < data.length; r++) {
        const key = `${r},${currentCol}`;
        if (cellMap[key] && cellMap[key].row === r) {
          return cellMap[key];
        }
      }
      break;

    case "left":
      // Перемещаемся на colSpan ячеек влево
      targetCol = Math.max(0, currentCol - colSpan);
      // Ищем первую видимую ячейку в этом столбце с таким же row
      for (let c = targetCol; c >= 0; c--) {
        const key = `${currentRow},${c}`;
        if (cellMap[key] && cellMap[key].col === c) {
          return cellMap[key];
        }
      }
      break;

    case "right":
      // Перемещаемся на colSpan ячеек вправо
      targetCol = Math.min(columns.length - 1, currentCol + colSpan);
      // Ищем первую видимую ячейку в этом столбце с таким же row
      for (let c = targetCol; c < columns.length; c++) {
        const key = `${currentRow},${c}`;
        if (cellMap[key] && cellMap[key].col === c) {
          return cellMap[key];
        }
      }
      break;

    case "next":
      // Как Tab: сначала вправо, потом вниз
      targetCol = currentCol + colSpan;
      if (targetCol >= columns.length) {
        targetCol = 0;
        targetRow = Math.min(data.length - 1, currentRow + 1);
      }

      // Ищем видимую ячейку
      for (let r = targetRow; r < data.length; r++) {
        for (let c = targetCol; c < columns.length; c++) {
          const key = `${r},${c}`;
          if (
            cellMap[key] &&
            cellMap[key].row === r &&
            cellMap[key].col === c
          ) {
            return cellMap[key];
          }
        }
        targetCol = 0; // Для следующих строк начинаем с первой колонки
      }
      break;
  }

  return null;
}

/**
 * Ищет следующую редактируемую ячейку
 */
export function findNextEditableCell<T extends { id: string | number }>(
  startRow: number,
  startCol: number,
  direction: "up" | "down" | "left" | "right" | "next",
  cellMap: CellMap<T>,
  data: T[],
  columns: ColumnType<T>[]
): CellInfo<T> | null {
  let currentCell = findNextCell(
    startRow,
    startCol,
    direction,
    cellMap,
    data,
    columns
  );
  let attempts = 0;

  while (attempts < 50 && currentCell) {
    if (currentCell.column.editable) {
      return currentCell;
    }

    attempts++;
    currentCell = findNextCell(
      currentCell.row,
      currentCell.col,
      direction,
      cellMap,
      data,
      columns
    );
  }

  return null;
}
