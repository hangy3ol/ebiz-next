export const processAdjustmentDetail = (detail) => {
  // division('penalty' 또는 'reward') 기준으로 데이터를 필터링하고 rowSpan을 계산하는 함수
  const processDivision = (division) => {
    const filteredLv1 = detail.level1.filter(
      (item) => item.division === division,
    );
    const filteredLv2 = detail.level2.filter(
      (item) => item.division === division,
    );

    // level1 항목에 rowSpan 값을 계산하여 추가
    const level1WithRowSpan = filteredLv1.map((lv1) => {
      const childrenCount = filteredLv2.filter(
        (lv2) => lv2.parentId === lv1.id,
      ).length;
      return {
        ...lv1,
        rowSpan: Math.max(childrenCount, 1), // 자식이 없어도 1
      };
    });

    return { level1: level1WithRowSpan, level2: filteredLv2 };
  };

  // 'penalty'와 'reward' 데이터를 각각 가공
  return {
    penalty: processDivision('penalty'),
    reward: processDivision('reward'),
  };
};
