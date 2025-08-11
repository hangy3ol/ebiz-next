import axiosClient from '@/libs/axios/client';

// 공지사항 목록 조회
export async function fetchNoticeListApi() {
  const response = await axiosClient.get('/api/notices');
  return response.data;
}

// 공지사항 저장(등록, 수정)
export async function saveNoticeApi(formData) {
  const response = await axiosClient.post('/api/notices', formData);
  return response.data;
}

// 공지사항 삭제
export async function deleteNoticeApi(noticeId) {
  const response = await axiosClient.delete('/api/notices', {
    data: { noticeId },
  });
  return response.data;
}
