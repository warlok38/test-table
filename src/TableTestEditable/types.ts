export type Directions = "up" | "down" | "left" | "right" | "next";

export type ColumnType<T> = {
  key: string;
  title: string;
  dataIndex: keyof T;
  editable?: boolean;
  colSpan?: number;
  rowSpan?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, record: T, index: number) => React.ReactNode;
  onCell?: (
    record: T,
    rowIndex: number
  ) => {
    colSpan?: number;
    rowSpan?: number;
  };
};

export type EditableTableProps<T> = {
  columns: ColumnType<T>[];
  data: T[];
  onChange: (newData: T[]) => void;
};

export type EditableCellProps<T> = {
  row: T;
  column: ColumnType<T>;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  colSpan?: number;
  rowSpan?: number;
  rowIndex: number;
  colIndex: number;
  onNavigate: (direction: Directions) => void;
  onUpdateContext?: (rowIndex: number, colIndex: number) => void;
};
