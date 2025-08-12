// 공통 유틸: Blob 데이터를 클라이언트에서 파일로 다운로드 시키는 헬퍼 함수
export function triggerFileDownload(rawData, fileName) {
  // Blob으로 변환 (바이너리 데이터를 받아서 Blob으로 처리)
  const blob = new Blob([rawData]);

  // Blob을 임시 URL 객체로 생성
  const url = window.URL.createObjectURL(blob);

  // <a> 엘리먼트를 만들어서 링크 설정
  const link = document.createElement('a');
  link.href = url; // 생성한 Blob URL을 링크로 설정
  link.download = fileName; // 다운로드될 파일명 지정
  link.click(); // 클릭 이벤트로 다운로드 트리거

  // 메모리 누수 방지를 위해 사용한 URL 객체 해제
  window.URL.revokeObjectURL(url);
}

// 공통 유틸: 파일 이름의 확장자가 금지 목록에 포함되어 있는지 확인하는 함수
import { BLOCKED_EXTENSIONS } from '@/common/constants/blockedExtensions';

export function isBlockedExtension(fileName = '') {
  // 파일명에서 마지막 점(.)의 위치를 찾음 (확장자 시작 위치)
  const dotIndex = fileName.lastIndexOf('.');

  // 점이 없거나, 점으로 끝나는 경우 → 확장자가 없는 것으로 간주하고 차단하지 않음
  if (dotIndex === -1 || dotIndex === fileName.length - 1) {
    return false;
  }

  // 확장자를 추출하고 소문자로 변환 (예: ".EXE" → ".exe")
  const extension = fileName.slice(dotIndex).toLowerCase();

  // 금지된 확장자 목록에 포함되어 있는지 확인
  return BLOCKED_EXTENSIONS.includes(extension);
}

export function formatFileSize(bytes, fractionDigits = 2) {
  // 인자가 숫자가 아니거나 NaN이면 0 B 반환
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';

  // 단위 정의: B → KB → MB → GB → TB
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];

  // 사이즈 초기화
  let size = bytes;

  // 단위 인덱스 (초기값: B)
  let unitIndex = 0;

  // size가 1024 이상이면 다음 단위로 변환 반복 (예: 1024 → 1 KB)
  while (size >= 1024 && unitIndex < units.length - 1) {
    size = size / 1024;
    unitIndex++;
  }

  // 지정된 소수점 자리수로 반올림 후 단위와 함께 문자열 반환
  return `${size.toFixed(fractionDigits)} ${units[unitIndex]}`;
}
