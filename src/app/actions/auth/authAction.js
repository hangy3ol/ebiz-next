'use server';

import { login, updatePassword, logout } from '@/services/auth/authService';
import { response } from '@/utils/response';
import { loginSchema } from '@/validations/loginSchema';
import { updatePasswordServerSchema } from '@/validations/updatePasswordSchema';

// 로그인 서버액션
export async function loginAction(params) {
  const { success } = loginSchema.safeParse(params);
  if (!success) {
    return response.fail('유효성 검증 실패: 입력 값을 확인해주세요.', null);
  }

  return await login(params);
}

// 비밀번호 변경 서버액션
export async function updatePasswordAction(params) {
  const { success } = updatePasswordServerSchema.safeParse(params);
  if (!success) {
    return response.fail('유효성 검증 실패: 입력 값을 확인해주세요.', null);
  }

  return await updatePassword(params);
}

// 로그아웃 서버액션
export async function logoutAction() {
  await logout();
}
