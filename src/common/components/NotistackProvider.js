'use client';

import { SnackbarProvider } from 'notistack';

export default function NotistackProvider({ children }) {
  return (
    // variant 종류별 의미 및 사용 예시:
    // - 'success' : 성공적인 작업 완료 (예: 저장 완료, 로그인 성공)
    // - 'error'   : 실패, 오류 발생 (예: 로그인 실패, 서버 에러)
    // - 'warning' : 주의가 필요한 상태 (예: 삭제 경고, 남은 시간 알림)
    // - 'info'    : 단순 정보 안내 (예: 공지사항, 기능 설명)
    // - 'default' : 특별한 스타일 없이 기본 텍스트만 표시 (예: 단순 메시지 로그, 빠른 안내)
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={3000}
      preventDuplicate
    >
      {children}
    </SnackbarProvider>
  );
}
