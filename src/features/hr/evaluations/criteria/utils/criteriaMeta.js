// detail 트리에 파생 메타(rowSpan, totalRatio)를 "최초 1회 전면" 계산해 부착합니다.
export function computeDetailMeta(detail = [], decimals = 2) {
  const pow = Math.pow(10, decimals);

  // 안전한 숫자 변환
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // 반올림
  const round = (n) => Math.round(toNumber(n) * pow) / pow;

  // lv1 계층
  const lv1Arr = (detail || [])
    .filter((lv1) => lv1?.action !== 'delete')
    .map((lv1) => {
      // lv2 계층
      const lv2Arr = (lv1.children || [])
        .filter((lv2) => lv2?.action !== 'delete')
        .map((lv2) => {
          // lv3 계층
          const lv3Arr = (lv2.children || [])
            .filter((lv3) => lv3?.action !== 'delete')
            .map((lv3) => ({
              ...lv3,
              ratio: toNumber(lv3.ratio, 0), // 숫자 정규화
            }));

          const lv2TotalRatio = round(
            lv3Arr.reduce((sum, n) => sum + n.ratio, 0),
          );
          const lv2RowSpan = lv3Arr.length || 1;

          return {
            ...lv2,
            children: lv3Arr,
            totalRatio: lv2TotalRatio,
            rowSpan: lv2RowSpan,
          };
        });

      const lv1TotalRatio = round(
        lv2Arr.reduce((sum, n) => sum + toNumber(n.totalRatio, 0), 0),
      );

      const lv1RowSpan = lv2Arr.length
        ? lv2Arr.reduce((sum, n) => sum + toNumber(n.rowSpan, 0), 0)
        : 1;

      return {
        ...lv1,
        children: lv2Arr,
        totalRatio: lv1TotalRatio,
        rowSpan: lv1RowSpan,
      };
    });

  return lv1Arr;
}
