const validateDivision = (divisionData, divisionName) => {
  const activeLevel1 = divisionData.level1.filter(
    (item) => item.action !== 'delete',
  );
  const activeLevel2 = divisionData.level2.filter(
    (item) => item.action !== 'delete',
  );

  const activeLevel1Ids = new Set(activeLevel1.map((item) => String(item.id)));

  // 검증 1: 연결되지 않은 level2 항목이 있는지 확인 (기존 로직)
  for (const lv2Item of activeLevel2) {
    if (activeLevel1Ids.size === 0) {
      return {
        isValid: false,
        message: `'${divisionName}' 영역에 상위 항목 없이 내용만 존재합니다.`,
      };
    }
    if (!activeLevel1Ids.has(String(lv2Item.parentId))) {
      return {
        isValid: false,
        message: `'${divisionName}' 영역에 연결되지 않은 내용 항목이 있습니다: ${lv2Item.name}`,
      };
    }
  }

  // [추가] 검증 2: 자식(level2)이 없는 level1 항목이 있는지 확인
  const parentIdsFromLevel2 = new Set(
    activeLevel2.map((item) => String(item.parentId)),
  );

  for (const lv1Item of activeLevel1) {
    if (!parentIdsFromLevel2.has(String(lv1Item.id))) {
      return {
        isValid: false,
        message: `'${divisionName}' 영역의 '${lv1Item.name}' 항목에 내용이 없습니다.`,
      };
    }
  }

  return { isValid: true, message: '유효성 검사 통과' };
};

export const validateAdjustment = (detail) => {
  // 감점 항목 검증
  const penaltyValidation = validateDivision(detail.penalty, '감점');
  if (!penaltyValidation.isValid) {
    return penaltyValidation;
  }

  // 가점 항목 검증
  const rewardValidation = validateDivision(detail.reward, '가점');
  if (!rewardValidation.isValid) {
    return rewardValidation;
  }

  return { isValid: true, message: '모든 항목이 유효합니다.' };
};
