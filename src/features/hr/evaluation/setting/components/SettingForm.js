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

  // [수정] 목록 적용 버튼 클릭 핸들러
  const handleApplyToList = () => {
    // [추가] 헬퍼 함수: ID로 평가자 이름 찾기
    const getEvaluatorName = (step, id) => {
      if (!id) return null;
      const list = evaluatorList[step] || [];
      return list.find((e) => e.userId === id)?.userName || null;
    };

    // [추가] 선택된 평가자 정보 미리 찾아두기
    const evaluatorName1 = getEvaluatorName('step1', selectedEvaluators.step1);
    const evaluatorName2 = getEvaluatorName('step2', selectedEvaluators.step2);
    const evaluatorName3 = getEvaluatorName('step3', selectedEvaluators.step3);

    // [추가] 선택된 대상자 ID 목록 가져오기
    const selectedCandidateIds = Array.from(candidateSelectionModel.ids);

    // [추가] 각 대상자별로 설정 상세 객체를 생성하여 배열로 만듦
    const newSettingDetails = selectedCandidateIds
      .map((candidateId) => {
        // 목록에서 현재 대상자 정보 찾기
        const candidate = candidateList.find((c) => c.userId === candidateId);

        // 대상자 정보가 없으면 생성 중단
        if (!candidate) return null;

        const detail = {
          // 이전 단계에서 추가한 속성
          settingDetailId: crypto.randomUUID(),
          criteriaMasterId: selectedCriteria?.id,
          criteriaMasterTitle: selectedCriteria?.title,
          adjustmentMasterId: selectedAdjustment?.id,
          adjustmentMasterTitle: selectedAdjustment?.title,

          // [추가] 1. 대상자 정보 할당
          evaluateeId: candidate.userId,
          evaluateeName: candidate.userName,

          // [추가] 2. 평가자 정보 할당
          evaluatorId1: selectedEvaluators.step1 || null,
          evaluatorName1,
          evaluatorWeight1: evaluatorWeights.step1 || null,
          evaluatorId2: selectedEvaluators.step2 || null,
          evaluatorName2,
          evaluatorWeight2: evaluatorWeights.step2 || null,
          evaluatorId3: null, // 3차 평가자는 기본적으로 null
          evaluatorName3: null,
          evaluatorWeight3: null,

          // [추가] 3. 직군/직책 코드 할당
          jobGroupCode: selectedJobGroup,
          jobTitleCode: selectedJobTitle,

          // [추가] 4. 액션 상태 할당
          action: 'insert',
        };

        // 직책이 팀원('02')일 경우에만 3차 평가자 정보 추가
        if (selectedJobTitle === '02') {
          detail.evaluatorId3 = selectedEvaluators.step3 || null;
          detail.evaluatorName3 = evaluatorName3;
          detail.evaluatorWeight3 = evaluatorWeights.step3 || null;
        }

        return detail;
      })
      .filter(Boolean); // 혹시 모를 null 값 제거

    // [수정] 생성된 객체 '배열'을 콘솔에 출력
    console.log(newSettingDetails);

    // [추가] 그리드 데이터 업데이트
    setSettingList((prevList) => {
      // 새로 추가된 목록을 Map으로 변환하여 빠른 조회를 가능하게 함
      const newDetailsMap = new Map(
        newSettingDetails.map((item) => [item.evaluateeId, item]),
      );
      // 기존 목록에서 새로 추가된 대상자와 중복되지 않는 항목만 필터링
      const updatedList = prevList.filter(
        (item) => !newDetailsMap.has(item.evaluateeId),
      );
      // 필터링된 기존 목록과 새로운 목록을 합쳐서 최종 목록 반환
      return [...updatedList, ...newSettingDetails];
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
