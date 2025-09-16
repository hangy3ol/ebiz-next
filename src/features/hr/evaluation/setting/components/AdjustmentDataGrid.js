'use client';

import { Box, Button, Skeleton, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useEffect, useState } from 'react';

// [수정] 컴포넌트 이름 및 props 변경 (criteria -> adjustment)
export default function AdjustmentDataGrid({
  adjustmentList,
  selectedId,
  loading,
  onPreviewClick,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* [수정] 제목 변경 */}
      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
        2. 감/가점 기준
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {mounted ? (
          <DataGrid
            // [수정] 표시할 데이터 변경
            rows={adjustmentList}
            // [수정] 행의 고유 ID 키 변경
            getRowId={(row) => row.adjustmentMasterId}
            columns={[
              {
                field: 'title',
                // [수정] 컬럼 제목 변경
                headerName: '감/가점명',
                flex: 1,
              },
              {
                field: 'preview',
                headerName: '',
                width: 80,
                sortable: false,
                align: 'center',
                renderCell: (params) => (
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    // [수정] 미리보기 타입 변경
                    onClick={(e) => onPreviewClick(e, params.row, 'adjustment')}
                  >
                    미리보기
                  </Button>
                ),
              },
            ]}
            loading={loading}
            disableColumnMenu
            density="compact"
            autosizeOnMount
            autosizeOptions={{
              includeHeaders: true,
              expand: true,
            }}
            localeText={{
              ...koKR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: '등록된 데이터가 없습니다.',
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 100 } },
            }}
            pageSizeOptions={[100]}
            sx={{
              // 행 위에 마우스를 올렸을 때 커서를 포인터로 변경
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        ) : (
          <Skeleton variant="rounded" height="100%" animation="wave" />
        )}
      </Box>
    </>
  );
}
