'use client';

import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import { confirm } from '@/common/utils/confirm';
import { deleteCriteriaApi } from '@/features/hr/evaluation/criteria/api/criteriaApi';
import CriteriaTable from '@/features/hr/evaluation/criteria/components/CriteriaTable';

export default function CriteriaView({ initialData }) {
  const { master, detail } = initialData;

  // 훅
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // 수정
  const handleEdit = () => {
    router.push(`/hr/evaluation/criteria/${master.criteriaMasterId}/edit`);
  };

  // 삭제
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
        title: '평가 기준 삭제',
        content:
          '정말 이 평가 기준을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
      });

      if (isConfirmed) {
        const { success, message } = await deleteCriteriaApi({
          criteriaMasterId: master.criteriaMasterId,
        });

        if (success) {
          enqueueSnackbar(message, { variant: 'success' });
          router.push('/hr/evaluation/criteria');
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
          <Typography variant="h4">평가 기준 상세</Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="text"
            onClick={() => router.push('/hr/evaluation/criteria')}
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

        {/* 작성 정보 */}
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            비고: {master.remark || '-'}
          </Typography>
        </Stack>

        {/* 본문 */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <CriteriaTable
            detail={detail}
            containerSx={{ maxHeight: '100%' }}
            isEditable={false}
          />
        </Paper>
      </Box>
    </Box>
  );
}
