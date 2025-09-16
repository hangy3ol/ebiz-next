// 객체의 키를 스네이크 케이스에서 카멜 케이스로 변환하는 함수
export function convertCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertCamelCase);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      // [a-z] -> [a-z0-9]로 변경하여 숫자도 처리하도록 수정
      const camelKey = key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
      acc[camelKey] = convertCamelCase(value);
      return acc;
    }, {});
  }

  return obj;
}
