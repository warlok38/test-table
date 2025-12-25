import { useEffect, useRef } from "react";
import styles from "./EditableTable.module.css";
import type { EditableCellProps } from "./types";

export function EditableCell<T extends { id: string | number }>({
  row,
  column,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  colSpan = 1,
  rowSpan = 1,
  rowIndex,
  colIndex,
  onNavigate,
  onUpdateContext,
}: EditableCellProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const value = row[column.dataIndex];

  // Автофокус при начале редактирования
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Обработка нажатий на ячейку (не инпут)
  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing) {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          onStartEdit();
          break;
        case "Tab":
          e.preventDefault();
          onNavigate("next");
          break;
        case "ArrowUp":
          e.preventDefault();
          onNavigate("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          onNavigate("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          onNavigate("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          onNavigate("right");
          break;
      }
    }
  };

  // Обработка нажатий в инпуте
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        onCancel();
        break;
      case "Enter":
        e.preventDefault();
        onSave((e.target as HTMLInputElement).value);
        onNavigate("down");
        break;
      case "Tab":
        e.preventDefault();
        onSave((e.target as HTMLInputElement).value);
        onNavigate(e.shiftKey ? "left" : "right");
        break;
      case "ArrowUp":
        e.preventDefault();
        onSave((e.target as HTMLInputElement).value);
        onNavigate("up");
        break;
      case "ArrowDown":
        e.preventDefault();
        onSave((e.target as HTMLInputElement).value);
        onNavigate("down");
        break;
      case "ArrowLeft":
        if (e.target instanceof HTMLInputElement) {
          const cursorPos = e.target.selectionStart;
          if (cursorPos === 0) {
            e.preventDefault();
            onSave(e.target.value);
            onNavigate("left");
          }
        }
        break;
      case "ArrowRight":
        if (e.target instanceof HTMLInputElement) {
          const cursorPos = e.target.selectionStart;
          if (cursorPos === e.target.value.length) {
            e.preventDefault();
            onSave(e.target.value);
            onNavigate("right");
          }
        }
        break;
    }
  };

  const handleClick = () => {
    if (!isEditing && column.editable) {
      // Обновляем контекст навигации при клике
      if (onUpdateContext) {
        onUpdateContext(rowIndex, colIndex);
      }
      onStartEdit();
    }
  };

  if (colSpan === 0 || rowSpan === 0) {
    return null;
  }

  return (
    <td
      colSpan={colSpan > 1 ? colSpan : undefined}
      rowSpan={rowSpan > 1 ? rowSpan : undefined}
      onClick={handleClick}
      onKeyDown={handleCellKeyDown}
      tabIndex={column.editable ? 0 : -1}
      style={{ cursor: column.editable ? "pointer" : "default" }}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      data-row-id={row.id}
      data-col-key={String(column.dataIndex)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className={styles.input}
          defaultValue={String(value)}
          onBlur={(e) => onSave(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
      ) : column.render ? (
        column.render(value, row, rowIndex)
      ) : (
        <span>{String(value)}</span>
      )}
    </td>
  );
}
