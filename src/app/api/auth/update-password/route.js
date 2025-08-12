import { NextResponse } from 'next/server';

import { updatePasswordServerSchema } from '@/features/auth/schemas/updatePasswordSchema';
import { updatePassword } from '@/features/auth/services/authService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

export async function POST(req) {
  try {
    const body = await req.json();

    // 입력값 유효성 검사
    const parsed = updatePasswordServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: '입력값이 유효하지 않습니다.', data: null },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // 사용자 정보 얻기
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.', data: null },
        { status: 401 },
      );
    }

    // 실제 비즈니스 로직 호출
    const { success } = await updatePassword({
      currentPassword,
      newPassword,
      excutedBy: user.userId,
    });

    return NextResponse.json(
      { success, message: '비밀번호가 성공적으로 변경되었습니다.', data: null },
      { status: 200 },
    );
  } catch (error) {
    console.error('[UPDATE_PASSWORD_API_ERROR]', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 400 },
    );
  }
}
