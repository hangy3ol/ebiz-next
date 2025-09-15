'use client';

import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { confirm } from '@/common/utils/confirm';
import AdjustmentTable from '@/features/hr/evaluation/adjustment/components/AdjustmentTable';
import { processAdjustmentDetail } from '@/features/hr/evaluation/adjustment/utils/adjustmentMeta';

export default function AdjustmentCopyView({ initialData }) {
  const { master, detail } = initialData;
  const router = useRouter();

  const processedData = useMemo(() => {
    return processAdjustmentDetail(detail);
  }, [detail]); // 목록으로 돌아가는 핸들러

  const handleBackToList = () => {
    router.push('/popup/hr/evaluation/adjustment');
  }; // 이 기준을 복사하는 핸들러

  const handleCopy = async () => {
    const isConfirmed = await confirm({
      title: '감/가점 기준 복사',
      content:
        '기존 내용은 삭제되고, 선택한 기준의 항목이 적용됩니다. 최종 저장은 등록 화면에서 완료해야 합니다. 계속하시겠습니까?',
    });

    if (isConfirmed) {
      if (
        window.opener &&
        typeof window.opener.handleCopyCallback === 'function'
      ) {
        // 부모 창의 콜백 함수를 호출하며 전체 데이터를 전달
        window.opener.handleCopyCallback(initialData); // 작업 완료 후 팝업 창을 닫음
        window.close();
      } else {
        alert('데이터를 적용할 부모 창을 찾을 수 없습니다.');
      }
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
        <Typography variant="h4">감/가점 기준 상세</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text" onClick={handleBackToList}>
            목록
          </Button>

          <Button variant="contained" onClick={handleCopy}>
            복사하기
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
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {master.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          비고: {master.remark || '-'}
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Stack spacing={2}>
            <Typography variant="h6">감점</Typography>

            <AdjustmentTable data={processedData.penalty} isEditable={false} />
            <Divider />
            <Typography variant="h6">가점</Typography>

            <AdjustmentTable data={processedData.reward} isEditable={false} />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
