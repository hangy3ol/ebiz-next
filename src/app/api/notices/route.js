import { NextResponse } from 'next/server';

import {
  fetchNoticeList,
  saveNotice,
  deleteNotice,
} from '@/features/notices/services/noticeService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';
import { uploadHandler } from '@/common/utils/uploadHandler';

// 공지사항 목록 조회
export async function GET() {
  try {
    const { success, result } = await fetchNoticeList();

    return NextResponse.json(
      {
        success,
        message: '공지사항 목록을 성공적으로 조회하였습니다.',
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[fetchNoticeListApi] 오류:', error);

    return NextResponse.json(
      {
        success: false,
        message: '공지사항 목록 조회 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}

// 공지사항 저장(등록, 수정)
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.', data: null },
        { status: 401 },
      );
    }
    const executedBy = user.userId;

    const formData = await request.formData();

    // 1. 데이터 추출
    const noticeJson = formData.get('notice');
    const files = formData.getAll('files');
    const filesToDeleteJson = formData.get('filesToDelete');

    const notice = JSON.parse(noticeJson);
    const filesToDelete = filesToDeleteJson
      ? JSON.parse(filesToDeleteJson)
      : [];

    // 2. 파일 업로드 및 메타데이터 생성
    let filesMetadata = [];
    if (files.length > 0) {
      // 파일 업로드 공통 메서드 호출. 저장 경로를 지정해줍니다.
      filesMetadata = await uploadHandler(files, 'notices');
    }

    // 3. 비즈니스 로직 실행 (서비스 함수 호출)
    const { success } = await saveNotice(
      {
        notice,
        filesMetadata, // 가공된 파일 메타데이터 전달
        filesToDelete,
      },
      executedBy,
    );

    return NextResponse.json(
      { success, message: '공지사항이 정상적으로 저장되었습니다.', data: null },
      { status: 200 },
    );
  } catch (error) {
    console.error('공지사항 저장 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '공지사항 저장에 실패했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}

// 공지사항 삭제
export async function DELETE(request) {
  try {
    // 1. 사용자 인증 확인
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.', data: null },
        { status: 401 },
      );
    }

    // 2. 요청 본문에서 삭제할 ID 추출
    const { noticeId } = await request.json();
    if (!noticeId) {
      return NextResponse.json(
        {
          success: false,
          message: '삭제할 공지사항 ID가 필요합니다.',
          data: null,
        },
        { status: 400 },
      );
    }

    // 3. 공지사항 삭제 서비스 호출
    const { success } = await deleteNotice(noticeId);

    if (success) {
      return NextResponse.json(
        {
          success: true,
          message: '공지사항이 성공적으로 삭제되었습니다.',
          data: null,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('공지사항 삭제 중 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: '공지사항 삭제 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}
