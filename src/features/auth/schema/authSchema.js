import { z } from 'zod';

// 로그인 아이디 검증 스키마
export const authSchema = z.object({
  userId: z
    .string() // 입력값은 문자열이어야 함
    .regex(/^(ADMIN|\d{5})$/, '아이디는 5자리 숫자여야 합니다.') // 정규식 검사 적용
    .nonempty('아이디를 입력하세요.'), // 필수 입력 검증

  password: z.string().nonempty('비밀번호를 입력하세요.'), // 필수 입력 검증
});
