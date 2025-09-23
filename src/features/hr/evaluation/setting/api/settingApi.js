import axiosClient from '@/libs/axios/client';

export async function saveSettingApi(payload) {
  // payload를 body에 담아 POST 요청
  const response = await axiosClient.post(
    '/api/hr/evaluation/setting',
    payload,
  );
  // axios는 응답 데이터를 data 속성에 담아 반환
  return response.data;
}
