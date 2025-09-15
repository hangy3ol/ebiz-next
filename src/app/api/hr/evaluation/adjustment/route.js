import { NextResponse } from 'next/server';

import { saveAdjustment } from '@/features/hr/evaluation/adjustment/services/adjustmentService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

// [수정] 감/가점 기준 저장(등록/수정)
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    const payload = await request.json();
    const executedBy = user.userId;

    const { success, result } = await saveAdjustment(payload, executedBy);

    return NextResponse.json(
      {
        success,
        message: '감/가점 기준이 정상적으로 저장되었습니다.',
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('감/가점 기준 저장 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: '감/가점 기준 저장에 실패했습니다.' },
      { status: 500 },
    );
  }
}
