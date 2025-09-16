'use client';

// [수정] useMemo 훅 제거
import { Box, Button, Paper, Stack, Typography, Skeleton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SettingView({ initialData }) {
  const router = useRouter();
  // [수정] employeeList는 더 이상 사용하지 않음
  const { master, detail, criteriaList, adjustmentList } = initialData || {};

  // [수정] rows 상태와 로직 제거
  const [mounted, setMounted] = useState(false);

  // [삭제] employeeMap 및 관련 useEffect 로직 전체 삭제

  useEffect(() => {
    setMounted(true);
  }, []);

  // [삭제] columns 상수 정의 삭제

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
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                4. 평가자 선택
              </Typography>
              <Box sx={{ pt: 1, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  (평가자 선택 영역)
                </Typography>
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
                  columns={[
                    {
                      field: 'evaluateeName',
                      headerName: '대상자명',
                      width: 75,
                    },
                    {
                      field: 'criteriaMasterTitle',
                      headerName: '평가기준',
                      flex: 1,
                    },
                    {
                      field: 'adjustmentMasterTitle',
                      headerName: '감/가점 기준',
                      width: 140,
                    },
                    {
                      field: 'evaluatorName1',
                      headerName: '1차 평가자',
                      width: 100,
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight1 || '0'}%)`,
                    },
                    {
                      field: 'evaluatorName2',
                      headerName: '2차 평가자',
                      width: 100,
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight2 || '0'}%)`,
                    },
                    {
                      field: 'evaluatorName3',
                      headerName: '3차 평가자',
                      width: 100,
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight3 || '0'}%)`,
                    },
                  ]}
                  pageSizeOptions={[100]}
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
        </Paper>
      </Stack>
    </Stack>
  );
}
