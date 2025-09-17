'use client';

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
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useState, useEffect } from 'react';

export default function SettingForm({ mode, initialData, selectOptions }) {
  const [mounted, setMounted] = useState(false);

  // [추가] mode 값에 따라 수정 모드 여부를 판단하는 변수
  const isEditMode = mode === 'edit';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* 상단 헤더 */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {isEditMode ? '평가 설정 수정' : '평가 설정 등록'}
        </Typography>
        <Button variant="text">목록</Button>
      </Stack>

      {/* 메인 컨텐츠 영역 */}
      <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold" noWrap>
            신규 평가 설정
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained">저장</Button>
            <Button variant="outlined" color="error">
              취소
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
          {/* 좌측 정보 패널 1 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium">
                1. 평가기준 선택
              </Typography>
              <Paper variant="outlined" sx={{ mt: 1, flex: 1 }}>
                <List dense>
                  <ListItem>
                    <ListItemText primary={'항목 없음'} />
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
                    <ListItemText primary={'항목 없음'} />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Stack>

          {/* 좌측 정보 패널 2 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium">
                3. 대상자 선택
              </Typography>
              <Paper variant="outlined" sx={{ mt: 1, flex: 1 }}>
                <List dense>
                  <ListItem>
                    <ListItemText primary={'대상자 없음'} />
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
                  <Typography color="text.secondary">
                    선택된 대상자의 평가자 정보가 없습니다.
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Stack>

          {/* 우측 데이터 그리드 */}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
              5. 평가설정 목록
            </Typography>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {mounted ? (
                <DataGrid
                  rows={[]}
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
                    },
                    {
                      field: 'evaluatorName2',
                      headerName: '2차 평가자',
                      flex: 1,
                    },
                    {
                      field: 'evaluatorName3',
                      headerName: '3차 평가자',
                      flex: 1,
                    },
                  ]}
                  density="compact"
                  localeText={{
                    ...koKR.components.MuiDataGrid.defaultProps.localeText,
                    noRowsLabel: '평가 대상자를 추가해주세요.',
                  }}
                  disableColumnMenu
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 100 },
                    },
                  }}
                  pageSizeOptions={[100]}
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
