// 위험 확장자 목록 (업로드 금지)
export const BLOCKED_EXTENSIONS = [
  // 실행 파일 - 악성 코드 실행 위험
  '.exe',
  '.msi',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.pif',
  '.cpl',

  // 스크립트 파일 - XSS, 서버 제어 가능성
  '.js',
  '.vbs',
  '.ps1',
  '.wsf',
  '.jse',
  '.asp',
  '.php',
  '.py',
  '.sh',
  '.pl',

  // HTML/XML 파일 - XSS 및 위장 페이지 위험
  '.html',
  '.htm',
  '.xhtml',
  '.xml',

  // 자바 클래스/압축 실행 - 코드 삽입 우회 가능성
  '.jar',
  '.class',
  '.apk',

  // 기타 서버사이드 포함 위험
  '.jsp',
  '.aspx',
  '.cgi',
];
