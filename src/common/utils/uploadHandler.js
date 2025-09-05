import fs from 'fs/promises';
import path from 'path';

import { format } from 'date-fns';
import { nanoid } from 'nanoid';

// 주어진 파일들을 지정된 경로에 저장하고, 저장된 파일의 메타데이터를 반환
export async function uploadHandler(files, destinationDir) {
  // 환경 변수에서 기본 업로드 경로를 가져오고, 없으면 'uploads'를 기본값으로 사용
  const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || 'uploads';

  // 현재 날짜를 'yyyyMMdd' 형식으로 포맷하여 날짜 폴더명으로 사용
  const todayFolder = format(new Date(), 'yyyyMMdd');

  // 최종 업로드 경로 설정 (예: uploads/notice/20250808)
  const uploadDir = path.join(
    process.cwd(),
    UPLOAD_BASE_DIR,
    destinationDir,
    todayFolder,
  );
  const fileMetadataList = [];

  try {
    // 최종 저장 경로에 해당하는 디렉터리가 없으면 재귀적으로 생성
    await fs.mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      // 파일 객체에서 메타데이터 추출
      const originalFileName = file.name;
      const extension = path.extname(originalFileName);
      const mimeType = file.type;
      const size = file.size;

      // nanoid를 사용해 짧고 안전한 고유 ID 생성
      const storedFileName = `${nanoid()}${extension}`;

      // DB에 저장될 상대 경로 생성 (예: 'notice/20250808/xxxx.txt')
      const filePath = path.join(destinationDir, todayFolder, storedFileName);

      // 클라이언트에서 받은 파일 데이터를 버퍼로 변환
      const buffer = await file.arrayBuffer();
      const fileData = Buffer.from(buffer);

      // 최종 저장 경로에 파일 데이터를 기록
      await fs.writeFile(
        path.join(process.cwd(), UPLOAD_BASE_DIR, filePath),
        fileData,
      );

      // DB 저장을 위한 메타데이터 객체를 배열에 추가
      fileMetadataList.push({
        originalFileName,
        storedFileName,
        path: filePath.replace(/\\/g, '/'), // URL 호환성을 위해 경로 구분자를 변경
        mimeType,
        extension,
        size,
      });
    }

    // 모든 파일의 메타데이터 배열 반환
    return fileMetadataList;
  } catch (error) {
    // 파일 업로드 중 오류 발생 시 로깅하고 에러를 throw
    console.error('파일 업로드 중 오류 발생:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
}
