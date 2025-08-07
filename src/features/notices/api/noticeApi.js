import axiosClient from '@/libs/axios/client';

// 공지사항 목록 조회
export async function fetchNoticeListApi() {
  const response = await axiosClient.get('/api/notices');
  return response.data;
}
