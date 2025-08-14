import axiosClient from '@/libs/axios/client';

export async function saveCriteriaApi(payload) {
  const response = await axiosClient.post(
    '/api/hr/evaluations/criteria',
    payload,
  );
  return response.data;
}
