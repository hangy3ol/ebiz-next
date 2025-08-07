// theme/ThemeProvider.js
'use client';

import { CssBaseline } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { theme } from '@/theme/theme';

export default function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider
      theme={theme}
      defaultMode="system" // 1) 시스템 설정
      colorSchemeSelector="class" // 2) class 기반 토글
      attribute="class" // 3) html 클래스를 light/dark로 설정
      modeStorageKey="mui-mode" // 로컬스토리지 key
      colorSchemeStorageKey="mui-color-scheme"
    >
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}
