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
import { useState, useEffect, useMemo } from 'react';

import { matchIncludes } from '@/common/utils/filters';
import AdjustmentPanel from '@/features/hr/evaluation/setting/components/AdjustmentPanel';
import CandidatePanel from '@/features/hr/evaluation/setting/components/CandidatePanel';
import CriteriaPanel from '@/features/hr/evaluation/setting/components/CriteriaPanel';

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
  const [candidateKeyword, setCandidateKeyword] = useState('');

  const [evaluatorList, setEvaluatorList] = useState({
    step1: [],
    step2: [],
    step3: [],
  });

  const [selectedEvaluators, setSelectedEvaluators] = useState({
    step1: '',
    step2: '',
    step3: '',
  });
  const [evaluatorWeights, setEvaluatorWeights] = useState({
    step1: '',
    step2: '',
    step3: '',
  });

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
      const filtered = employeeList
        .filter((emp) => emp.userId !== '21001') // 이행재 이사 제외(임원이지만 절차상 팀장으로 취급)
        .filter(
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
    const employeeList = initialData?.employeeList || [];
    if (!selectedJobTitle || employeeList.length === 0) {
      setEvaluatorList({ step1: [], step2: [], step3: [] });
      return;
    }

    let step1 = [];
    let step2 = [];
    let step3 = [];

    if (selectedJobTitle === '01') {
      // 1차 평가자: 임원 중 이행재 이사, 대표님, 회장님 제외
      step1 = employeeList
        .filter((e) => e.executiveYn === 'Y')
        .filter((e) => e.userId !== '21001') // 이행재 이사 제외
        .filter((e) => e.userId !== '21404') // 대표님 제외
        .filter((e) => e.userId !== '82001'); // 회장님 제외

      // 2차 평가자: 대표님
      step2 = employeeList.filter((e) => e.userId === '21404');
    } else if (selectedJobTitle === '02') {
      // 1차 평가자: 해당 사업부 팀장
      step1 = employeeList
        .filter((e) => e.officeId === selectedOffice)
        .filter((e) => e.jobTitleCode === '01');

      // 2차 평가자: 임원 중 이행재 이사, 대표님, 회장님 제외
      step2 = employeeList
        .filter((e) => e.executiveYn === 'Y')
        .filter((e) => e.userId !== '21001') // 이행재 이사 제외
        .filter((e) => e.userId !== '21404') // 대표님 제외
        .filter((e) => e.userId !== '82001'); // 회장님 제외

      // 3차 평가자: 대표님
      step3 = employeeList.filter((e) => e.userId === '21404');
    }

    setEvaluatorList({ step1, step2, step3 });
  }, [selectedJobTitle, selectedOffice, initialData]);

  useEffect(() => {
    if (selectedJobTitle === '01') {
      setEvaluatorWeights({
        step1: '40',
        step2: '60',
        step3: '',
      });
    } else if (selectedJobTitle === '02') {
      setEvaluatorWeights({
        step1: '60',
        step2: '12',
        step3: '28',
      });
    } else {
      setEvaluatorWeights({
        step1: '',
        step2: '',
        step3: '',
      });
    }
  }, [selectedJobTitle]);

  const searchableCandidateFields = useMemo(
    () => ['userName', 'departmentName', 'positionName'],
    [],
  );

  const filteredCandidateList = useMemo(() => {
    return candidateList.filter((candidate) =>
      matchIncludes(candidate, candidateKeyword, searchableCandidateFields),
    );
  }, [candidateList, candidateKeyword, searchableCandidateFields]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEvaluatorChange = (step, value) => {
    setSelectedEvaluators((prev) => ({ ...prev, [step]: value }));
  };
  const handleWeightChange = (step, value) => {
    setEvaluatorWeights((prev) => ({ ...prev, [step]: value }));
  };

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
            <CandidatePanel
              enabled={
                !!(
                  selectedYear &&
                  selectedOffice &&
                  selectedJobGroup &&
                  selectedJobTitle &&
                  selectedCriteriaId &&
                  selectedAdjustmentId
                )
              }
              list={filteredCandidateList}
              keyword={candidateKeyword}
              onKeywordChange={setCandidateKeyword}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
              {/* [수정] 지시에 따라 삭제되었던 주석들 복원 */}
              {/* [삭제] Paper 컴포넌트 제거 */}
              {/* <Paper variant="outlined" sx={{ mt: 1, flex: 1, p: 2 }}> */}
              {/* [수정] Paper를 제거하고 레이아웃 유지를 위해 Box 추가 */}
              <Box sx={{ mt: 1, flex: 1 }}>
                {selectedJobTitle ? (
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      {/* 1차 평가자 */}
                      <FormControl size="small" fullWidth>
                        <InputLabel>1차 평가자</InputLabel>
                        <Select
                          label="1차 평가자"
                          value={selectedEvaluators.step1}
                          onChange={(e) =>
                            handleEvaluatorChange('step1', e.target.value)
                          }
                        >
                          {evaluatorList.step1.map((emp) => (
                            <MenuItem key={emp.userId} value={emp.userId}>
                              {emp.userName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {/* 2차 평가자 */}
                      <FormControl size="small" fullWidth>
                        <InputLabel>2차 평가자</InputLabel>
                        <Select
                          label="2차 평가자"
                          value={selectedEvaluators.step2}
                          onChange={(e) =>
                            handleEvaluatorChange('step2', e.target.value)
                          }
                        >
                          {evaluatorList.step2.map((emp) => (
                            <MenuItem key={emp.userId} value={emp.userId}>
                              {emp.userName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {/* 3차 평가자 (조건부) */}
                      {selectedJobTitle === '02' && (
                        <FormControl size="small" fullWidth>
                          <InputLabel>3차 평가자</InputLabel>
                          <Select
                            label="3차 평가자"
                            value={selectedEvaluators.step3}
                            onChange={(e) =>
                              handleEvaluatorChange('step3', e.target.value)
                            }
                          >
                            {evaluatorList.step3.map((emp) => (
                              <MenuItem key={emp.userId} value={emp.userId}>
                                {emp.userName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      {/* 1차 가중치 */}
                      <TextField
                        label="가중치 (%)"
                        type="number"
                        size="small"
                        fullWidth
                        value={evaluatorWeights.step1}
                        onChange={(e) =>
                          handleWeightChange('step1', e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      {/* 2차 가중치 */}
                      <TextField
                        label="가중치 (%)"
                        type="number"
                        size="small"
                        fullWidth
                        value={evaluatorWeights.step2}
                        onChange={(e) =>
                          handleWeightChange('step2', e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      {/* 3차 가중치 (조건부) */}
                      {selectedJobTitle === '02' && (
                        <TextField
                          label="가중치 (%)"
                          type="number"
                          size="small"
                          fullWidth
                          value={evaluatorWeights.step3}
                          onChange={(e) =>
                            handleWeightChange('step3', e.target.value)
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: '100%' }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      직책을 먼저 선택해주세요.
                    </Typography>
                  </Stack>
                )}
              </Box>
              {/* </Paper> */}
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
                    noRowsLabel: '등록된 데이터가 없습니다.',
                  }}
                  disableColumnMenu
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 100 },
                    },
                  }}
                  pageSizeOptions={[100]}
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
        </Paper>
      </Stack>
    </Stack>
  );
}
