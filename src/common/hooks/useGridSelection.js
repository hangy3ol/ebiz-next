// [신규] 파일 신규 생성
'use client';

import { useState } from 'react';

/**
 * MUI X DataGrid의 행 선택 로직을 관리하는 커스텀 훅.
 * '전체 선택' 시 발생하는 'exclude' 모델을 'include' 모델로 변환하여
 * 항상 명시적인 ID 목록을 제공합니다.
 * @param {{ allRows: Array<Object>, getRowId: Function }} props
 * @returns {{ rowSelectionModel: Object, onRowSelectionModelChange: Function }}
 */
export const useGridSelection = ({ allRows = [], getRowId }) => {
  // 행 선택 모델 state
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: 'include',
    ids: new Set(),
  });

  // 행 선택 모델 변경 핸들러
  const onRowSelectionModelChange = (newSelectionModel) => {
    // '전체 선택'으로 exclude 모델이 들어온 경우
    if (newSelectionModel.type === 'exclude') {
      // 현재 그리드에 있는 모든 행의 ID를 추출
      const allRowIds = new Set(allRows.map((row) => getRowId(row)));
      // include 모델로 강제 변환하여 state 업데이트
      setRowSelectionModel({
        type: 'include',
        ids: allRowIds,
      });
    } else {
      // 일반적인 개별 선택/해제는 그대로 반영
      setRowSelectionModel(newSelectionModel);
    }
  };

  return {
    rowSelectionModel,
    onRowSelectionModelChange,
  };
};
