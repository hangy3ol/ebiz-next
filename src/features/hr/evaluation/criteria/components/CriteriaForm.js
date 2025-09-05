'use client';

import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useEffect, useReducer, useState, useCallback } from 'react'; // [추가] useCallback 임포트

import { saveCriteriaApi } from '@/features/hr/evaluation/criteria/api/criteriaApi';
import CriteriaFormDialog from '@/features/hr/evaluation/criteria/components/CriteriaFormDialog';
import CriteriaTable from '@/features/hr/evaluation/criteria/components/CriteriaTable';
import {
  ACTION_TYPES,
  criteriaReducer,
  initialCriteriaState,
} from '@/features/hr/evaluation/criteria/hooks/criteriaReducer';
import {
  validateScoreAndRatio,
  validateHierarchy,
} from '@/features/hr/evaluation/criteria/utils/criteriaValidator';

export default function CriteriaForm({
  mode = 'create',
  initialData = null,
  selectOptions,
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const { year = [], jobGroup = [], jobTitle = [] } = selectOptions || {};

  const [criteriaMasterId, setCriteriaMasterId] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedJobGroup, setSelectedJobGroup] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');

  const [detail, dispatch] = useReducer(criteriaReducer, initialCriteriaState);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogMode, setDialogMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);

  const { enqueueSnackbar } = useSnackbar(); // [추가] 팝업에서 전달된 데이터를 받는 콜백 함수

  // [추가] 팝업에서 전달된 데이터를 받는 콜백 함수
  const handleCopyCallback = useCallback(
    (copiedData) => {
      // REPLACE_ALL 액션을 사용하여 받은 데이터를 전체 상태에 적용
      dispatch({ type: ACTION_TYPES.REPLACE_ALL, payload: copiedData });
      enqueueSnackbar('평가 기준이 성공적으로 복사되었습니다.', {
        variant: 'success',
      });
    },
    [dispatch, enqueueSnackbar],
  );

  // [추가] 부모 창에 콜백 함수를 노출하고 정리
  useEffect(() => {
    window.handleCopyCallback = handleCopyCallback;
    return () => {
      delete window.handleCopyCallback;
    };
  }, [handleCopyCallback]);

  useEffect(() => {
    if (isEdit && initialData) {
      const { master, detail: detailData } = initialData;

      setCriteriaMasterId(master.criteriaMasterId);
      setTitle(master.title);
      setRemark(master.remark);
      setSelectedJobGroup(master.jobGroupCode);
      setSelectedJobTitle(master.jobTitleCode);

      const yearOption = year.find((y) => y.name1 === master.evaluationYear);
      if (yearOption) {
        setSelectedYear(yearOption.id);
      }

      dispatch({
        type: ACTION_TYPES.KEEP,
        payload: detailData,
      });
    }
  }, [isEdit, initialData, year]);

  const isSaveDisabled = isEdit
    ? false
    : !selectedYear || !selectedJobGroup || !selectedJobTitle;

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType('');
    setEditingItem(null);
  };

  const handleOpenAddDialog = (type) => {
    setDialogMode('add');
    setDialogType(type);
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (level, item) => {
    setDialogMode('edit');
    setDialogType(level);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (formData) => {
    let payload;
    let nextDetailState;

    if (dialogMode === 'add') {
      payload = {
        level: dialogType,
        item: formData,
      };
      const newItem = { ...formData, id: `temp-${Date.now()}` };
      nextDetailState = {
        ...detail,
        [dialogType]: [...detail[dialogType], newItem],
      };
    } else {
      // 'edit'
      const updatedItem = { ...editingItem, ...formData };
      payload = {
        level: dialogType,
        item: updatedItem,
      };
      nextDetailState = {
        ...detail,
        [dialogType]: detail[dialogType].map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      };
    }

    // [추가] dispatch 전에 Score와 Ratio 규칙만 검증
    const { isValid, errors } = validateScoreAndRatio(nextDetailState);
    if (!isValid) {
      // [수정] 첫 번째 오류만 표시
      enqueueSnackbar(errors[0], { variant: 'warning' });
      return;
    }

    const actionType =
      dialogMode === 'add' ? ACTION_TYPES.INSERT : ACTION_TYPES.UPDATE;
    dispatch({ type: actionType, payload });

    handleCloseDialog();
  };

  const handleDeleteItem = (itemToDelete) => {
    dispatch({
      type: ACTION_TYPES.DELETE,
      payload: {
        level: dialogType,
        item: itemToDelete,
      },
    });
  };

  const getName = (list, id) => list.find((x) => x.id === id)?.name1 || '';

  useEffect(() => {
    if (!isEdit) {
      if (!selectedYear || !selectedJobGroup || !selectedJobTitle) {
        setTitle('');
        return;
      }
      const y = getName(year, selectedYear);
      const g = getName(jobGroup, selectedJobGroup);
      const t = getName(jobTitle, selectedJobTitle);
      setTitle(`${y} 귀속 ${g} ${t} 평가기준`);
    }
  }, [
    selectedYear,
    selectedJobGroup,
    selectedJobTitle,
    year,
    jobGroup,
    jobTitle,
    isEdit,
  ]);

  const handleSave = async () => {
    // [수정] 저장 시점에는 계층 구조의 무결성만 검증
    const { isValid, errors } = validateHierarchy(detail);

    if (!isValid) {
      // [수정] 첫 번째 오류만 표시
      enqueueSnackbar(errors[0], { variant: 'warning' });
      return;
    }

    try {
      const payload = {
        master: {
          criteriaMasterId,
          evaluationYear: year.find((y) => y.id === selectedYear)?.name1,
          jobGroupCode: selectedJobGroup,
          jobTitleCode: selectedJobTitle,
          title,
          remark,
        },
        detail: {
          level1: detail.level1.filter((item) => item.action !== 'keep'),
          level2: detail.level2.filter((item) => item.action !== 'keep'),
          level3: detail.level3.filter((item) => item.action !== 'keep'),
        },
      };

      const { success, message } = await saveCriteriaApi(payload);

      if (success) {
        enqueueSnackbar(message, { variant: 'success' });
        router.push('/hr/evaluation/criteria');
      } else {
        enqueueSnackbar(message || '저장에 실패했습니다.', {
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Save failed', error);
      enqueueSnackbar('저장 중 오류가 발생했습니다.', { variant: 'error' });
    }
  };

  // [수정] 복사 버튼 클릭 시 팝업 열기 핸들러
  const handleCopyClick = () => {
    const popupWidth = 800;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    window.open(
      `/popup/hr/evaluation/criteria?criteriaMasterId=${criteriaMasterId}`,
      '_blank',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`,
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">
          {isEdit ? '평가 기준 수정' : '평가 기준 등록'}
        </Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="text"
            onClick={() => router.push('/hr/evaluation/criteria')}
          >
            목록
          </Button>

          <Button variant="outlined" onClick={handleCopyClick}>
            복사
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            저장
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          minHeight: 0,
          flex: 1,
          flexDirection: 'column',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: '1 1 0%',
            minWidth: 0,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }} disabled={isEdit}>
              <InputLabel>연도</InputLabel>
              <Select
                label="연도"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {year.map((y) => (
                  <MenuItem key={y.id} value={y.id}>
                    {y.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }} disabled={isEdit}>
              <InputLabel>직군</InputLabel>
              <Select
                label="직군"
                value={selectedJobGroup}
                onChange={(e) => setSelectedJobGroup(e.target.value)}
              >
                {jobGroup.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }} disabled={isEdit}>
              <InputLabel>직책</InputLabel>
              <Select
                label="직책"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              >
                {jobTitle.map((t) => (
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
              disabled={isEdit}
              placeholder="연도·직군·직책을 모두 선택하세요"
            />

            <TextField
              label="비고"
              size="small"
              fullWidth
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="비고(선택)"
              disabled={isEdit}
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}
          >
            <Button
              variant="outlined"
              onClick={() => handleOpenAddDialog('level1')}
            >
              구분 추가
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOpenAddDialog('level2')}
            >
              평가 항목 추가
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOpenAddDialog('level3')}
            >
              평가 지표 추가
            </Button>
          </Box>

          <CriteriaTable
            detail={detail}
            containerSx={{ flex: 1, minHeight: 0 }}
            onCellClick={handleOpenEditDialog}
            isEditable={true}
          />
        </Paper>
      </Box>

      <CriteriaFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        dialogType={dialogType}
        mode={dialogMode}
        initialData={editingItem}
        onSubmit={handleDialogSubmit}
        onDelete={handleDeleteItem}
        level1Option={detail.level1.filter((item) => item.action !== 'delete')}
        level2Option={detail.level2.filter((item) => item.action !== 'delete')}
      />
    </Box>
  );
}
