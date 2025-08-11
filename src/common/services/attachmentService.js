import { db } from '@/libs/db';
import { convertCamelCase } from '@/utils/caseConverter';
import { executeWithTransaction } from '@/utils/executeWithTransaction';

// 첨부파일 단건 조회
export async function getAttachmentById(fileId) {
  try {
    const sql = `
      SELECT
        id,
        original_file_name AS name,
        file_path AS filePath,
        mime_type AS mime_type,
        file_size AS file_size
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
  parentId,
  parentType,
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    // 쿼리 파라미터 값들을 동적으로 구성
    const values = [];
    const replacements = {};

    filesMetadata.forEach((metadata, index) => {
      // 새로운 attachments 테이블 컬럼에 맞게 VALUES 구문 수정
      values.push(`(
        :parentType${index}, :parentId${index}, :originalFileName${index}, :storedFileName${index},
        :filePath${index}, :mimeType${index}, :fileExtension${index}, :fileSize${index}, :createdBy${index}
      )`);

      // parentType과 parentId를 replacements 객체에 추가
      replacements[`parentType${index}`] = parentType;
      replacements[`parentId${index}`] = parentId;
      replacements[`originalFileName${index}`] = metadata.originalFileName;
      replacements[`storedFileName${index}`] = metadata.storedFileName;
      replacements[`filePath${index}`] = metadata.filePath;
      replacements[`mimeType${index}`] = metadata.mimeType;
      replacements[`fileExtension${index}`] = metadata.fileExtension;
      replacements[`fileSize${index}`] = metadata.fileSize;
      replacements[`createdBy${index}`] = executedBy;
    });

    // 테이블명과 컬럼 목록을 새로운 스키마에 맞게 변경
    const query = `
      INSERT INTO ${db.ebiz}.attachments (
        parent_type, parent_id, original_file_name, stored_file_name, file_path,
        mime_type, file_extension, file_size, created_by
      ) VALUES ${values.join(', ')};
    `;

    // 쿼리 실행
    await db.sequelize.query(query, {
      replacements,
      type: db.sequelize.QueryTypes.INSERT,
      transaction: trx,
    });
  }, transaction);
}
