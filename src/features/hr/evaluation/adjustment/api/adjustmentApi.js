import axiosClient from '@/libs/axios/client';

// [추가] 감/가점 기준 저장 API 호출
export async function saveAdjustmentApi(payload) {
  const response = await axiosClient.post(
    '/api/hr/evaluation/adjustment',
    payload,
  );
  return response.data;
}

// [최종 수정] 감/가점 기준 삭제 API - ID를 request body로 전달 (Criteria 패턴)
export async function deleteAdjustmentApi(adjustmentMasterId) {
  const response = await axiosClient.delete('/api/hr/evaluation/adjustment', {
    data: { adjustmentMasterId },
  });
  return response.data;
}
