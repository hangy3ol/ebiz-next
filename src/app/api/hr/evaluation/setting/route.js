import { NextResponse } from 'next/server';

import {
  saveSetting,
  deleteSetting,
} from '@/features/hr/evaluation/setting/services/settingService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

// 평가 설정 저장(신규 등록/수정) API
export async function POST(request) {
  // try-catch 블록으로 예외 처리
  try {
    // 현재 사용자 정보 확인
    const user = await getCurrentUser();
    // 사용자가 없으면 401 Unauthorized 에러 반환
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    // 요청 본문에서 payload(master, detail 데이터) 추출
    const payload = await request.json();
    // 실행자 ID 설정
    const executedBy = user.userId;

    // 서비스 함수 호출하여 데이터 저장
    const { success } = await saveSetting(payload, executedBy);

    // 성공 응답 반환
    return NextResponse.json(
      {
        success,
        message: '평가 설정이 정상적으로 저장되었습니다.',
        data: {},
      },
      { status: 200 },
    );
  } catch (error) {
    // 오류 발생 시 콘솔에 로그 기록
    console.error('평가 설정 저장 중 오류 발생:', error);
    // 실패 응답 반환
    return NextResponse.json(
      { success: false, message: '평가 설정 저장에 실패했습니다.' },
      { status: 500 },
    );
  }
}

// 평가 설정 삭제 API
export async function DELETE(request) {
  try {
    // 사용자 인증
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.' },
        { status: 401 },
      );
    }

    // 요청 본문에서 ID 추출
    const { settingMasterId } = await request.json();

    // ID 유효성 검사
    if (!settingMasterId) {
      return NextResponse.json(
        { success: false, message: '삭제할 대상의 ID가 필요합니다.' },
        { status: 400 },
      );
    }

    // 서비스 함수 호출
    const { success } = await deleteSetting({ settingMasterId });

    // 성공 응답 반환
    return NextResponse.json(
      { success, message: '평가 설정이 정상적으로 삭제되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('평가 설정 삭제 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '삭제 처리 중 서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
