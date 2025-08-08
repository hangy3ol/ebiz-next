import { NextResponse } from 'next/server';

import { authSchema } from '@/features/auth/schemas/authSchema';
import { login } from '@/features/auth/services/authService';
import { createSession } from '@/libs/auth/session';

export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = authSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: '입력값이 유효하지 않습니다.',
        },
        { status: 400 },
      );
    }

    // 검증 통과된 데이터로 로그인 처리
    const { userId, password } = parsed.data;
    const { success, result } = await login({ userId, password });

    if (!success) {
      return NextResponse.json(
        { success: false, message: '로그인에 실패했습니다.' },
        { status: 401 },
      );
    }

    const user = result;

    // 단일 session 토큰 생성 및 쿠키 설정
    await createSession(user);

    return NextResponse.json(
      {
        success,
        message: '로그인에 성공했습니다.',
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[LOGIN_API_ERROR]', error);

    return NextResponse.json(
      {
        success: false,
        message: '로그인 처리 중 문제가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
