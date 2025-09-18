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

import { useGridSelection } from '@/common/hooks/useGridSelection';
import { matchIncludes } from '@/common/utils/filters';
import AdjustmentPanel from '@/features/hr/evaluation/setting/components/AdjustmentPanel';
import CandidatePanel from '@/features/hr/evaluation/setting/components/CandidatePanel';
import CriteriaPanel from '@/features/hr/evaluation/setting/components/CriteriaPanel';
import EvaluatorPanel from '@/features/hr/evaluation/setting/components/EvaluatorPanel';

export default function SettingForm({ mode, initialData, selectOptions }) {
  const [mounted, setMounted] = useState(false);
  const isEditMode = mode === 'edit';

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedJobGroup, setSelectedJobGroup] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [title, setTitle] = useState('');

  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

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

  // [추가] 5. 평가설정 목록 그리드에 표시될 데이터를 관리하는 상태
  const [settingList, setSettingList] = useState([]);

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

    if (
      selectedOffice &&
      selectedJobGroup &&
      selectedJobTitle &&
      selectedYear
    ) {
      const year = parseInt(selectedYear, 10);
      const cutoffDate = new Date(year, 11, 31); // 평가년도 12월 31일
      const hireCutoffDate = new Date(cutoffDate);
      hireCutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6개월 전

      const filtered = employeeList
        .filter((emp) => emp.userId !== '21001') // 이행재 이사 제외(임원이지만 절차상 팀장으로 취급)
        .filter(
          (emp) =>
            emp.officeId === selectedOffice &&
            emp.jobGroupCode === selectedJobGroup &&
            emp.jobTitleCode === selectedJobTitle,
        ) // 입사일 및 퇴사일 기준 필터링 로직
        .filter((emp) => {
          const hireDate = new Date(emp.hireDate);
          const retirementDate = emp.retirement_date
            ? new Date(emp.retirement_date)
            : null; // 입사일이 기준일(6개월 전)보다 이전이어야 함

          const isHireDateValid = hireDate <= hireCutoffDate; // 퇴사일이 없거나, 기준일(연말)보다 이후여야 함
          const isStillEmployed =
            !retirementDate || retirementDate > cutoffDate;

          return isHireDateValid && isStillEmployed;
        });

      setCandidateList(filtered);
    } else {
      setCandidateList([]);
    }
  }, [
    selectedOffice,
    selectedJobGroup,
    selectedJobTitle,
    initialData,
    selectedYear,
  ]);

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

  const handlePreview = (basePath, id) => {
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

  const {
    rowSelectionModel: candidateSelectionModel,
    onRowSelectionModelChange: handleCandidateSelectionChange,
  } = useGridSelection({
    allRows: filteredCandidateList,
    getRowId: (row) => row.userId,
  });

  // [수정] 목록 적용 버튼 클릭 핸들러 (Upsert 로직 적용)
  const handleApplyToList = () => {
    const getEvaluatorName = (step, id) => {
      if (!id) return null;
      const list = evaluatorList[step] || [];
      return list.find((e) => e.userId === id)?.userName || null;
    };

    const evaluatorName1 = getEvaluatorName('step1', selectedEvaluators.step1);
    const evaluatorName2 = getEvaluatorName('step2', selectedEvaluators.step2);
    const evaluatorName3 = getEvaluatorName('step3', selectedEvaluators.step3);

    const selectedCandidateIds = Array.from(candidateSelectionModel.ids);

    // [수정] 그리드 데이터 업데이트 로직 변경
    setSettingList((prevList) => {
      // 1. 기존 리스트를 빠른 조회를 위해 Map으로 변환
      const listMap = new Map(prevList.map((item) => [item.evaluateeId, item]));

      // 2. 선택된 대상자 목록을 순회하며 Map에 업데이트 또는 추가
      selectedCandidateIds.forEach((candidateId) => {
        const candidate = candidateList.find((c) => c.userId === candidateId);
        if (!candidate) return;

        const existingItem = listMap.get(candidateId);

        // 현재 폼에 설정된 값들로 새로운 데이터 객체 생성
        const newSettingData = {
          criteriaMasterId: selectedCriteria?.id,
          criteriaMasterTitle: selectedCriteria?.title,
          adjustmentMasterId: selectedAdjustment?.id,
          adjustmentMasterTitle: selectedAdjustment?.title,
          evaluateeId: candidate.userId,
          evaluateeName: candidate.userName,
          evaluatorId1: selectedEvaluators.step1 || null,
          evaluatorName1,
          evaluatorWeight1: evaluatorWeights.step1 || null,
          evaluatorId2: selectedEvaluators.step2 || null,
          evaluatorName2,
          evaluatorWeight2: evaluatorWeights.step2 || null,
          evaluatorId3:
            selectedJobTitle === '02' ? selectedEvaluators.step3 || null : null,
          evaluatorName3: selectedJobTitle === '02' ? evaluatorName3 : null,
          evaluatorWeight3:
            selectedJobTitle === '02' ? evaluatorWeights.step3 || null : null,
          jobGroupCode: selectedJobGroup,
          jobTitleCode: selectedJobTitle,
        };

        if (existingItem) {
          // [수정] 기존 항목이 있으면 덮어쓰기 (Update)
          listMap.set(candidateId, {
            ...existingItem, // settingDetailId 등 기존 값 유지
            ...newSettingData, // 새로운 설정 값으로 덮어쓰기
            // 'edit' 모드이고, 기존 항목이 서버에서 불러온 데이터('insert'가 아닌)였다면 'update'로 설정
            action:
              isEditMode && existingItem.action !== 'insert'
                ? 'update'
                : 'insert',
          });
        } else {
          // [수정] 기존 항목이 없으면 새로 추가 (Insert)
          listMap.set(candidateId, {
            ...newSettingData,
            settingDetailId: crypto.randomUUID(), // 새 ID 발급
            action: 'insert', // 새 항목은 항상 'insert'
          });
        }
      });

      // 3. 업데이트된 Map을 다시 배열로 변환하여 반환
      return Array.from(listMap.values());
    });
  };

  const handleSettingRowClick = (params) => {
    const { row } = params;

    // 1. 평가 기준 선택 상태 업데이트
    setSelectedCriteria({
      id: row.criteriaMasterId,
      title: row.criteriaMasterTitle,
    });

    // 2. 감/가점 기준 선택 상태 업데이트
    setSelectedAdjustment({
      id: row.adjustmentMasterId,
      title: row.adjustmentMasterTitle,
    });

    // 3. 대상자 선택 상태 업데이트
    // 직군/직책은 이미 동일한 컨텍스트이므로 상태 변경 불필요
    // 클릭된 행의 대상자만 선택되도록 변경
    handleCandidateSelectionChange({
      type: 'include',
      ids: new Set([row.evaluateeId]),
    });

    // 4. 평가자 및 가중치 상태 업데이트
    setSelectedEvaluators({
      step1: row.evaluatorId1,
      step2: row.evaluatorId2,
      step3: row.evaluatorId3,
    });
    setEvaluatorWeights({
      step1: String(row.evaluatorWeight1 || ''), // null일 경우 빈 문자열로
      step2: String(row.evaluatorWeight2 || ''),
      step3: String(row.evaluatorWeight3 || ''),
    });
  };

  const isEvaluatorSectionVisible = !!(
    selectedYear &&
    selectedOffice &&
    selectedJobGroup &&
    selectedJobTitle &&
    selectedCriteria &&
    selectedAdjustment
  );

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
              selectedId={selectedCriteria?.id}
              onSelect={setSelectedCriteria}
              onPreview={(id) => handlePreview('/hr/evaluation/criteria', id)}
            />

            <AdjustmentPanel
              list={initialData?.adjustmentList || []}
              enabled={
                !!(selectedJobGroup && selectedJobTitle && selectedCriteria)
              }
              selectedId={selectedAdjustment?.id}
              onSelect={setSelectedAdjustment}
              onPreview={(id) => handlePreview('/hr/evaluation/adjustment', id)}
            />
          </Stack>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <CandidatePanel
              isMounted={mounted}
              enabled={isEvaluatorSectionVisible}
              list={filteredCandidateList}
              keyword={candidateKeyword}
              onKeywordChange={setCandidateKeyword}
              rowSelectionModel={candidateSelectionModel}
              onRowSelectionModelChange={handleCandidateSelectionChange}
            />

            <EvaluatorPanel
              visible={
                isEvaluatorSectionVisible &&
                candidateSelectionModel.ids.size > 0
              }
              jobTitle={selectedJobTitle}
              evaluatorList={evaluatorList}
              selectedEvaluators={selectedEvaluators}
              evaluatorWeights={evaluatorWeights}
              onEvaluatorChange={(step, value) =>
                setSelectedEvaluators((prev) => ({ ...prev, [step]: value }))
              }
              onWeightChange={(step, value) =>
                setEvaluatorWeights((prev) => ({ ...prev, [step]: value }))
              }
              onApply={handleApplyToList} // [추가]
            />
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
                  rows={settingList} // [수정]
                  getRowId={(row) => row.evaluateeId} // [추가]
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
                      // [추가] 이름과 가중치를 함께 표시
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight1 || '0'}%)`,
                    },
                    {
                      field: 'evaluatorName2',
                      headerName: '2차 평가자',
                      flex: 1,
                      // [추가] 이름과 가중치를 함께 표시
                      valueGetter: (value, row) =>
                        `${value || '-'} (${row.evaluatorWeight2 || '0'}%)`,
                    },
                    {
                      field: 'evaluatorName3',
                      headerName: '3차 평가자',
                      flex: 1,
                      // [추가] 이름과 가중치를 함께 표시
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
                  onRowClick={handleSettingRowClick} // [추가]
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
