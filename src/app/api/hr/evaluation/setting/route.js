// [신규] 파일 신규 생성

import { NextResponse } from 'next/server';

// [추가] 평가 설정 저장을 위한 서비스 함수 임포트
import { saveSetting } from '@/features/hr/evaluation/setting/services/settingService';
// [추가] 현재 로그인된 사용자 정보를 가져오는 함수 임포트
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

/**
 * 평가 설정 저장(신규 등록/수정) API
 * @param {Request} request
 */
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
    const { success, settingMasterId } = await saveSetting(payload, executedBy);

    // 성공 응답 반환
    return NextResponse.json(
      {
        success,
        message: '평가 설정이 정상적으로 저장되었습니다.',
        data: { settingMasterId }, // 결과 데이터 포함
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
