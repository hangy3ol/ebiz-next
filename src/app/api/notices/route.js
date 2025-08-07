import { NextResponse } from 'next/server';

import { fetchNoticeList } from '@/features/notices/services/noticeService';

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
      { success: false, message: '공지사항 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
