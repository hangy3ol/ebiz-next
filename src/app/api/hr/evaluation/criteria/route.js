import { NextResponse } from 'next/server';

import {
  saveCriteria,
  deleteCriteria,
} from '@/features/hr/evaluation/criteria/services/criteriaService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

// 평가기준 저장(등록/수정)
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

    const { success, result } = await saveCriteria(payload, executedBy);

    return NextResponse.json(
      {
        success,
        message: '평가기준이 정상적으로 저장되었습니다.',
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('평가기준 저장 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: '평가기준 저장에 실패했습니다.' },
      { status: 500 },
    );
  }
}

// 평가기준 삭제
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    const { criteriaMasterId } = await request.json();
    if (!criteriaMasterId) {
      return NextResponse.json(
        { success: false, message: '삭제할 평가 기준 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    const { success } = await deleteCriteria(criteriaMasterId);

    return NextResponse.json(
      { success, message: '평가기준이 정상적으로 삭제되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('평가기준 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, message: '평가기준 삭제에 실패했습니다.' },
      { status: 500 },
    );
  }
}
