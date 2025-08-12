'use client';

import { useConfirmStore } from '@/common/stores/useConfirmStore';

// 전역 confirm 다이얼로그 호출 함수
export function confirm({ title, content }) {
  return useConfirmStore.getState().show({ title, content });
}
