import { NextResponse } from 'next/server';

import { fetchEmployeeList } from '@/features/hr/employee/services/employeeService';

// 직원 목록 조회
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const { success, result } = await fetchEmployeeList({ includeAll });

    return NextResponse.json(
      {
        success,
        message: '직원 목록을 성공적으로 조회하였습니다.',
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[fetchNoticeListApi] 오류:', error);

    return NextResponse.json(
      {
        success: false,
        message: '직원 목록 조회 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}
