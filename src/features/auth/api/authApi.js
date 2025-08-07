import axiosClient from '@/libs/axios/client';

// 로그인
export async function loginApi({ userId, password }) {
  const response = await axiosClient.post('/api/auth/login', {
    userId,
    password,
  });
  return response.data;
}

// 비밀번호 변경
export async function updatePasswordApi({ currentPassword, newPassword }) {
  const response = await axiosClient.post('/api/auth/update-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
}

// 로그아웃
export async function logoutApi() {
  const response = await axiosClient.post('/api/auth/logout');
  return response.data;
}
