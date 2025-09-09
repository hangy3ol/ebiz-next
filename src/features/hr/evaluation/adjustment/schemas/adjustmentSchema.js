import * as yup from 'yup';

// 항목(level1) 스키마
export const adjustmentLevel1Schema = yup.object().shape({
  name: yup.string().required('항목명을 입력해주세요.'),
  guideline: yup.string(),
  // [수정] sortOrder를 선택 사항으로 변경
  sortOrder: yup
    .number()
    .typeError('숫자만 입력 가능합니다.')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    ),
});

// 내용(level2) 스키마
export const adjustmentLevel2Schema = yup.object().shape({
  parentId: yup.string().required('항목을 선택해주세요.'),
  name: yup.string().required('내용을 입력해주세요.'),
  score: yup
    .number()
    .typeError('숫자만 입력 가능합니다.')
    .required('점수를 입력해주세요.'),
  duplicateLimit: yup.number().required('중복구분을 선택해주세요.'),
  // [수정] sortOrder를 선택 사항으로 변경
  sortOrder: yup
    .number()
    .typeError('숫자만 입력 가능합니다.')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    ),
});
