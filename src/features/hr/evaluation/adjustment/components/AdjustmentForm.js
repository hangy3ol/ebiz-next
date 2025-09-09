'use client';

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import AdjustmentTable from '@/features/hr/evaluation/adjustment/components/AdjustmentTable';
import { processAdjustmentDetail } from '@/features/hr/evaluation/adjustment/utils/adjustmentMeta';

export default function AdjustmentForm({ initialData }) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');
  const [processedData, setProcessedData] = useState({
    penalty: { level1: [], level2: [] },
    reward: { level1: [], level2: [] },
  });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEditMode && initialData) {
      const { master, detail } = initialData;
      setTitle(master.title || '');
      setRemark(master.remark || '');
      // [수정] 상세 데이터를 가공하여 상태에 설정하는 로직을 기존 useEffect에 통합
      setProcessedData(processAdjustmentDetail(detail));
    }
  }, [isEditMode, initialData]);

  const handleRowClick = (level, item) => {
    console.log('Clicked:', level, item);
    // 추후 다이얼로그를 여는 로직이 여기에 들어갑니다.
  };

  return (
    <Box
      component="form"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
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
          <Typography variant="h4">
            {isEditMode ? '감/가점 기준 수정' : '감/가점 기준 등록'}
          </Typography>
        </Stack>

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
          기본 정보
        </Typography>

        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="제목"
              sx={{ flex: 1 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="비고"
              multiline // [수정] 여러 줄 입력이 가능하도록 변경
              rows={1}
              sx={{ flex: 2 }}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Stack>
        </Stack>

        {/* 테이블 영역 */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Stack spacing={2}>
            <AdjustmentTable
              label="감점"
              data={processedData.penalty} // [수정] 가공된 데이터와 연결
              isEditable={true}
              onRowClick={handleRowClick}
            />

            <Divider />

            <AdjustmentTable
              label="가점"
              data={processedData.reward} // [수정] 가공된 데이터와 연결
              isEditable={true}
              onRowClick={handleRowClick}
            />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
