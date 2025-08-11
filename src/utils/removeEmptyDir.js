const fs = require('fs').promises; // Node.js 비동기 파일 시스템 모듈
const path = require('path'); // 경로 관련 내장 모듈

// 파일 삭제 후 상위 디렉토리가 비어 있으면 디렉토리를 제거하는 함수
const removeEmptyDir = async (filePath) => {
  try {
    const dirPath = path.dirname(filePath); // 파일의 상위 디렉토리 경로 추출
    const uploadBaseDir = path.join(
      process.cwd(),
      process.env.UPLOAD_BASE_DIR || 'uploads',
    ); // 최상위 업로드 디렉토리 기준 설정

    if (!dirPath.startsWith(uploadBaseDir)) {
      return; // 업로드 경로 범위 외라면 삭제 시도하지 않음
    }

    const files = await fs.readdir(dirPath); // 상위 디렉토리 안의 파일 목록 조회
    if (files.length === 0) {
      await fs.rmdir(dirPath); // 디렉토리가 비어 있으면 삭제
      console.log('빈 디렉토리 삭제 완료: ', dirPath);
    }
  } catch (error) {
    console.warn('빈 디렉토리 삭제 중 오류 발생: ', error.message); // 실패해도 경고만 출력
  }
};

module.exports = removeEmptyDir; // 외부에서 사용할 수 있게 모듈 내보내기
