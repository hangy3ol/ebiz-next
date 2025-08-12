export function makeYearOptions({
  startYear,
  range = 2,
  mode = 'around', // 'around' | 'forward' | 'backward'
  order = 'desc', // 'asc' | 'desc'
} = {}) {
  const y = Number(startYear);
  const r = Number(range);

  if (!Number.isFinite(y)) {
    throw new Error('makeYearOptions: startYear가 필요합니다.');
  }
  if (!Number.isFinite(r) || r < 0) {
    throw new Error('makeYearOptions: range는 0 이상의 숫자여야 합니다.');
  }

  let from, to;
  switch (mode) {
    case 'forward':
      from = y;
      to = y + r;
      break;
    case 'backward':
      from = y - r;
      to = y;
      break;
    case 'around':
    default:
      from = y - r;
      to = y + r;
      break;
  }

  // 범위 내 연도 생성
  const years = [];
  for (let yr = from; yr <= to; yr++) {
    years.push(yr);
  }

  // 정렬
  years.sort((a, b) => (order === 'asc' ? a - b : b - a));

  // 출력 형식 변환
  return years.map((year) => ({
    id: String(year),
    name1: `${year}년`,
    name2: `${year}년`,
  }));
}
