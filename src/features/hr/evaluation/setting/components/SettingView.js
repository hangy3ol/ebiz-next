'use client';

// [추가] List 관련 컴포넌트를 import 합니다.
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Skeleton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
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

    // [수정] 컴포넌트가 마운트되고 데이터가 있을 때 첫 번째 행을 선택하는 로직을 좀 더 안정적으로 변경합니다.
    if (detail && detail.length > 0) {
      const firstRow = detail[0];
      setSelectedRow(firstRow); // 초기 selectedRow 설정

      // apiRef.current가 준비될 때까지 기다렸다가 선택을 시도합니다.
      const timer = setTimeout(() => {
        if (apiRef.current) {
          try {
            apiRef.current.selectRow(firstRow.evaluateeId, true, true);
          } catch (error) {
            console.error('Failed to select row:', error);
          }
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [detail, apiRef]); // [수정] mounted 의존성 제거

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
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
          {/* // [수정] 왼쪽 정보 영역 UI 변경 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium">
                1. 평가기준 선택
              </Typography>

              <Paper variant="outlined" sx={{ mt: 1, flex: 1 }}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={selectedRow?.criteriaMasterTitle || '항목 없음'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium">
                2. 감/가점 기준 선택
              </Typography>

              <Paper variant="outlined" sx={{ mt: 1, flex: 1 }}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={
                        selectedRow?.adjustmentMasterTitle || '항목 없음'
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Stack>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium">
                3. 대상자 선택
              </Typography>
              <Paper variant="outlined" sx={{ mt: 1, flex: 1 }}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={selectedRow?.evaluateeName || '대상자 없음'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                4. 평가자 선택
              </Typography>

              <Paper variant="outlined" sx={{ mt: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ p: 1, minHeight: '80px' }}
                  alignItems="center"
                  justifyContent="center"
                >
                  {selectedRow?.evaluatorName1 ? (
                    <>
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
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      선택된 대상자의 평가자 정보가 없습니다.
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Box>
          </Stack>
          <Box
            variant="outlined"
            sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}
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
                    pagination: {
                      paginationModel: { page: 0, pageSize: 100 },
                    },
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
