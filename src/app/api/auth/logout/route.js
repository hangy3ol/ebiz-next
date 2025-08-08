import { NextResponse } from 'next/server';

import { deleteSession } from '@/libs/auth/session';

export async function POST() {
  try {
    await deleteSession(); // 세션 쿠키 삭제

    return NextResponse.json(
      {
        success: true,
        message: '정상적으로 로그아웃 처리되었습니다.',
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[LOGOUT_API_ERROR]', error);

    return NextResponse.json(
      {
        success: false,
        message: '로그아웃 처리 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}
