'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

// 메인 레이아웃 공통 로딩바
export default function GlobalCircularProgress({
  message = '페이지 로딩 중...',
  size = 64,
}) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}
