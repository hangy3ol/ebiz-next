export function matchIncludes(row, keyword, fields) {
  if (!keyword) return true;
  const trimmedKeyword = keyword.trim().toLowerCase();

  // 검색 대상 필드의 값만 합치기
  const content = fields
    .map((field) => {
      const value = row[field];
      return value != null ? String(value) : ''; // null 또는 undefined인 경우 빈 문자열로 처리
    })
    .join(' ')
    .toLowerCase();

  // 반각 → 전각 변환 로직은 키워드에만 적용 (성능 최적화)
  const toFullWidth = (str) =>
    str.replace(/[A-Za-z0-9]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0xfee0),
    );

  const fullWidthKeyword = toFullWidth(trimmedKeyword);

  // 동일하면 한 번만 검사, 아니면 둘 다 검사
  // 숫자 키워드에 대한 별도 처리 로직은 제거 (일반 로직으로 충분)
  return trimmedKeyword === fullWidthKeyword
    ? content.includes(trimmedKeyword)
    : content.includes(trimmedKeyword) || content.includes(fullWidthKeyword);
}

export function matchEquals(value, filterValue) {
  return !filterValue || value === filterValue;
}
