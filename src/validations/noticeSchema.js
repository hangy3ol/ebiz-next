// 공지사항 검증 스키마
import { z } from 'zod';

export const noticeSchema = z.object({
  title: z.string().nonempty('제목은 필수 입력 항목입니다.'),
  content: z.string().nonempty('내용은 필수 입력 항목입니다.'),
});
