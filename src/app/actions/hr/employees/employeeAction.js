'use server';

import { revalidatePath } from 'next/cache';

import {
  fetchEmployeeList,
  syncEmployeesFromDis,
} from '@/services/hr/employees/employeeService';

// 직원목록 조회 서버액션
export async function fetchEmployeeListAction(params) {
  return await fetchEmployeeList(params);
}

// 직원 정보 DIS 동기화 서버액션
export async function syncEmployeesFromDisAction(params) {
  const response = await syncEmployeesFromDis(params);
  if (response.success) {
    revalidatePath('/hr/employees');
  }

  return response;
}
