import { NextResponse } from 'next/server';

import { syncEmployeesFromDis } from '@/features/hr/employess/services/employeeService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '인증 정보가 없습니다.', data: null },
        { status: 401 },
      );
    }
    const executedBy = user.userId;

    const { success } = await syncEmployeesFromDis({ executedBy });

    return NextResponse.json(
      {
        success,
        message: '직원 정보를 성공적으로 동기화하였습니다.',
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[POST /api/hr/employees/sync] 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '직원 정보 동기화 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}
