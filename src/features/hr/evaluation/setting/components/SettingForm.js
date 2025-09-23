'use client';

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { useGridSelection } from '@/common/hooks/useGridSelection';
import { matchIncludes } from '@/common/utils/filters';
import { saveSettingApi } from '@/features/hr/evaluation/setting/api/settingApi';
import AdjustmentPanel from '@/features/hr/evaluation/setting/components/AdjustmentPanel';
import CandidatePanel from '@/features/hr/evaluation/setting/components/CandidatePanel';
import CriteriaPanel from '@/features/hr/evaluation/setting/components/CriteriaPanel';
import EvaluatorPanel from '@/features/hr/evaluation/setting/components/EvaluatorPanel';
import SettingDetailPanel from '@/features/hr/evaluation/setting/components/SettingDetailPanel';

export default function SettingForm({ mode, initialData, selectOptions }) {
  // ================== 1. State 선언부 ==================
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

  const [settingList, setSettingList] = useState([]);

  const [isInitialRowClicked, setIsInitialRowClicked] = useState(false);

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // ================== 2. 메모이제이션 및 핸들러 선언부 ==================
  const getName = (list, id) => list.find((x) => x.id === id)?.name1 || '';

  const searchableCandidateFields = useMemo(
    () => ['userName', 'departmentName', 'positionName'],
    [],
  );

  const filteredCandidateList = useMemo(
    () =>
      candidateList.filter((candidate) =>
        matchIncludes(candidate, candidateKeyword, searchableCandidateFields),
      ),
    [candidateList, candidateKeyword, searchableCandidateFields],
  );

  const visibleSettingList = useMemo(
    () => settingList.filter((item) => item.action !== 'delete'),
    [settingList],
  );

  const isSaveDisabled = useMemo(
    () => visibleSettingList.length === 0,
    [visibleSettingList],
  );

  const isEvaluatorSectionVisible = !!(
    selectedYear &&
    selectedOffice &&
    selectedJobGroup &&
    selectedJobTitle &&
    selectedCriteria &&
    selectedAdjustment
  );

  const {
    rowSelectionModel: candidateSelectionModel,
    onRowSelectionModelChange: handleCandidateSelectionChange,
  } = useGridSelection({
    allRows: filteredCandidateList,
    getRowId: (row) => row.userId,
  });

  const {
    rowSelectionModel: settingListSelectionModel,
    onRowSelectionModelChange: handleSettingListSelectionChange,
  } = useGridSelection({
    allRows: settingList,
    getRowId: (row) => row.evaluateeId,
  });

  const handleSettingRowClick = useCallback(
    (params) => {
      const { row } = params;
      setSelectedCriteria({
        id: row.criteriaMasterId,
        title: row.criteriaMasterTitle,
      });
      setSelectedAdjustment({
        id: row.adjustmentMasterId,
        title: row.adjustmentMasterTitle,
      });
      handleCandidateSelectionChange({
        type: 'include',
        ids: new Set([row.evaluateeId]),
      });
      setSelectedEvaluators({
        step1: row.evaluatorId1,
        step2: row.evaluatorId2,
        step3: row.evaluatorId3,
      });
      setEvaluatorWeights({
        step1: String(row.evaluatorWeight1 || ''),
        step2: String(row.evaluatorWeight2 || ''),
        step3: String(row.evaluatorWeight3 || ''),
      });
    },
    [handleCandidateSelectionChange],
  );

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

    setSettingList((prevList) => {
      const listMap = new Map(prevList.map((item) => [item.evaluateeId, item]));
      selectedCandidateIds.forEach((candidateId) => {
        const candidate = candidateList.find((c) => c.userId === candidateId);
        if (!candidate) return;

        const existingItem = listMap.get(candidateId);
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
          listMap.set(candidateId, {
            ...existingItem,
            ...newSettingData,
            action:
              isEditMode && existingItem.action !== 'insert'
                ? 'update'
                : 'insert',
          });
        } else {
          listMap.set(candidateId, {
            ...newSettingData,
            settingDetailId: crypto.randomUUID(),
            action: 'insert',
          });
        }
      });
      return Array.from(listMap.values());
    });
  };

  const handleExcludeFromList = () => {
    setSettingList((prevList) => {
      const selectedIds = settingListSelectionModel.ids;
      return prevList.reduce((acc, item) => {
        if (selectedIds.has(item.evaluateeId)) {
          if (item.action === 'insert') {
            return acc;
          }
          acc.push({ ...item, action: 'delete' });
          return acc;
        }
        acc.push(item);
        return acc;
      }, []);
    });
    handleSettingListSelectionChange({ type: 'include', ids: new Set() });
  };

  const handleSave = async () => {
    if (settingList.filter((item) => item.action !== 'delete').length === 0) {
      enqueueSnackbar(
        '저장할 평가 대상자가 없습니다. 대상자를 목록에 적용해주세요.',
        { variant: 'warning' },
      );
      return;
    }

    try {
      const payload = {
        master: {
          id: isEditMode ? initialData.master.settingMasterId : null,
          evaluationYear: selectedYear,
          officeId: selectedOffice,
          jobGroupCode: selectedJobGroup,
          jobTitleCode: selectedJobTitle,
          title: title,
        },
        detail: settingList,
      };

      const { success, message } = await saveSettingApi(payload);

      if (success) {
        enqueueSnackbar(message, { variant: 'success' });
        router.push('/hr/evaluation/setting');
      } else {
        enqueueSnackbar(message, { variant: 'error' });
      }
    } catch (error) {
      console.error('평가 설정 저장 실패', error);
      enqueueSnackbar('평가 설정 저장 중 오류가 발생했습니다.', {
        variant: 'error',
      });
    }
  };

  // ================== 3. useEffect (Side Effects) 선언부 ==================
  useEffect(() => {
    if (isEditMode && initialData) {
      const { master, detail } = initialData;
      if (master) {
        setSelectedYear(master.evaluationYear);
        setSelectedOffice(master.officeId);
        setSelectedJobGroup(master.jobGroupCode);
        setSelectedJobTitle(master.jobTitleCode);
        setTitle(master.title);
      }
      if (detail) {
        setSettingList(detail);
      }
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    const isEvaluatorListReady =
      evaluatorList.step1.length > 0 ||
      evaluatorList.step2.length > 0 ||
      evaluatorList.step3.length > 0;
    if (
      isEditMode &&
      !isInitialRowClicked &&
      settingList.length > 0 &&
      isEvaluatorListReady
    ) {
      handleSettingRowClick({ row: settingList[0] });
      setIsInitialRowClicked(true);
    }
  }, [
    isEditMode,
    isInitialRowClicked,
    settingList,
    evaluatorList,
    handleSettingRowClick,
  ]);

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
      setEvaluatorWeights({ step1: '40', step2: '60', step3: '' });
    } else if (selectedJobTitle === '02') {
      setEvaluatorWeights({ step1: '60', step2: '12', step3: '28' });
    } else {
      setEvaluatorWeights({ step1: '', step2: '', step3: '' });
    }
  }, [selectedJobTitle]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ================== 4. Return (JSX) ==================
  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {isEditMode ? '평가 설정 수정' : '평가 설정 등록'}
        </Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="text"
            onClick={() => router.push('/hr/evaluation/setting')}
          >
            목록
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            저장
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
                disabled={isEditMode}
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
                disabled={isEditMode}
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
                disabled={isEditMode}
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
                disabled={isEditMode}
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
              disabled={isEditMode}
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
              onApply={handleApplyToList}
            />
          </Stack>
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            <SettingDetailPanel
              isMounted={mounted}
              list={visibleSettingList}
              selectionModel={settingListSelectionModel}
              onExclude={handleExcludeFromList}
              onRowClick={handleSettingRowClick}
              onSelectionChange={handleSettingListSelectionChange}
            />
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}
