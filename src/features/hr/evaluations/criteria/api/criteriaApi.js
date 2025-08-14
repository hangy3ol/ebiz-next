import axiosClient from '@/libs/axios/client';

export async function saveCriteriaApi(payload) {
  const response = await axiosClient.post(
    '/api/hr/evaluations/criteria',
    payload,
  );
  return response.data;
}

export async function deleteCriteriaApi({ criteriaMasterId }) {
  const response = await axiosClient.delete('/api/hr/evaluations/criteria', {
    data: { criteriaMasterId },
  });
  return response.data;
}
