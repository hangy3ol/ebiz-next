import * as yup from 'yup';

// 평가기준 검증 스키마
export const criteriaSchema = yup.object({
  year: yup.string().required('평가 연도는 필수 선택 항목입니다.'),
  jobGroupCode: yup.string().required('직군은 필수 입력 항목입니다.'),
  jobTitleCode: yup.string().required('직책은 필수 입력 항목입니다.'),
  title: yup.string().required('제목은 필수 입력 항목입니다.'),
});

// 평가기준 레벨1 스키마 (구분)
export const criteriaLevel1Schema = yup.object({
  name: yup.string().required('구분명은 필수 입력입니다.'),
  score: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? undefined : value,
    )
    .required('점수는 필수 입력입니다.')
    .typeError('숫자만 입력할 수 있습니다.')
    .max(100, '100 이하로 입력해주세요.'),
  sortOrder: yup
    .number()
    .typeError('숫자만 입력할 수 있습니다.')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    )
    .min(1, '정렬 순서는 1 이상의 숫자여야 합니다.'),
});

// 평가기준 레벨2 스키마 (평가항목)
export const criteriaLevel2Schema = yup.object({
  parentId: yup.string().required('구분 선택은 필수입니다.'),
  name: yup.string().required('평가항목명은 필수 입력입니다.'),
  sortOrder: yup
    .number()
    .typeError('숫자만 입력할 수 있습니다.')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    )
    .min(1, '정렬 순서는 1 이상의 숫자여야 합니다.'),
});

// 평가기준 레벨3 스키마 (평가지표)
export const criteriaLevel3Schema = yup.object({
  rootId: yup.string().required('구분 선택은 필수입니다.'),
  parentId: yup.string().required('평가항목 선택은 필수입니다.'),
  name: yup.string().required('평가지표명은 필수 입력입니다.'),
  ratio: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? undefined : value,
    )
    .required('적용비율은 필수 입력입니다.')
    .typeError('숫자만 입력할 수 있습니다.')
    .max(100, '100 이하로 입력해주세요.'),
  sortOrder: yup
    .number()
    .typeError('숫자만 입력할 수 있습니다.')
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === '' ? null : value,
    )
    .min(1, '정렬 순서는 1 이상의 숫자여야 합니다.'),
});
