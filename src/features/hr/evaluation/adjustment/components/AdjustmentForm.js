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
import { useState, useEffect } from 'react'; // [추가]

import AdjustmentTable from '@/features/hr/evaluation/adjustment/components/AdjustmentTable'; // [수정] AdjustmentEditableTable 대신 재사용

export default function AdjustmentForm({ initialData }) {
  const router = useRouter();
  const isEditMode = !!initialData;

  // [추가] '제목', '비고'를 위한 상태 추가
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');

  // [추가] 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEditMode && initialData) {
      const { master } = initialData;
      setTitle(master.title || '');
      setRemark(master.remark || '');
    }
  }, [isEditMode, initialData]);

  // [추가] 테이블 행 클릭 핸들러 (추후 로직 구현)
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            기본 정보
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            {/* [수정] value와 onChange를 바인딩 */}
            <TextField
              label="제목"
              sx={{ flex: 1 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {/* [수정] value와 onChange를 바인딩 */}
            <TextField
              label="비고"
              rows={2}
              sx={{ flex: 2 }}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </Stack>
        </Stack>

        {/* 테이블 영역 */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Stack spacing={2}>
            {/* [수정] isEditable과 onRowClick prop 전달 */}
            <AdjustmentTable
              label="감점"
              data={{ level1: [], level2: [] }} // 임시 데이터
              isEditable={true}
              onRowClick={handleRowClick}
            />

            <Divider />

            {/* [수정] isEditable과 onRowClick prop 전달 */}
            <AdjustmentTable
              label="가점"
              data={{ level1: [], level2: [] }} // 임시 데이터
              isEditable={true}
              onRowClick={handleRowClick}
            />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
