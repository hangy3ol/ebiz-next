'use client';

import { Box, Stack, TextField, Typography, Skeleton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';

export default function CandidatePanel({
  isMounted,
  enabled,
  list,
  keyword,
  onKeywordChange,
  rowSelectionModel,
  onRowSelectionModelChange,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight="medium">
          3. 대상자 선택
        </Typography>
        <TextField
          size="small"
          variant="outlined"
          placeholder="대상자 검색 (성명, 부서, 직위)"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          sx={{ minWidth: 250 }}
        />
      </Stack>

      <Box sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
        {isMounted ? (
          <DataGrid
            rows={enabled ? list : []}
            columns={[
              { field: 'userName', headerName: '성명', flex: 1 },
              {
                field: 'departmentName',
                headerName: '부서',
                flex: 1.5,
              },
              { field: 'positionName', headerName: '직위', flex: 1 },
              {
                field: 'jobTitleName',
                headerName: '직책',
                flex: 1,
              },
            ]}
            getRowId={(row) => row.userId}
            density="compact"
            localeText={{
              ...koKR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: enabled
                ? '해당 조건의 대상자가 없습니다.'
                : '감/가점 기준을 먼저 선택해주세요.',
            }}
            checkboxSelection
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={onRowSelectionModelChange}
            pageSizeOptions={[100]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 100 },
              },
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        ) : (
          <Skeleton variant="rounded" height="100%" animation="wave" />
        )}
      </Box>
    </Box>
  );
}
