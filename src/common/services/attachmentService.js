import fs from 'fs/promises';
import path from 'path';

import { db } from '@/libs/db';
import { convertCamelCase } from '@/common/utils/caseConverter';
import { executeWithTransaction } from '@/common/utils/executeWithTransaction';
import removeEmptyDir from '@/common/utils/removeEmptyDir';

// 첨부파일 단건 조회
export async function getAttachmentById(fileId) {
  try {
    const sql = `
      SELECT
        id,
        original_file_name AS name,
        path,
        mime_type AS mime_type,
        size
      FROM ${db.ebiz}.attachments
      WHERE id = :fileId;
    `;

    const file = await db.sequelize.query(sql, {
      replacements: {
        fileId,
      },
      type: db.sequelize.QueryTypes.SELECT,
      plain: true, // 단일 결과 반환
    });

    return { success: true, file: convertCamelCase(file) };
  } catch (error) {
    console.error('Error fetching attachment by ID:', error);
    throw error;
  }
}

// 첨부파일 추가
export async function insertAttachment(
  filesMetadata,
  parentType,
  parentId,
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    // 쿼리 파라미터 값들을 동적으로 구성
    const values = [];
    const replacements = {};
    console.log(filesMetadata, parentId, parentType);
    filesMetadata.forEach((metadata, index) => {
      // 새로운 attachments 테이블 컬럼에 맞게 VALUES 구문 수정
      values.push(`(
        :parentType${index}, :parentId${index}, :originalFileName${index}, :storedFileName${index},
        :path${index}, :mimeType${index}, :extension${index}, :size${index}, :createdBy${index}
      )`);

      // parentType과 parentId를 replacements 객체에 추가
      replacements[`parentType${index}`] = parentType;
      replacements[`parentId${index}`] = parentId;
      replacements[`originalFileName${index}`] = metadata.originalFileName;
      replacements[`storedFileName${index}`] = metadata.storedFileName;
      replacements[`path${index}`] = metadata.path;
      replacements[`mimeType${index}`] = metadata.mimeType;
      replacements[`extension${index}`] = metadata.extension;
      replacements[`size${index}`] = metadata.size;
      replacements[`createdBy${index}`] = executedBy;
    });

    // 테이블명과 컬럼 목록을 새로운 스키마에 맞게 변경
    const sql = `
      INSERT INTO ${db.ebiz}.attachments (
        parent_type, parent_id, original_file_name, stored_file_name,
        path, mime_type, extension, size, created_by
      ) VALUES ${values.join(', ')};
    `;

    // 쿼리 실행
    await db.sequelize.query(sql, {
      replacements,
      type: db.sequelize.QueryTypes.INSERT,
      transaction: trx,
    });
  }, transaction);
}

// 첨부파일 삭제(선택한 파일만)
export async function deleteAttachment(
  parentType,
  fileIds,
  transaction = null,
) {
  let filesToDelete = [];

  await executeWithTransaction(async (trx) => {
    // 1. 삭제할 파일 목록 조회
    filesToDelete = await db.sequelize.query(
      `
        SELECT 
          path, 
          stored_file_name AS storedFileName,
          extension
        FROM ${db.ebiz}.attachments
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
        DELETE FROM ${db.ebiz}.attachments
        WHERE parent_type = :parentType
        AND id IN (:fileIds);
      `,
      {
        replacements: { parentType, fileIds },
        type: db.sequelize.QueryTypes.DELETE,
        transaction: trx,
      },
    );
  }, transaction); // 트랜잭션 여기까지 커밋 완료

  // 3. (DB 삭제 후) 실제 파일 삭제
  for (const file of filesToDelete) {
    const fullPath = path.join(
      process.cwd(),
      process.env.UPLOAD_BASE_DIR || 'uploads',
      file.path,
    );
    try {
      await fs.unlink(fullPath);
      console.log('파일 삭제 성공: ', fullPath);

      await removeEmptyDir(fullPath); // 빈 디렉토리 삭제 시도
    } catch (err) {
      console.warn('파일 삭제 실패: ', fullPath, err.message);
    }
  }
}

// 모든 첨부파일 삭제(게시글 삭제 시)
export async function deleteAllAttachment(
  parentType,
  parentId,
  transaction = null,
) {
  let filesToDelete = [];

  await executeWithTransaction(async (trx) => {
    // 1. 삭제할 파일 경로 조회
    filesToDelete = await db.sequelize.query(
      `
        SELECT
          path,
          stored_file_name AS storedFileName,
          extension
        FROM ${db.ebiz}.attachments
        WHERE parent_type = :parentType 
        AND parent_id = :parentId;
      `,
      {
        replacements: { parentType, parentId },
        type: db.sequelize.QueryTypes.SELECT,
        transaction: trx,
      },
    );

    // 2. 메타데이터 삭제 (DB에서 삭제)
    await db.sequelize.query(
      `
        DELETE FROM ${db.ebiz}.attachments
        WHERE parent_type = :parentType  
        AND parent_id = :parentId;
      `,
      {
        replacements: { parentType, parentId },
        type: db.sequelize.QueryTypes.DELETE,
        transaction: trx,
      },
    );
  }, transaction); // 트랜잭션 여기까지 완료 (commit)

  // 3. 파일 삭제 (커밋 완료 후)
  for (const file of filesToDelete) {
    const fullPath = path.join(
      process.cwd(),
      process.env.UPLOAD_BASE_DIR || 'uploads',
      file.path,
    );
    try {
      await fs.unlink(fullPath);
      console.log('파일 삭제 성공: ', fullPath);

      await removeEmptyDir(fullPath); // 빈 디렉토리 삭제 시도
    } catch (err) {
      console.warn('파일 삭제 실패: ', fullPath, err.message);
    }
  }
}
