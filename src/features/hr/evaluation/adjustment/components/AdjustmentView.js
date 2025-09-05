'use client';

import { Box, Typography, Button, Paper, Stack, Divider } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useMemo } from 'react';

import { confirm } from '@/common/utils/confirm';
import AdjustmentTable from '@/features/hr/evaluation/adjustment/components/AdjustmentTable';
import { processAdjustmentDetail } from '@/features/hr/evaluation/adjustment/utils/adjustmentMeta';
// import { deleteAdjustmentApi } from '@/features/hr/evaluation/adjustment/api/adjustmentApi'; // [예정] 추가될 API

export default function AdjustmentView({ initialData }) {
  const { master, detail } = initialData;

  // 훅
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // 데이터 가공
  const processedData = useMemo(() => {
    return processAdjustmentDetail(detail);
  }, [detail]);

  // 수정 페이지로 이동
  const handleEdit = () => {
    router.push(`/hr/evaluation/adjustment/${master.adjustmentMasterId}/edit`);
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (master.refCount > 0) {
      enqueueSnackbar(
        '다른 평가 설정에서 사용 중인 기준이라 삭제할 수 없습니다.',
        { variant: 'warning' },
      );
      return;
    }

    try {
      const isConfirmed = await confirm({
        title: '감/가점 기준 삭제',
        content:
          '정말 이 기준을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
      });

      if (isConfirmed) {
        // [예정] API 연동 필요
        // const { success, message } = await deleteAdjustmentApi({
        //   adjustmentMasterId: master.adjustmentMasterId,
        // });
        const success = false; // 임시
        const message = '아직 삭제 API가 구현되지 않았습니다.'; // 임시

        if (success) {
          enqueueSnackbar(message, { variant: 'success' });
          router.push('/hr/evaluation/adjustment');
        } else {
          enqueueSnackbar(message || '삭제에 실패했습니다.', {
            variant: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Delete failed', error);
      enqueueSnackbar('삭제 중 오류가 발생했습니다.', { variant: 'error' });
    }
  };

  return (
    // [수정] CriteriaView와 동일한 최상위 Box 구조
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          <Typography variant="h4">감/가점 기준 상세</Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="text"
            onClick={() => router.push('/hr/evaluation/adjustment')}
          >
            목록
          </Button>
        </Box>
      </Box>

      {/* 본문 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', flexShrink: 1, mr: 1 }}
          >
            {master.title}
          </Typography>

          {/* 수정, 삭제 버튼 그룹 */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained" onClick={handleEdit}>
              수정
            </Button>

            <Button variant="outlined" color="error" onClick={handleDelete}>
              삭제
            </Button>
          </Box>
        </Box>

        {/* 비고 정보 */}
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            비고: {master.remark || '-'}
          </Typography>
        </Stack>

        {/* [수정] 테이블 컨텐츠 영역 */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <AdjustmentTable label="감점" data={processedData.penalty} />

          <Divider />

          <AdjustmentTable label="가점" data={processedData.reward} />
        </Paper>
      </Box>
    </Box>
  );
}
