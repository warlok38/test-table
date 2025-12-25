import { useState, useCallback } from "react";
import type { ColumnType } from "../types";
import { useSmartNavigation } from "./useSmartNavigation";

export function useEditableTable<T extends { id: string | number }>(
  data: T[],
  columns: ColumnType<T>[],
  onChange: (newData: T[]) => void
) {
  const [editing, setEditing] = useState<{ id: T["id"]; key: keyof T } | null>(
    null
  );
  const { cellMap, navigate, updateContextFromCell } = useSmartNavigation(
    data,
    columns
  );

  const startEdit = useCallback((id: T["id"], key: keyof T) => {
    setEditing({ id, key });
  }, []);

  const stopEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const handleSave = useCallback(
    (id: T["id"], key: keyof T, value: string | number) => {
      const newData = data.map((row) =>
        row.id === id ? { ...row, [key]: value } : row
      );
      onChange(newData);
      stopEdit();
    },
    [data, onChange, stopEdit]
  );

  const handleNavigateAndEdit = useCallback(
    (
      currentId: T["id"],
      currentKey: keyof T,
      direction: "up" | "down" | "left" | "right" | "next"
    ) => {
      if (editing) {
        const input = document.activeElement as HTMLInputElement;
        if (input && input.tagName === "INPUT") {
          handleSave(editing.id, editing.key, input.value);
        }
      }

      const result = navigate(currentId, currentKey, direction);
      if (result) {
        startEdit(result.id, result.key);
      }
    },
    [editing, handleSave, navigate, startEdit]
  );

  return {
    editing,
    cellMap,
    startEdit,
    stopEdit,
    handleSave,
    handleNavigateAndEdit,
    updateContextFromCell,
  };
}
