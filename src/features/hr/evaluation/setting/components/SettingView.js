'use client';

import { Box, Button, Paper, Stack, Typography, Skeleton } from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SettingView({ initialData }) {
  const apiRef = useGridApiRef();
  const router = useRouter();
  const { master, detail, criteriaList, adjustmentList } = initialData || {};

  const [mounted, setMounted] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setMounted(true);

    if (detail && detail.length > 0 && apiRef.current) {
      const firstRow = detail[0];
      const firstRowId = firstRow.evaluateeId;

      try {
        apiRef.current.selectRow(firstRowId, true, true);
        setSelectedRow(firstRow);
      } catch (error) {
        console.error('Failed to select row:', error);
      }
    }
  }, [detail, mounted, apiRef]); // apiRef를 의존성 배열에 추가

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* ... 이하 나머지 코드는 동일 ... */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {master?.id ? '평가 설정 상세' : '평가 설정 등록'}
        </Typography>
        <Button variant="text" onClick={() => router.push('/hr/setting')}>
          목록
        </Button>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold" noWrap>
            {master?.title || '제목 없음'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained">수정</Button>
            <Button variant="outlined" color="error">
              삭제
            </Button>
          </Box>
        </Stack>
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            p: 2,
            gap: 2,
            overflow: 'auto',
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box variant="outlined" sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                1. 평가기준 선택
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">
                  (평가기준 그리드)
                </Typography>
              </Box>
            </Box>
            <Box variant="outlined" sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                2. 감/가점 기준 선택
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">
                  (감/가점 기준 그리드)
                </Typography>
              </Box>
            </Box>
          </Stack>
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                3. 대상자 선택
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">(대상자 그리드)</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                4. 평가자 선택
              </Typography>
              <Box>
                <Stack direction="row" spacing={1}>
                  {selectedRow?.evaluatorName1 && (
                    <Stack sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        1차 평가자
                      </Typography>
                      <Typography fontWeight="bold">
                        {selectedRow.evaluatorName1}
                      </Typography>
                      <Typography variant="caption">
                        ({selectedRow.evaluatorWeight1 || 0}%)
                      </Typography>
                    </Stack>
                  )}
                  {selectedRow?.evaluatorName2 && (
                    <Stack sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        2차 평가자
                      </Typography>
                      <Typography fontWeight="bold">
                        {selectedRow.evaluatorName2}
                      </Typography>
                      <Typography variant="caption">
                        ({selectedRow.evaluatorWeight2 || 0}%)
                      </Typography>
                    </Stack>
                  )}
                  {selectedRow?.evaluatorName3 && (
                    <Stack sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        3차 평가자
                      </Typography>
                      <Typography fontWeight="bold">
                        {selectedRow.evaluatorName3}
                      </Typography>
                      <Typography variant="caption">
                        ({selectedRow.evaluatorWeight3 || 0}%)
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Box>
          </Stack>
          <Box
            variant="outlined"
            sx={{ flex: 2, p: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
              5. 평가설정 목록
            </Typography>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {mounted ? (
                <DataGrid
                  apiRef={apiRef}
                  rows={detail || []}
                  getRowId={(row) => row.evaluateeId}
                  onRowClick={handleRowClick}
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
                    pagination: { paginationModel: { page: 0, pageSize: 100 } },
                  }}
                  pageSizeOptions={[100]}
                  sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
                />
              ) : (
                <Skeleton variant="rounded" height="100%" animation="wave" />
              )}
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}
