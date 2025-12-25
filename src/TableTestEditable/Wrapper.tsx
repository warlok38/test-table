import { useState } from "react";
import { EditableTable } from "./EditableTable";
import type { ColumnType } from "./types";

interface GridData {
  id: number;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  col9: string;
}

export function DemoTable() {
  const [data, setData] = useState<GridData[]>([
    // Строка 1: [----]-----
    {
      id: 1,
      col1: "Row1-Col1",
      col2: "Row1-Col2",
      col3: "Row1-Col3",
      col4: "Row1-Col4",
      col5: "Row1-Col5",
      col6: "Row1-Col6",
      col7: "Row1-Col7",
      col8: "Row1-Col8",
      col9: "Row1-Col9",
    },
    // Строка 2: [----]-----
    {
      id: 2,
      col1: "Row2-Col1",
      col2: "Row2-Col2",
      col3: "Row2-Col3",
      col4: "Row2-Col4",
      col5: "Row2-Col5",
      col6: "Row2-Col6",
      col7: "Row2-Col7",
      col8: "Row2-Col8",
      col9: "Row2-Col9",
    },
    // Строка 3: =[--]=-----
    {
      id: 3,
      col1: "Row3-Col1",
      col2: "Row3-Col2",
      col3: "Row3-Col3",
      col4: "Row3-Col4",
      col5: "Row3-Col5",
      col6: "Row3-Col6",
      col7: "Row3-Col7",
      col8: "Row3-Col8",
      col9: "Row3-Col9",
    },
    // Строка 4: =[--]=-----
    {
      id: 4,
      col1: "Row4-col1",
      col2: "Row4-col2",
      col3: "Row4-col3",
      col4: "Row4-col4",
      col5: "Row4-Col5",
      col6: "Row4-Col6",
      col7: "Row4-Col7",
      col8: "Row4-Col8",
      col9: "Row4-Col9",
    },
    // Строка 5: [---------]
    {
      id: 5,
      col1: "Row5-Col1",
      col2: "Row5-col2",
      col3: "Row5-col3",
      col4: "Row5-col4",
      col5: "Row5-col5",
      col6: "Row5-col6",
      col7: "Row5-col7",
      col8: "Row5-col8",
      col9: "Row5-col9",
    },
    // Строка 6: ---------
    {
      id: 6,
      col1: "Row6-Col1",
      col2: "Row6-Col2",
      col3: "Row6-Col3",
      col4: "Row6-Col4",
      col5: "Row6-Col5",
      col6: "Row6-Col6",
      col7: "Row6-Col7",
      col8: "Row6-Col8",
      col9: "Row6-Col9",
    },
    // Строка 7: [==]==-----
    {
      id: 7,
      col1: "Row7-Col1",
      col2: "Row7-Col2",
      col3: "Row7-Col3",
      col4: "Row7-Col4",
      col5: "Row7-Col5",
      col6: "Row7-Col6",
      col7: "Row7-Col7",
      col8: "Row7-Col8",
      col9: "Row7-Col9",
    },
    // Строка 8: [==]==-----
    {
      id: 8,
      col1: "Row8-col1",
      col2: "Row8-col2",
      col3: "Row8-Col3",
      col4: "Row8-Col4",
      col5: "Row8-Col5",
      col6: "Row8-Col6",
      col7: "Row8-Col7",
      col8: "Row8-Col8",
      col9: "Row8-Col9",
    },
  ]);

  const columns: ColumnType<GridData>[] = [
    {
      key: "col1",
      title: "Col1",
      dataIndex: "col1",
      editable: true,
      onCell: (record, rowIndex) => {
        // [----] для строк 1-2 (colspan=4)
        if (rowIndex < 2) {
          if (rowIndex === 0) return { colSpan: 4 };
          return { colSpan: 0 };
        }
        // =[--] для строк 3-4 (rowspan=2)
        if (rowIndex === 2) return { rowSpan: 2 };
        if (rowIndex === 3) return { rowSpan: 0 };
        // [---------] для строки 5 (colspan=9)
        if (rowIndex === 4) return { colSpan: 9 };
        // --------- для строки 6 (обычная)
        // [==]== для строк 7-8 (col1+col2 rowspan=2)
        if (rowIndex === 6) return { rowSpan: 2 };
        if (rowIndex === 7) return { rowSpan: 0 };
        return {};
      },
    },
    {
      key: "col2",
      title: "Col2",
      dataIndex: "col2",
      editable: true,
      onCell: (record, rowIndex) => {
        // [----] часть col1 colspan=4
        if (rowIndex < 2) return { colSpan: 0 };
        // =[--] часть col1 rowspan=2
        if (rowIndex === 2) return { rowSpan: 2 };
        if (rowIndex === 3) return { rowSpan: 0 };
        // [---------] часть col1 colspan=9
        if (rowIndex === 4) return { colSpan: 0 };
        // --------- обычная
        // [==]== часть col1+col2 rowspan=2
        if (rowIndex === 6) return { rowSpan: 2 };
        if (rowIndex === 7) return { rowSpan: 0 };
        return {};
      },
    },
    {
      key: "col3",
      title: "Col3",
      dataIndex: "col3",
      editable: true,
      onCell: (record, rowIndex) => {
        // [----] часть col1 colspan=4
        if (rowIndex < 2) return { colSpan: 0 };
        // =[--] = часть col2? нет, это колонка col3
        // в строке 3: col3+col4 colSpan=2
        if (rowIndex === 2) return { colSpan: 2 };
        if (rowIndex === 3) return { colSpan: 0 };
        // [---------] часть col1 colspan=9
        if (rowIndex === 4) return { colSpan: 0 };
        // --------- обычная
        // [==]== часть col3+col4 colSpan=2
        if (rowIndex === 6) return { colSpan: 2 };
        if (rowIndex === 7) return { colSpan: 0 };
        return {};
      },
    },
    {
      key: "col4",
      title: "Col4",
      dataIndex: "col4",
      editable: true,
      onCell: (record, rowIndex) => {
        // [----] часть col1 colspan=4
        if (rowIndex < 2) return { colSpan: 0 };
        // =[--] = часть col3+col4 colSpan=2
        if (rowIndex === 2) return { colSpan: 0 };
        if (rowIndex === 3) return { colSpan: 0 };
        // [---------] часть col1 colspan=9
        if (rowIndex === 4) return { colSpan: 0 };
        // --------- обычная
        // [==]== часть col3+col4 colSpan=2
        if (rowIndex === 6) return { colSpan: 0 };
        if (rowIndex === 7) return { colSpan: 0 };
        return {};
      },
    },
    {
      key: "col5",
      title: "Col5",
      dataIndex: "col5",
      editable: true,
      onCell: (record, rowIndex) => {
        // [----]----- обычная
        // =[--]=----- обычная
        // [---------] часть col1 colspan=9
        if (rowIndex === 4) return { colSpan: 0 };
        // --------- обычная
        // [==]==----- обычная
        return {};
      },
    },
    {
      key: "col6",
      title: "Col6",
      dataIndex: "col6",
      editable: true,
      onCell: (record, rowIndex) => {
        if (rowIndex === 4) return { colSpan: 0 }; // часть [---------]
        return {};
      },
    },
    {
      key: "col7",
      title: "Col7",
      dataIndex: "col7",
      editable: true,
      onCell: (record, rowIndex) => {
        if (rowIndex === 4) return { colSpan: 0 }; // часть [---------]
        return {};
      },
    },
    {
      key: "col8",
      title: "Col8",
      dataIndex: "col8",
      editable: true,
      onCell: (record, rowIndex) => {
        if (rowIndex === 4) return { colSpan: 0 }; // часть [---------]
        return {};
      },
    },
    {
      key: "col9",
      title: "Col9",
      dataIndex: "col9",
      editable: true,
      onCell: (record, rowIndex) => {
        if (rowIndex === 4) return { colSpan: 0 }; // часть [---------]
        return {};
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>ASCII Grid Pattern Table</h2>
      <p>
        Pattern: [----]----- [----]----- =[--]=----- =[--]=----- [---------]
        --------- [==]==----- [==]==-----
      </p>
      <EditableTable columns={columns} data={data} onChange={setData} />
    </div>
  );
}
