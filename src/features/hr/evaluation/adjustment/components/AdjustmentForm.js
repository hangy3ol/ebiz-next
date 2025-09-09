'use client';

import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useReducer, useState } from 'react';

import AdjustmentFormDialog from '@/features/hr/evaluation/adjustment/components/AdjustmentFormDialog';
import AdjustmentTable from '@/features/hr/evaluation/adjustment/components/AdjustmentTable';
import {
  ACTION_TYPES,
  adjustmentReducer,
  initialAdjustmentState,
} from '@/features/hr/evaluation/adjustment/hooks/adjustmentReducer';

export default function AdjustmentForm({ initialData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = !!initialData;

  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');
  const [detail, dispatch] = useReducer(
    adjustmentReducer,
    initialAdjustmentState,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogMode, setDialogMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);

  const processedData = useMemo(() => {
    const calculateRowSpan = (data) => {
      const activeLevel1 = data.level1.filter(
        (item) => item.action !== 'delete',
      );
      const activeLevel2 = data.level2.filter(
        (item) => item.action !== 'delete',
      );

      const level1WithRowSpan = activeLevel1.map((lv1) => {
        const childrenCount = activeLevel2.filter(
          // [수정] 바로 이 부분의 타입 비교가 누락되었습니다.
          (lv2) => String(lv2.parentId) === String(lv1.id),
        ).length;
        return {
          ...lv1,
          rowSpan: Math.max(childrenCount, 1),
        };
      });

      return { level1: level1WithRowSpan, level2: activeLevel2 };
    };

    return {
      penalty: calculateRowSpan(detail.penalty),
      reward: calculateRowSpan(detail.reward),
    };
  }, [detail]);

  useEffect(() => {
    if (isEditMode && initialData) {
      const { master, detail: detailData } = initialData;
      setTitle(master.title || '');
      setRemark(master.remark || '');

      const transformToKeep = (arr) =>
        arr.map((item) => ({ ...item, action: 'keep' }));

      dispatch({
        type: ACTION_TYPES.REPLACE_ALL,
        payload: {
          penalty: {
            level1: transformToKeep(
              detailData.level1.filter((i) => i.division === 'penalty'),
            ),
            level2: transformToKeep(
              detailData.level2.filter((i) => i.division === 'penalty'),
            ),
          },
          reward: {
            level1: transformToKeep(
              detailData.level1.filter((i) => i.division === 'reward'),
            ),
            level2: transformToKeep(
              detailData.level2.filter((i) => i.division === 'reward'),
            ),
          },
        },
      });
    }
  }, [isEditMode, initialData]);

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

  const handleOpenEditDialog = (type, item) => {
    setDialogMode('edit');
    setDialogType(type);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (formData) => {
    const [division, level] = dialogType.split('-');
    dispatch({
      type: dialogMode === 'add' ? ACTION_TYPES.INSERT : ACTION_TYPES.UPDATE,
      payload: { division, level, item: formData },
    });
    handleCloseDialog();
  };

  const handleDeleteItem = (itemToDelete) => {
    const [division, level] = dialogType.split('-');
    dispatch({
      type: ACTION_TYPES.DELETE,
      payload: { division, level, item: itemToDelete },
    });
    handleCloseDialog();
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const allDetails = [
      ...detail.penalty.level1,
      ...detail.penalty.level2,
      ...detail.reward.level1,
      ...detail.reward.level2,
    ];
    const changes = allDetails.filter((item) => item.action !== 'keep');

    if (!title) {
      enqueueSnackbar('제목을 입력해주세요.', { variant: 'warning' });
      return;
    }
    if (changes.length === 0 && isEditMode) {
      enqueueSnackbar('변경된 내용이 없습니다.', { variant: 'info' });
      return;
    }

    const payload = {
      master: {
        adjustmentMasterId: isEditMode
          ? initialData.master.adjustmentMasterId
          : null,
        title,
        remark,
      },
      detail: {
        level1: [...detail.penalty.level1, ...detail.reward.level1].filter(
          (item) => item.action !== 'keep',
        ),
        level2: [...detail.penalty.level2, ...detail.reward.level2].filter(
          (item) => item.action !== 'keep',
        ),
      },
    };

    console.log('Save payload:', payload);
    enqueueSnackbar('저장 API는 아직 구현되지 않았습니다.', {
      variant: 'info',
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">
          {isEditMode ? '감/가점 기준 수정' : '감/가점 기준 등록'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/hr/evaluation/adjustment')}
          >
            목록
          </Button>
          <Button variant="contained" type="submit">
            저장
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          기본 정보
        </Typography>

        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="제목"
              sx={{ flex: 1 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="비고"
              multiline
              rows={1}
              sx={{ flex: 2 }}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Stack>
        </Stack>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack spacing={2} flex={1} overflow="auto">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">감점</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenAddDialog('penalty-level1')}
                >
                  항목 추가
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenAddDialog('penalty-level2')}
                  disabled={
                    detail.penalty.level1.filter((i) => i.action !== 'delete')
                      .length === 0
                  }
                >
                  내용 추가
                </Button>
              </Box>
            </Box>
            <AdjustmentTable
              label="감점"
              data={processedData.penalty}
              isEditable={true}
              onRowClick={(level, item) =>
                handleOpenEditDialog(`penalty-${level}`, item)
              }
            />
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6">가점</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenAddDialog('reward-level1')}
                >
                  항목 추가
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleOpenAddDialog('reward-level2')}
                  disabled={
                    detail.reward.level1.filter((i) => i.action !== 'delete')
                      .length === 0
                  }
                >
                  내용 추가
                </Button>
              </Box>
            </Box>
            <AdjustmentTable
              label="가점"
              data={processedData.reward}
              isEditable={true}
              onRowClick={(level, item) =>
                handleOpenEditDialog(`reward-${level}`, item)
              }
            />
          </Stack>
        </Paper>
      </Box>
      <AdjustmentFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        dialogType={dialogType}
        mode={dialogMode}
        initialData={editingItem}
        onSubmit={handleDialogSubmit}
        onDelete={handleDeleteItem}
        level1Option={
          dialogType.startsWith('penalty')
            ? detail.penalty.level1.filter((i) => i.action !== 'delete')
            : detail.reward.level1.filter((i) => i.action !== 'delete')
        }
      />
    </Box>
  );
}
