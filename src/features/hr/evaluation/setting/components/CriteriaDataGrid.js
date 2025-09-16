'use client';

// [추가] Skeleton, useState, useEffect import
import { Box, Skeleton, Typography, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useEffect, useMemo, useState } from 'react'; // [수정]

export default function CriteriaDataGrid({
  criteriaList,
  detail,
  loading,
  onPreviewClick,
}) {
  const selectedIds = useMemo(
    () => new Set(detail.map((item) => item.criteriaMasterId)),
    [detail],
  );

  // [추가] 컴포넌트 마운트 상태 관리
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
        1. 평가기준
      </Typography>
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {/* [수정] mounted 상태에 따라 조건부 렌더링 */}
        {mounted ? (
          <DataGrid
            // ... 기존 DataGrid 옵션들은 그대로 유지 ...
            rows={criteriaList}
            getRowId={(row) => row.criteriaMasterId}
            columns={[
              {
                field: 'title',
                headerName: '평가기준명',
              },
              {
                field: 'preview',
                headerName: '',
                sortable: false,
                align: 'center',
                renderCell: (params) => (
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={(e) => onPreviewClick(e, params.row, 'criteria')}
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
              noRowsLabel: '표시할 평가기준이 없습니다.',
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
          // [추가] 마운트 되기 전까지 스켈레톤 UI 표시
          <Skeleton variant="rounded" height="100%" animation="wave" />
        )}
      </Box>
    </>
  );
}
