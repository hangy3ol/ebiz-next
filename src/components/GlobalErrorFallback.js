'use client';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Typography, Button, Paper } from '@mui/material';

// 메인 레이아웃 공통 에러 표시
export default function GlobalErrorFallback({ error, reset }) {
  console.log(error);
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />

        <Typography variant="h6" fontWeight={600}>
          오류가 발생했습니다
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            whiteSpace: 'pre-line',
          }}
        >
          {
            '요청을 처리하는 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.'
          }
        </Typography>

        <Button variant="contained" onClick={reset}>
          다시 시도
        </Button>
      </Paper>
    </Box>
  );
}
