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
import { useEffect, useReducer, useState } from 'react';

import { saveCriteriaApi } from '@/features/hr/evaluations/criteria/api/criteriaApi';
import CriteriaFormDialog from '@/features/hr/evaluations/criteria/components/CriteriaFormDialog';
import CriteriaTable from '@/features/hr/evaluations/criteria/components/CriteriaTable';
import {
  ACTION_TYPES,
  criteriaReducer,
  initialCriteriaState,
} from '@/features/hr/evaluations/criteria/hooks/criteriaReducer';

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

  const { enqueueSnackbar } = useSnackbar();

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
    if (dialogMode === 'add') {
      dispatch({
        type: ACTION_TYPES.INSERT,
        payload: {
          level: dialogType,
          item: formData,
        },
      });
    } else if (dialogMode === 'edit') {
      dispatch({
        type: ACTION_TYPES.UPDATE,
        payload: {
          level: dialogType,
          item: { ...editingItem, ...formData },
        },
      });
    }
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
        router.push('/hr/evaluations/criteria');
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
            onClick={() => router.push('/hr/evaluations/criteria')}
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
