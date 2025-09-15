import axiosClient from '@/libs/axios/client';

// [추가] 감/가점 기준 저장 API 호출
export async function saveAdjustmentApi(payload) {
  const response = await axiosClient.post(
    '/api/hr/evaluation/adjustment',
    payload,
  );
  return response.data;
}
