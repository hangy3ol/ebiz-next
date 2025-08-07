'use server';

import path from 'path';

import { format } from 'date-fns';

import { authGuard } from '@/libs/auth/authGuard';
import { saveNotice } from '@/services/notices/noticeService';
import { response } from '@/utils/response';
import { noticeSchema } from '@/validations/noticeSchema';

// 공지사항 저장(등록, 수정)
export async function saveNoticeAction(formData) {
  const currentUser = await authGuard();

  const noticeString = formData.get('notice');
  const notice = JSON.parse(noticeString);

  const { success } = noticeSchema.safeParse(notice);
  if (!success) {
    return response.fail('유효성 검증 실패: 입력 값을 확인해주세요.', null);
  }

  const rawFiles = formData.getAll('files');
  // 인서트하기 쉽도록 선처리
  const files = await Promise.all(
    rawFiles.map(async (file) => {
      const now = new Date();
      const dateStr = format(now, 'yyyyMMdd'); // 예: 20250806
      const timestamp = format(now, 'yyyyMMdd_HHmmss_SSS'); // 예: 20250806_143212_512
      const ext = path.extname(file.name).replace('.', '').toLowerCase(); // 예: xlsx
      const uuid = crypto.randomUUID().slice(0, 6); // 예: 9f2a3e

      const storedFileName = `${timestamp}_${uuid}.${ext}`;
      const filePath = `/uploads/notices/${dateStr}`;

      return {
        originalFileName: file.name,
        storedFileName,
        filePath,
        mimeType: file.type,
        fileExtension: ext,
        fileSize: file.size,
      };
    }),
  );

  const filesToDelete = formData.getAll('filesToDelete');

  return await saveNotice({ notice, files, filesToDelete }, currentUser.userId);
}

// 공지사항 첨부파일 추가
export async function insertNoticeAttachment(
  fileMetas,
  noticeId,
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    const values = [];
    const replacements = {};

    fileMetas.forEach((file, index) => {
      values.push(`(
        :noticeId${index}, :originalFileName${index}, :storedFileName${index}, :filePath${index},
        :mimeType${index}, :fileExtension${index}, :fileSize${index}, :createdBy${index}
      )`);
      replacements[`noticeId${index}`] = noticeId;
      replacements[`originalFileName${index}`] = file.originalFileName;
      replacements[`storedFileName${index}`] = file.storedFileName;
      replacements[`filePath${index}`] = file.filePath;
      replacements[`mimeType${index}`] = file.mimeType;
      replacements[`fileExtension${index}`] = file.fileExtension;
      replacements[`fileSize${index}`] = file.fileSize;
      replacements[`createdBy${index}`] = executedBy;
    });

    const query = `
      INSERT INTO ${db.ebiz}.notice_attachments (
        notice_id, original_file_name, stored_file_name, file_path,
        mime_type, file_extension, file_size, created_by
      ) VALUES ${values.join(', ')};
    `;

    await db.sequelize.query(query, {
      replacements,
      type: db.sequelize.QueryTypes.INSERT,
      transaction: trx,
    });
  }, transaction);
}

// 공지사항 삭제
export async function deleteNotice(noticeId) {
  return await executeWithTransaction(async (transaction) => {
    const result = await db.sequelize.query(
      `
        DELETE FROM ${db.ebiz}.notices
        WHERE id = :noticeId;
      `,
      {
        replacements: { noticeId },
        type: db.sequelize.QueryTypes.DELETE,
        transaction,
      },
    );

    await deleteNoticeAttachmentAll(noticeId, transaction);

    return { success: true, result: convertCamelCase(result) };
  });
}

// 공지사항 첨부파일 삭제(선택한 파일만)
export async function deleteNoticeAttachment(fileIds, transaction = null) {
  let filesToDelete = [];

  await executeWithTransaction(async (trx) => {
    // 1. 삭제할 파일 목록 조회
    filesToDelete = await db.sequelize.query(
      `
        SELECT 
          file_path AS filePath, 
          stored_file_name AS storedFileName,
          file_extension AS fileExtension
        FROM ${db.ebiz}.notice_attachments
        WHERE id IN (:fileIds);
      `,
      {
        replacements: { fileIds },
        type: db.sequelize.QueryTypes.SELECT,
        transaction: trx,
      },
    );

    // 2. DB 메타데이터 먼저 삭제
    await db.sequelize.query(
      `
        DELETE FROM ${db.ebiz}.notice_attachments
        WHERE id IN (:fileIds);
      `,
      {
        replacements: { fileIds },
        type: db.sequelize.QueryTypes.DELETE,
        transaction: trx,
      },
    );
  }, transaction); // 트랜잭션 여기까지 커밋 완료

  // 3. (DB 삭제 후) 실제 파일 삭제
  for (const file of filesToDelete) {
    const fullPath = path.join(
      process.cwd(),
      'src',
      process.env.UPLOAD_BASE_DIR || 'uploads',
      file.filePath,
      `${file.storedFileName}.${file.fileExtension}`,
    );
    try {
      await fsp.unlink(fullPath);
      console.log('파일 삭제 성공: ', fullPath);

      await removeEmptyDir(fullPath); // 빈 디렉토리 삭제 시도
    } catch (err) {
      console.warn('파일 삭제 실패: ', fullPath, err.message);
    }
  }
}

// 공지사항 모든 첨부파일 삭제(게시글 삭제 시)
export async function deleteNoticeAttachmentAll(noticeId, transaction = null) {
  let filesToDelete = [];

  await executeWithTransaction(async (trx) => {
    // 1. 삭제할 파일 경로 조회
    filesToDelete = await db.sequelize.query(
      `
        SELECT
          file_path AS filePath,
          stored_file_name AS storedFileName,
          file_extension AS fileExtension
        FROM ${db.ebiz}.notice_attachments
        WHERE notice_id = :noticeId;
      `,
      {
        replacements: { noticeId },
        type: db.sequelize.QueryTypes.SELECT,
        transaction: trx,
      },
    );

    // 2. 메타데이터 삭제 (DB에서 삭제)
    await db.sequelize.query(
      `
        DELETE FROM ${db.ebiz}.notice_attachments
        WHERE notice_id = :noticeId;
      `,
      {
        replacements: { noticeId },
        type: db.sequelize.QueryTypes.DELETE,
        transaction: trx,
      },
    );
  }, transaction); // 트랜잭션 여기까지 완료 (commit)

  // 3. 파일 삭제 (커밋 완료 후)
  for (const file of filesToDelete) {
    const fullPath = path.join(
      process.cwd(),
      'src',
      process.env.UPLOAD_BASE_DIR || 'uploads',
      file.filePath,
      `${file.storedFileName}.${file.fileExtension}`,
    );
    try {
      await fsp.unlink(fullPath);
      console.log('파일 삭제 성공: ', fullPath);

      await removeEmptyDir(fullPath); // 빈 디렉토리 삭제 시도
    } catch (err) {
      console.warn('파일 삭제 실패: ', fullPath, err.message);
    }
  }
}

// 공지사항 첨부파일 개별 다운로드
export async function downloadNoticeAttachment(fileId) {
  const [result] = await db.sequelize.query(
    `
      SELECT 
        original_file_name AS originalFileName,
        stored_file_name AS storedFileName,
        file_path AS filePath,
        file_extension AS fileExtension
      FROM ${db.ebiz}.notice_attachments
      WHERE id = :fileId;
    `,
    {
      replacements: { fileId },
      type: db.sequelize.QueryTypes.SELECT,
    },
  );

  if (!result) {
    throw createError('첨부파일이 존재하지 않습니다.', 404);
  }

  const fullPath = path.join(
    process.cwd(),
    'src',
    process.env.UPLOAD_BASE_DIR || 'uploads',
    result.filePath,
    `${result.storedFileName}.${result.fileExtension}`,
  );

  return {
    filePath: fullPath,
    fileName: result.originalFileName,
  };
}

// 공지사항 첨부파일 전체 다운로드
export async function downloadNoticeAttachmentAll(fileIds) {
  const result = await db.sequelize.query(
    `
      SELECT 
        original_file_name AS originalFileName,
        stored_file_name AS storedFileName,
        file_path AS filePath,
        file_extension AS fileExtension
      FROM ${db.ebiz}.notice_attachments
      WHERE id IN (:fileIds);
    `,
    {
      replacements: { fileIds },
      type: db.sequelize.QueryTypes.SELECT,
    },
  );

  if (!result || result.length === 0) {
    throw createError('첨부파일이 존재하지 않습니다.', 404);
  }

  // zip 임시 경로 설정
  const tempZipDir = path.join(process.cwd(), 'temp');
  await fsp.mkdir(tempZipDir, { recursive: true });

  // zip 파일명 → notice_attachment_<난수>.zip 형식
  const randomStr = Math.random().toString(36).substring(2, 10);
  const zipFileName = `notice_attachment_${randomStr}.zip`;
  const zipFilePath = path.join(tempZipDir, zipFileName);

  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  // 에러 핸들링
  archive.on('error', (err) => {
    throw err;
  });

  // 아카이브 파이프 연결
  archive.pipe(output);

  // 파일들을 zip에 추가
  for (const file of result) {
    const fileFullPath = path.join(
      process.cwd(),
      'src',
      process.env.UPLOAD_BASE_DIR || 'uploads',
      file.filePath,
      `${file.storedFileName}.${file.fileExtension}`,
    );

    archive.file(fileFullPath, { name: file.originalFileName });
  }

  // zip 생성 완료
  await archive.finalize();

  return {
    filePath: zipFilePath,
    fileName: zipFileName,
  };
}
