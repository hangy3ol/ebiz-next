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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useState, useEffect } from 'react';

export default function SettingForm({ mode, initialData, selectOptions }) {
  const [mounted, setMounted] = useState(false);
  const isEditMode = mode === 'edit';

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedJobGroup, setSelectedJobGroup] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [title, setTitle] = useState('');

  const getName = (list, id) => list.find((x) => x.id === id)?.name1 || '';

  useEffect(() => {
    if (!isEditMode) {
      const { year, office, jobGroup, jobTitle } = selectOptions || {};

      if (
        !selectedYear ||
        !selectedOffice ||
        !selectedJobGroup ||
        !selectedJobTitle
      ) {
        setTitle('');
        return;
      }

      const yearName = getName(year, selectedYear);
      const officeName = getName(office, selectedOffice);
      const jobGroupName = getName(jobGroup, selectedJobGroup);
      const jobTitleName = getName(jobTitle, selectedJobTitle);

      setTitle(
        `${yearName} 귀속 ${officeName} ${jobGroupName} ${jobTitleName} 인사평가`,
      );
    }
  }, [
    selectedYear,
    selectedOffice,
    selectedJobGroup,
    selectedJobTitle,
    selectOptions,
    isEditMode,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {isEditMode ? '평가 설정 수정' : '평가 설정 등록'}
        </Typography>
        <Stack direction="row" gap={1}>
          <Button variant="text">목록</Button>
          <Button variant="contained">저장</Button>
          <Button variant="outlined" color="error">
            취소
          </Button>
        </Stack>
      </Stack>

      {/* 메인 컨텐츠 영역 */}
      <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>평가귀속년도</InputLabel>
              <Select
                label="평가귀속년도"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {selectOptions?.year?.map((y) => (
                  <MenuItem key={y.id} value={y.id}>
                    {y.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>사업부</InputLabel>
              <Select
                label="사업부"
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
              >
                {selectOptions?.office?.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>직군</InputLabel>
              <Select
                label="직군"
                value={selectedJobGroup}
                onChange={(e) => setSelectedJobGroup(e.target.value)}
              >
                {selectOptions?.jobGroup?.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>직책</InputLabel>
              <Select
                label="직책"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              >
                {selectOptions?.jobTitle?.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="제목"
              size="small"
              fullWidth
              value={title}
              InputProps={{
                readOnly: true,
              }}
              placeholder="상위 항목을 모두 선택하세요"
            />
          </Stack>
        </Paper>

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
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" fontWeight="medium">
                  4. 평가자 선택
                </Typography>
                <Button variant="outlined" size="small" color="primary">
                  목록 적용
                </Button>
              </Stack>
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" fontWeight="medium">
                5. 평가설정 목록
              </Typography>
              <Button variant="outlined" size="small" color="error">
                목록 제외
              </Button>
            </Stack>
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
