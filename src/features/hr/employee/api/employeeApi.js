import axiosClient from '@/libs/axios/client';

// 직원 목록 조회
export async function fetchEmployeeListApi(params) {
  const response = await axiosClient.get('/api/hr/employee', { params });
  return response.data;
}

// 직원 정보 DIS 동기화
export async function syncEmployeesFromDisApi(params = {}) {
  const response = await axiosClient.post('/api/hr/employee/sync', params);
  return response.data;
}
