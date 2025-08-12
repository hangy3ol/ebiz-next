'use client';

import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

import CriteriaTable from '@/features/hr/evaluations/criteria/components/CriteriaTable';

export default function CriteriaDetail({ initialData }) {
  const { master, detail } = initialData;

  // 훅
  const router = useRouter();

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
            onClick={() => router.push('/hr/evaluations/criteria')}
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
            <Button variant="contained">수정</Button>
            <Button variant="outlined" color="error">
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
          <CriteriaTable detail={detail} />
        </Paper>
      </Box>
    </Box>
  );
}
