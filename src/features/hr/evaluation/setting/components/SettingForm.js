'use client';

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useState, useEffect } from 'react';

import AdjustmentPanel from './AdjustmentPanel';
import CriteriaPanel from './CriteriaPanel';

export default function SettingForm({ mode, initialData, selectOptions }) {
  const [mounted, setMounted] = useState(false);
  const isEditMode = mode === 'edit';

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedJobGroup, setSelectedJobGroup] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [title, setTitle] = useState('');

  const [selectedCriteriaId, setSelectedCriteriaId] = useState(null);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState(null);

  const [candidateList, setCandidateList] = useState([]);

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
    const { employeeList } = initialData || {};
    if (!employeeList) return;

    if (selectedOffice && selectedJobGroup && selectedJobTitle) {
      const filtered = employeeList.filter(
        (emp) =>
          emp.officeId === selectedOffice &&
          emp.jobGroupCode === selectedJobGroup &&
          emp.jobTitleCode === selectedJobTitle,
      );
      setCandidateList(filtered);
    } else {
      setCandidateList([]);
    }
  }, [selectedOffice, selectedJobGroup, selectedJobTitle, initialData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenPreviewPopup = (basePath, id) => {
    const popupWidth = 800;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    window.open(
      `/popup${basePath}/${id}`,
      '_blank',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );
  };

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
              InputProps={{ readOnly: true }}
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
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <CriteriaPanel
              list={initialData?.criteriaList || []}
              selectedJobGroup={selectedJobGroup}
              selectedJobTitle={selectedJobTitle}
              enabled={!!(selectedJobGroup && selectedJobTitle)}
              selectedId={selectedCriteriaId}
              onSelect={setSelectedCriteriaId}
              onPreview={(id) =>
                handleOpenPreviewPopup('/hr/evaluation/criteria', id)
              }
            />

            <AdjustmentPanel
              list={initialData?.adjustmentList || []}
              enabled={
                !!(selectedJobGroup && selectedJobTitle && selectedCriteriaId)
              }
              selectedId={selectedAdjustmentId}
              onSelect={setSelectedAdjustmentId}
              onPreview={(id) =>
                handleOpenPreviewPopup('/hr/evaluation/adjustment', id)
              }
            />
          </Stack>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <Typography variant="subtitle2" fontWeight="medium">
                3. 대상자 선택
              </Typography>
              <Paper
                variant="outlined"
                sx={{ mt: 1, flex: 1, overflow: 'auto' }}
              >
                {selectedYear &&
                selectedOffice &&
                selectedJobGroup &&
                selectedJobTitle &&
                selectedCriteriaId &&
                selectedAdjustmentId ? (
                  <DataGrid
                    rows={candidateList}
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
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      p: 1,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      textAlign="center"
                      variant="body2"
                    >
                      상단의 모든 항목을
                      <br />
                      먼저 선택해주세요.
                    </Typography>
                  </Box>
                )}
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
