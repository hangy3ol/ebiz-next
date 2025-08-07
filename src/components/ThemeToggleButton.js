'use client';

import { LightMode, DarkMode } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { memo, useCallback } from 'react';

const ThemeToggleButton = () => {
  const { mode, setMode } = useColorScheme();

  // mode가 바뀔 때만 재생성, 문자열 직접 전달
  const handleToggle = useCallback(() => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
  }, [mode, setMode]);

  return (
    <Tooltip
      title={`테마 전환 (${mode === 'light' ? '다크 모드' : '라이트 모드'})`}
    >
      <IconButton onClick={handleToggle} color="inherit">
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};

export default memo(ThemeToggleButton);
