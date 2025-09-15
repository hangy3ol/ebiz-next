import { NextResponse } from 'next/server';

import {
  saveAdjustment,
  deleteAdjustment,
} from '@/features/hr/evaluation/adjustment/services/adjustmentService';
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

// [최종 수정] 감/가점 기준 삭제 - request body에서 ID 추출 (Criteria 패턴)
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    const { adjustmentMasterId } = await request.json();

    if (!adjustmentMasterId) {
      return NextResponse.json(
        { success: false, message: '삭제할 대상의 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    const { success } = await deleteAdjustment(adjustmentMasterId);

    return NextResponse.json(
      { success, message: '감/가점 기준이 정상적으로 삭제되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('감/가점 기준 삭제 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '삭제 처리 중 서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
