'use client';

import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';

export default function SettingDetailPanel({
  isMounted,
  list,
  selectionModel,
  onExclude,
  onRowClick,
  onSelectionChange,
}) {
  return (
    <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2" fontWeight="medium">
          5. 평가설정 목록
        </Typography>

        <Button
          variant="outlined"
          size="small"
          color="error"
          disabled={selectionModel.ids.size === 0}
          onClick={onExclude}
        >
          목록 제외
        </Button>
      </Stack>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {isMounted ? (
          <DataGrid
            rows={list}
            getRowId={(row) => row.evaluateeId}
            columns={[
              {
                field: 'evaluateeName',
                headerName: '대상자명',
                flex: 0.8,
              },
              {
                field: 'criteriaMasterTitle',
                headerName: '평가기준',
                flex: 1.5,
              },
              {
                field: 'adjustmentMasterTitle',
                headerName: '감/가점 기준',
                flex: 1,
              },
              {
                field: 'evaluatorName1',
                headerName: '1차 평가자',
                flex: 1,
                valueGetter: (value, row) =>
                  `${value || '-'} (${row.evaluatorWeight1 || '0'}%)`,
              },
              {
                field: 'evaluatorName2',
                headerName: '2차 평가자',
                flex: 1,
                valueGetter: (value, row) =>
                  `${value || '-'} (${row.evaluatorWeight2 || '0'}%)`,
              },
              {
                field: 'evaluatorName3',
                headerName: '3차 평가자',
                flex: 1,
                valueGetter: (value, row) =>
                  `${value || '-'} (${row.evaluatorWeight3 || '0'}%)`,
              },
            ]}
            density="compact"
            localeText={{
              ...koKR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: '등록된 데이터가 없습니다.',
            }}
            disableColumnMenu
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 100 },
              },
            }}
            pageSizeOptions={[100]}
            onRowClick={onRowClick}
            checkboxSelection
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionChange}
            disableRowSelectionOnClick
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
