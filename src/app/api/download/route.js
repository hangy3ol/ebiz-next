import fs from 'fs'; // 파일 시스템 접근을 위한 Node.js 모듈
import path from 'path'; // 파일 경로 처리를 위한 Node.js 모듈

import { NextResponse } from 'next/server'; // Next.js 서버 응답 객체

import { getAttachmentById } from '@/common/services/attachmentService'; // DB에서 첨부파일 정보를 조회하는 공통 서비스

// 환경 변수에서 파일 업로드 기본 경로를 가져옴
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || 'uploads/';

export async function GET(req) {
  // GET 요청 핸들러
  try {
    const { searchParams } = new URL(req.url); // 요청 URL에서 쿼리 파라미터 추출
    const fileId = searchParams.get('fileId'); // 'fileId' 파라미터 값 추출

    if (!fileId) {
      // fileId가 없는 경우
      return NextResponse.json(
        // 400 Bad Request 응답
        { message: 'File ID is required.' },
        { status: 400 },
      );
    }

    const result = await getAttachmentById(fileId); // 첨부파일 ID로 DB 정보 조회

    if (!result.success || !result.file) {
      // 조회 실패 시
      return NextResponse.json({ message: 'File not found.' }, { status: 404 }); // 404 Not Found 응답
    }

    const fileMetadata = result.file; // 조회된 파일 메타데이터

    // UPLOAD_BASE_DIR과 DB 경로를 결합하여 서버의 실제 파일 경로를 생성
    const fullFilePath = path.join(
      process.cwd(),
      UPLOAD_BASE_DIR,
      fileMetadata.filePath,
    );
    const originalFileName = fileMetadata.name; // 다운로드될 파일명

    if (!fs.existsSync(fullFilePath)) {
      // 실제 파일이 서버에 존재하지 않는 경우
      return NextResponse.json(
        // 404 Not Found 응답
        { message: 'File not found on server.' },
        { status: 404 },
      );
    }

    const fileBuffer = fs.readFileSync(fullFilePath); // 파일을 버퍼로 읽어옴

    const headers = new Headers(); // 응답 헤더 설정
    headers.set('Content-Type', fileMetadata.mimeType); // 파일의 MIME 타입 설정
    headers.set('Content-Length', fileMetadata.fileSize); // 파일 크기 설정
    headers.set(
      // 다운로드 파일명 설정
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(originalFileName)}"`,
    );

    return new NextResponse(fileBuffer, { headers }); // 파일 버퍼와 헤더를 포함한 응답 반환
  } catch (error) {
    // 예외 발생 시
    console.error('File download error:', error); // 에러 로그 출력
    return NextResponse.json(
      // 500 Internal Server Error 응답
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
