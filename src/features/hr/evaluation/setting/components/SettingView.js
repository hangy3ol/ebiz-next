'use client';

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Skeleton,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SettingView({ initialData }) {
  const router = useRouter();
  const { master, detail, criteriaList, adjustmentList } = initialData || {};

  const [mounted, setMounted] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (detail && detail.length > 0) {
      setSelectedRow(detail[0]);
    }
  }, [detail]);

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  // [추가] 선택된 행에 따라 동적으로 평가자 수와 Grid 너비를 계산
  const evaluatorCount = [
    selectedRow?.evaluatorName1,
    selectedRow?.evaluatorName2,
    selectedRow?.evaluatorName3,
  ].filter(Boolean).length;

  const gridXs = evaluatorCount > 0 ? 12 / evaluatorCount : 12;

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* 1. 페이지 헤더 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {master?.id ? '평가 설정 상세' : '평가 설정 등록'}
        </Typography>
        <Button variant="text" onClick={() => router.push('/hr/setting')}>
          목록
        </Button>
      </Stack>

      {/* 2. 본문 */}
      <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* 본문 헤더 */}
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

        {/* 3. 메인 컨텐츠 영역 */}
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
          {/* 첫 번째 열 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ flex: 1, p: 1 }}>
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
            </Paper>
            <Paper variant="outlined" sx={{ flex: 1, p: 1 }}>
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
            </Paper>
          </Stack>

          {/* 두 번째 열 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Paper variant="outlined" sx={{ flex: 1, p: 1 }}>
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
            </Paper>
            {/* [수정] 4. 평가자 선택 영역 UI 로직 전체 수정 */}
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                4. 평가자 선택
              </Typography>
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={1} textAlign="center">
                  {selectedRow?.evaluatorName1 && (
                    <Grid item xs={gridXs}>
                      <Typography variant="caption" color="text.secondary">
                        1차 평가자
                      </Typography>
                      <Typography fontWeight="bold">
                        {selectedRow.evaluatorName1}
                      </Typography>
                      <Typography variant="caption">
                        ({selectedRow.evaluatorWeight1 || 0}%)
                      </Typography>
                    </Grid>
                  )}
                  {selectedRow?.evaluatorName2 && (
                    <Grid item xs={gridXs}>
                      <Typography variant="caption" color="text.secondary">
                        2차 평가자
                      </Typography>
                      <Typography fontWeight="bold">
                        {selectedRow.evaluatorName2}
                      </Typography>
                      <Typography variant="caption">
                        ({selectedRow.evaluatorWeight2 || 0}%)
                      </Typography>
                    </Grid>
                  )}
                  {selectedRow?.evaluatorName3 && (
                    <Grid item xs={gridXs}>
                      <Typography variant="caption" color="text.secondary">
                        3차 평가자
                      </Typography>
                      <Typography fontWeight="bold">
                        {selectedRow.evaluatorName3}
                      </Typography>
                      <Typography variant="caption">
                        ({selectedRow.evaluatorWeight3 || 0}%)
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Stack>

          {/* 세 번째 열 */}
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
                  rows={detail || []}
                  getRowId={(row) => row.evaluateeId}
                  onRowClick={handleRowClick}
                  columns={[
                    {
                      field: 'evaluateeName',
                      headerName: '대상자명',
                    },
                    {
                      field: 'criteriaMasterTitle',
                      headerName: '평가기준',
                    },
                    {
                      field: 'adjustmentMasterTitle',
                      headerName: '감/가점 기준',
                    },
                    {
                      field: 'evaluatorName1',
                      headerName: '1차 평가자',
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight1 || '0'}%)`,
                    },
                    {
                      field: 'evaluatorName2',
                      headerName: '2차 평가자',
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight2 || '0'}%)`,
                    },
                    {
                      field: 'evaluatorName3',
                      headerName: '3차 평가자',
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
                  autosizeOnMount
                  autosizeOptions={{
                    includeHeaders: true,
                    expand: true,
                  }}
                  sx={{
                    '& .MuiDataGrid-row': {
                      cursor: 'pointer',
                    },
                  }}
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
