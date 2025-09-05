// Score, Ratio 등 숫자 관련 규칙의 유효성을 검증합니다. (실시간 검증용)
export const validateScoreAndRatio = (detail) => {
  const { level1, level2 } = detail;
  const errors = [];

  // 삭제되지 않은 유효한 항목들만 필터링
  const validLv1 = level1.filter((item) => item.action !== 'delete');
  const validLv2 = level2.filter((item) => item.action !== 'delete');

  // 조건 1: level1 score 총합이 100을 초과하면 오류
  const totalScore = validLv1.reduce(
    (sum, lv1) => sum + Number(lv1.score ?? 0),
    0,
  );
  if (totalScore > 100) {
    errors.push('구분 점수의 총합은 100을 초과할 수 없습니다.');
  }

  // 조건 2: 각 level1 하위의 level2 ratio 합이 100을 초과하면 오류
  for (const lv1 of validLv1) {
    const childLv2 = validLv2.filter((lv2) => lv2.parentId === lv1.id);
    const totalRatio = childLv2.reduce(
      (sum, lv2) => sum + Number(lv2.ratio ?? 0),
      0,
    );

    if (totalRatio > 100) {
      errors.push(
        `구분 '${lv1.name}'의 평가항목 비율 합계가 100을 초과했습니다. (현재: ${totalRatio})`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

// 데이터의 계층 구조 및 무결성을 검증합니다. (최종 저장용)
export const validateHierarchy = (detail) => {
  const { level1, level2, level3 } = detail;
  const errors = [];

  const validLv1 = level1.filter((item) => item.action !== 'delete');
  const validLv2 = level2.filter((item) => item.action !== 'delete');
  const validLv3 = level3.filter((item) => item.action !== 'delete');

  // 조건 3-1: 평가항목(level2)이 유효한 구분(level1)과 연결되지 않은 경우
  const lv2WithoutParent = validLv2.filter(
    (lv2) => !validLv1.some((lv1) => lv1.id === lv2.parentId),
  );
  if (lv2WithoutParent.length > 0) {
    const names = lv2WithoutParent.map((item) => `"${item.name}"`).join(', ');
    errors.push(`평가항목 ${names}이(가) 유효한 구분에 연결되지 않았습니다.`);
  }

  // 조건 3-2: 평가지표(level3)가 유효한 평가항목(level2)과 연결되지 않은 경우
  const lv3WithoutParent = validLv3.filter(
    (lv3) => !validLv2.some((lv2) => lv2.id === lv3.parentId),
  );
  if (lv3WithoutParent.length > 0) {
    const names = lv3WithoutParent.map((item) => `"${item.name}"`).join(', ');
    errors.push(
      `평가지표 ${names}이(가) 유효한 평가항목에 연결되지 않았습니다.`,
    );
  }

  // 조건 3-3: 평가지표(level3)가 없는 평가항목(level2)이 있는 경우
  const lv2WithoutChild = validLv2.filter(
    (lv2) => !validLv3.some((lv3) => lv3.parentId === lv2.id),
  );
  if (lv2WithoutChild.length > 0) {
    const names = lv2WithoutChild.map((item) => `"${item.name}"`).join(', ');
    errors.push(`평가항목 ${names}에 연결된 평가지표가 없습니다.`);
  }

  // 조건 3-4: 평가항목(level2)이 없는 구분(level1)이 있는 경우
  const lv1WithoutChild = validLv1.filter(
    (lv1) => !validLv2.some((lv2) => lv2.parentId === lv1.id),
  );
  if (lv1WithoutChild.length > 0) {
    const names = lv1WithoutChild.map((item) => `"${item.name}"`).join(', ');
    errors.push(`구분 ${names}에 연결된 평가항목가 없습니다.`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};
