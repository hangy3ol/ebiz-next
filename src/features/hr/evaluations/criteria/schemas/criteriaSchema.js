import { z } from 'zod';

// 평가기준 검증 스키마
export const criteriaSchema = z.object({
  jobGroupCode: z
    .string({ required_error: '직군은 필수 입력 항목입니다.' })
    .trim()
    .min(1, '직군은 필수 입력 항목입니다.'),
  jobTitleCode: z
    .string({ required_error: '직책은 필수 입력 항목입니다.' })
    .trim()
    .min(1, '직책은 필수 입력 항목입니다.'),
  title: z
    .string({ required_error: '제목은 필수 입력 항목입니다.' })
    .trim()
    .min(1, '제목은 필수 입력 항목입니다.'),
});

// 평가기준 레벨1 스키마 (구분)
export const criteriaLevel1Schema = z.object({
  name: z
    .string({ required_error: '구분명은 필수 입력입니다.' })
    .trim()
    .min(1, '구분명은 필수 입력입니다.'),
  score: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined; // 빈 값 -> required 에러 유도
      if (typeof v === 'string') {
        const s = v.trim();
        if (s === '') return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : s; // 잘못된 숫자는 invalid_type 에러
      }
      return v;
    },
    z
      .number({
        required_error: '점수는 필수 입력입니다.',
        invalid_type_error: '숫자만 입력할 수 있습니다.',
      })
      .max(100, { message: '100 이하로 입력해주세요.' }),
  ),
  sortOrder: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return null; // 빈 값 -> null 허용
      if (typeof v === 'string') {
        const s = v.trim();
        if (s === '') return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : s;
      }
      return v;
    },
    z
      .number({ invalid_type_error: '숫자만 입력할 수 있습니다.' })
      .min(1, { message: '정렬 순서는 1 이상의 숫자여야 합니다.' })
      .nullable(),
  ),
});

// 평가기준 레벨2 스키마 (평가항목)
export const criteriaLevel2Schema = z.object({
  parentId: z
    .string({ required_error: '구분 선택은 필수입니다.' })
    .trim()
    .min(1, '구분 선택은 필수입니다.'),
  name: z
    .string({ required_error: '평가항목명은 필수 입력입니다.' })
    .trim()
    .min(1, '평가항목명은 필수 입력입니다.'),
  sortOrder: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return null;
      if (typeof v === 'string') {
        const s = v.trim();
        if (s === '') return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : s;
      }
      return v;
    },
    z
      .number({ invalid_type_error: '숫자만 입력할 수 있습니다.' })
      .min(1, { message: '정렬 순서는 1 이상의 숫자여야 합니다.' })
      .nullable(),
  ),
});

// 평가기준 레벨3 스키마 (평가지표)
export const criteriaLevel3Schema = z.object({
  rootId: z
    .string({ required_error: '구분 선택은 필수입니다.' })
    .trim()
    .min(1, '구분 선택은 필수입니다.'),
  parentId: z
    .string({ required_error: '평가항목 선택은 필수입니다.' })
    .trim()
    .min(1, '평가항목 선택은 필수입니다.'),
  name: z
    .string({ required_error: '평가지표명은 필수 입력입니다.' })
    .trim()
    .min(1, '평가지표명은 필수 입력입니다.'),
  ratio: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined; // 빈 값 -> required 에러
      if (typeof v === 'string') {
        const s = v.trim();
        if (s === '') return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : s;
      }
      return v;
    },
    z
      .number({
        required_error: '적용비율은 필수 입력입니다.',
        invalid_type_error: '숫자만 입력할 수 있습니다.',
      })
      .max(100, { message: '100 이하로 입력해주세요.' }),
  ),
  sortOrder: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return null;
      if (typeof v === 'string') {
        const s = v.trim();
        if (s === '') return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : s;
      }
      return v;
    },
    z
      .number({ invalid_type_error: '숫자만 입력할 수 있습니다.' })
      .min(1, { message: '정렬 순서는 1 이상의 숫자여야 합니다.' })
      .nullable(),
  ),
});
