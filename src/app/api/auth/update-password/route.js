import { NextResponse } from 'next/server';

import { updatePassword } from '@/features/auth/service/authService';
import { verifyJwt } from '@/libs/auth/session';
import { updatePasswordServerSchema } from '@/validations/updatePasswordSchema';

export async function POST(req) {
  try {
    const body = await req.json();

    // 입력값 유효성 검사
    const parsed = updatePasswordServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: '입력값이 유효하지 않습니다.' },
        { status: 400 },
      );
    }

    // 세션에서 사용자 정보 추출
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    let user;
    try {
      user = await verifyJwt(token);
    } catch {
      return NextResponse.json(
        { success: false, message: '세션이 만료되었거나 유효하지 않습니다.' },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // 실제 비즈니스 로직 호출
    const { success, message } = await updatePassword({
      currentPassword,
      newPassword,
      userId: user.userId,
    });

    return NextResponse.json({ success, message }, { status: 200 });
  } catch (error) {
    console.error('[UPDATE_PASSWORD_API_ERROR]', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
      },
      { status: 400 },
    );
  }
}
