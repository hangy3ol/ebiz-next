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
import { useEffect, useMemo, useReducer, useState, useCallback } from 'react';

import { saveAdjustmentApi } from '@/features/hr/evaluation/adjustment/api/adjustmentApi';
import AdjustmentFormDialog from '@/features/hr/evaluation/adjustment/components/AdjustmentFormDialog';
import AdjustmentTable from '@/features/hr/evaluation/adjustment/components/AdjustmentTable';
import {
  ACTION_TYPES,
  adjustmentReducer,
  initialAdjustmentState,
} from '@/features/hr/evaluation/adjustment/hooks/adjustmentReducer';
import { validateAdjustment } from '@/features/hr/evaluation/adjustment/utils/adjustmentValidator';

export default function AdjustmentForm({ initialData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = !!initialData;

  const [adjustmentMasterId, setAdjustmentMasterId] = useState(null);
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');
  const [detail, dispatch] = useReducer(
    adjustmentReducer,
    initialAdjustmentState,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogMode, setDialogMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null); // [추가] 팝업에서 복사된 데이터를 받아 Form의 상태를 업데이트하는 콜백 함수

  const handleCopyCallback = useCallback(
    (copiedData) => {
      const { master, detail: detailData } = copiedData;
      setTitle(`[복사] ${master.title}` || '');
      setRemark(master.remark || '');

      const transformToInsert = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((item) => ({
          ...item,
          id: undefined,
          action: 'insert',
        }));
      };

      dispatch({
        type: ACTION_TYPES.REPLACE_ALL,
        payload: {
          penalty: {
            level1: transformToInsert(
              detailData.level1.filter((i) => i.division === 'penalty'),
            ),
            level2: transformToInsert(
              detailData.level2.filter((i) => i.division === 'penalty'),
            ),
          },
          reward: {
            level1: transformToInsert(
              detailData.level1.filter((i) => i.division === 'reward'),
            ),
            level2: transformToInsert(
              detailData.level2.filter((i) => i.division === 'reward'),
            ),
          },
        },
      });

      enqueueSnackbar('감/가점 기준이 복사되었습니다.', {
        variant: 'success',
      });
    },
    [dispatch, enqueueSnackbar],
  ); // [추가] 부모 창(현재 Form)의 window 객체에 콜백 함수를 등록

  useEffect(() => {
    window.handleCopyCallback = handleCopyCallback; // 컴포넌트가 언마운트될 때 window 객체에서 콜백 함수를 제거
    return () => {
      delete window.handleCopyCallback;
    };
  }, [handleCopyCallback]);

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
  }, [detail]); // [수정] 기존 useEffect 로직을 isEditMode일 경우로 한정

  useEffect(() => {
    if (isEditMode && initialData) {
      const { master, detail: detailData } = initialData;
      setAdjustmentMasterId(master.adjustmentMasterId);
      setTitle(master.title || '');
      setRemark(master.remark || '');

      const transformToKeep = (arr) =>
        arr.map((item) => ({ ...item, action: 'keep' }));

      dispatch({
        type: ACTION_TYPES.REPLACE_ALL, // [수정] Reducer와 통일성을 위해 KEEP 대신 REPLACE_ALL 사용
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
      type: dialogMode === 'add' ? ACTION_TYPES.INSERT : ACTION_TYPES.UPDATE, // [수정] item 객체 생성 시 level 정보를 숫자 형태로 포함시킵니다.
      payload: {
        division,
        level,
        item: { ...formData, level: level === 'level1' ? 1 : 2 },
      },
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

    const validationResult = validateAdjustment(detail);
    if (!validationResult.isValid) {
      enqueueSnackbar(validationResult.message, { variant: 'error' });
      return;
    }

    const allDetails = [
      ...detail.penalty.level1,
      ...detail.penalty.level2,
      ...detail.reward.level1,
      ...detail.reward.level2,
    ];

    const hasNoChanges =
      isEditMode && allDetails.every((item) => item.action === 'keep');

    if (!title) {
      enqueueSnackbar('제목을 입력해주세요.', { variant: 'warning' });
      return;
    }
    if (hasNoChanges) {
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
        level1: [...detail.penalty.level1, ...detail.reward.level1],
        level2: [...detail.penalty.level2, ...detail.reward.level2],
      },
    };

    try {
      const result = await saveAdjustmentApi(payload);

      if (result.success) {
        enqueueSnackbar(result.message, { variant: 'success' });
        router.push(`/hr/evaluation/adjustment/${result.data.masterId}`);
      } else {
        throw new Error(result.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }; // [추가] 복사 버튼 클릭 시 팝업 열기 핸들러

  const handleCopyClick = () => {
    const popupWidth = 800;
    const popupHeight = 600;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    window.open(
      // [수정] 쿼리 파라미터로 현재 ID 전달 (수정 모드일 때만)
      `/popup/hr/evaluation/adjustment${
        adjustmentMasterId ? `?adjustmentMasterId=${adjustmentMasterId}` : ''
      }`,
      'adjustmentCopyPopup',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );
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

          <Button variant="outlined" onClick={handleCopyClick}>
            복사
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
              size="small"
              sx={{ flex: 1 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="비고"
              size="small"
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
