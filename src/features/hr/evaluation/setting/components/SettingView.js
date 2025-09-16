'use client';

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SettingView({ initialData }) {
  const router = useRouter();
  const { master, detail, criteriaList, adjustmentList, employeeList } =
    initialData || {};

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* 1. 페이지 헤더 (CriteriaView 참조) */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {master?.id ? '평가 설정 상세' : '평가 설정 등록'}
        </Typography>
        <Button variant="text" onClick={() => router.push('/hr/setting')}>
          목록
        </Button>
      </Stack>

      {/* 2. 본문 */}
      <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* 본문 헤더 (master.title + 액션 버튼) */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold" noWrap>
            {master?.title || '제목 없음'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained">수정</Button>
            <Button variant="outlined" color="error">
              삭제
            </Button>
          </Box>
        </Stack>

        {/* 3. 메인 컨텐츠 영역 (3단 그리드) */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            p: 2,
            gap: 2,
            overflow: 'auto',
          }}
        >
          {/* 첫 번째 열 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box variant="outlined" sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                1. 평가기준 선택
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">
                  (평가기준 그리드)
                </Typography>
              </Box>
            </Box>

            <Box variant="outlined" sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                2. 감/가점 기준 선택
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">
                  (감/가점 기준 그리드)
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* 두 번째 열 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box variant="outlined" sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                3. 대상자 선택
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">(대상자 그리드)</Typography>
              </Box>
            </Box>

            <Box variant="outlined" sx={{}}>
              <Typography variant="subtitle2" fontWeight="medium">
                4. 평가자 선택
              </Typography>
              <Box sx={{ pt: 1, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  (평가자 선택 영역)
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* 세 번째 열 */}
          <Box variant="outlined" sx={{ flex: 2 }}>
            <Typography variant="subtitle2" fontWeight="medium">
              5. 평가설정 목록
            </Typography>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">
                (최종 설정 목록 그리드)
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}
