import styles from "./EditableTable.module.css";
import { EditableCell } from "./EditableCell";
import type { EditableTableProps } from "./types";
import type { JSX } from "react";
import { useEditableTable } from "./hooks/useEditableTable";

export function EditableTable<T extends { id: string | number }>({
  columns,
  data,
  onChange,
}: EditableTableProps<T>) {
  const {
    editing,
    cellMap,
    startEdit,
    stopEdit,
    handleSave,
    handleNavigateAndEdit,
    updateContextFromCell,
  } = useEditableTable(data, columns, onChange);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => {
            const headerCellProps = col.onCell?.({} as T, -1) || {};
            return (
              <th
                key={col.key}
                colSpan={headerCellProps.colSpan || col.colSpan}
                rowSpan={headerCellProps.rowSpan || col.rowSpan}
              >
                {col.title}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => {
          const cells: JSX.Element[] = [];

          for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            const key = `${rowIndex},${colIndex}`;
            const cellInfo = cellMap[key];

            // Рендерим только если это основная ячейка в карте
            if (
              cellInfo &&
              cellInfo.row === rowIndex &&
              cellInfo.col === colIndex
            ) {
              cells.push(
                <EditableCell
                  key={`${row.id}-${cellInfo.column.key}`}
                  row={row}
                  column={cellInfo.column}
                  isEditing={
                    editing?.id === row.id &&
                    editing.key === cellInfo.column.dataIndex
                  }
                  onStartEdit={() =>
                    startEdit(row.id, cellInfo.column.dataIndex)
                  }
                  onCancel={stopEdit}
                  onSave={(val) =>
                    handleSave(row.id, cellInfo.column.dataIndex, val)
                  }
                  colSpan={cellInfo.colSpan}
                  rowSpan={cellInfo.rowSpan}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onNavigate={(dir) =>
                    handleNavigateAndEdit(
                      row.id,
                      cellInfo.column.dataIndex,
                      dir
                    )
                  }
                  onUpdateContext={updateContextFromCell}
                />
              );
            }
          }

          return <tr key={row.id}>{cells}</tr>;
        })}
      </tbody>
    </table>
  );
}
