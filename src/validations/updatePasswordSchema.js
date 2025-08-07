import { z } from 'zod';

// 비밀번호 변경 검증 스키마
export const passwordRule = z
  .string()
  .min(8, '8자리 이상 입력해야 합니다.')
  .regex(/[A-Za-z]/, '알파벳을 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 포함해야 합니다.')
  .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다.');
export const updatePasswordSchema = z
  .object({
    currentPassword: passwordRule,
    newPassword: passwordRule,
    confirmPassword: z.string().nonempty('비밀번호 확인이 필요합니다.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 일치하지 않습니다.',
  });

// 서버 액션 검증
export const updatePasswordServerSchema = z.object({
  currentPassword: passwordRule,
  newPassword: passwordRule,
});
