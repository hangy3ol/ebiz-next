'use client';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// MUI DataGrid에서 apiRef를 이용해 보이는 데이터만 Excel로 내보냅니다.
export function exportGridToExcel(apiRef, fileName = 'export.xlsx') {
  if (!apiRef?.current) return;

  // 1. 체크박스/불리언 제외한 표시 중인 컬럼 추출
  const visibleColumns = apiRef.current
    .getVisibleColumns()
    .filter((col) => col.type !== 'boolean' && col.field !== '__check__');

  // 2. 보이는 모든 행 추출
  const rows = Array.from(apiRef.current.getRowModels().values());

  // 3. 각 행을 엑셀용 객체로 가공
  const exportData = rows.map((row) => {
    const rowData = {};

    visibleColumns.forEach((col) => {
      const isCodeField = col.field.endsWith('Code');
      if (isCodeField) {
        const labelField = col.field.replace(/Code$/, 'Name');
        rowData[col.headerName] = row[labelField] ?? row[col.field];
      } else {
        rowData[col.headerName] = row[col.field];
      }
    });

    return rowData;
  });

  // 4. SheetJS로 파일 생성 및 다운로드
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
}
