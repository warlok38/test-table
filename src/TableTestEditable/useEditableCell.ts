import { useState, useCallback } from "react";

export function useEditableCell<T = string>(
  initialValue: T,
  onSave?: (value: T) => void
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setValue(initialValue);
  }, [initialValue]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    onSave?.(value);
  }, [value, onSave]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  return {
    value,
    isEditing,
    startEdit,
    cancelEdit,
    commitEdit,
    updateValue,
  };
}
