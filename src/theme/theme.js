import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // 시스템 컬러 모드 관련
  cssVariables: {
    colorSchemeSelector: 'class', // html.classList에 light/dark 클래스 추가
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        excel: {
          main: '#217346',
          light: '#219251',
          dark: '#145A32',
          contrastText: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        excel: {
          main: '#217346',
          light: '#219251',
          dark: '#145A32',
          contrastText: '#ffffff',
        },
      },
    },
  },

  // z-index 설정 추가 (ConfirmDialog나 Modal이 다른 UI 위에 보이게)
  zIndex: {
    appBar: 1100,
    drawer: 1200,
    modal: 1500, // 기본 1300 → 1500으로 올림
    snackbar: 1400,
    tooltip: 1600,
  },

  // 폰트 설정
  typography: {
    fontFamily: 'var(--font-pretendard), sans-serif',
  },
});
