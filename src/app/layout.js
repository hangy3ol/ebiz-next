import './globals.css';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import localFont from 'next/font/local';

import ConfirmDialog from '@/components/ConfirmDialog';
import NotistackProvider from '@/components/NotistackProvider';
import ThemeProvider from '@/theme/ThemeProvider';

// Pretendard 폰트 정의
const pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/Pretendard/Pretendard-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Pretendard/Pretendard-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-pretendard',
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${pretendard.className}`}
      suppressHydrationWarning
    >
      <body>
        {/* InitColorSchemeScript: 로컬스토리지 → 시스템 설정 → 기본 모드(defaultMode) 순서로 컬러 모드 결정 */}
        <InitColorSchemeScript attribute="class" />
        <ThemeProvider>
          <NotistackProvider>{children}</NotistackProvider>
          <ConfirmDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}
