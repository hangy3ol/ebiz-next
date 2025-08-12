import {
  insertAttachment,
  deleteAttachment,
  deleteAllAttachment,
} from '@/common/services/attachmentService';
import { db } from '@/libs/db';
import { convertCamelCase } from '@/common/utils/caseConverter';
import { executeWithTransaction } from '@/common/utils/executeWithTransaction';

// 공지사항 목록 조회
export async function fetchNoticeList() {
  try {
    const sql = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY id DESC) AS row_num,
        id AS notice_id,
        title,
        content,
        created_by,
        fn_get_user_name(created_by) AS created_by_name,
        created_at,
        updated_by,
        fn_get_user_name(updated_by) AS updated_by_name,
        updated_at
      FROM ${db.ebiz}.notices;
		`;

    const raw = await db.sequelize.query(sql, {
      replacements: {},
      type: db.sequelize.QueryTypes.SELECT,
    });

    return { success: true, result: convertCamelCase(raw) };
  } catch (error) {
    console.error('[fetchNoticeList] 공지사항 목록 조회 실패:', error);
    throw error;
  }
}

// 공지사항 단건 조회
export async function fetchNoticeById(params) {
  try {
    const replacements = {
      noticeId: params.noticeId,
    };

    const notice = await db.sequelize.query(
      `
        SELECT
          id AS noticeId,
          title,
          content,
          created_by,
          fn_get_user_name(created_by) AS created_by_name,
          created_at,
          updated_by,
          fn_get_user_name(updated_by) AS updated_by_name,
          updated_at
        FROM ${db.ebiz}.notices
        WHERE id = :noticeId;
      `,
      {
        replacements,
        type: db.sequelize.QueryTypes.SELECT,
        plain: true, // 결과 1건만 객체로 반환
      },
    );

    const files = await db.sequelize.query(
      `
        SELECT
          id,
          original_file_name AS name,
          size,
          'keep' AS action
        FROM ${db.ebiz}.attachments
        WHERE parent_id = :noticeId
        ORDER BY id ASC;
      `,
      {
        replacements,
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    return {
      success: true,
      result: {
        notice: convertCamelCase(notice),
        files: convertCamelCase(files),
      },
    };
  } catch (error) {
    throw error;
  }
}

// 공지사항 등록
export async function insertNotice(
  { title, content },
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    const metadata = await db.sequelize.query(
      `
        INSERT INTO ${db.ebiz}.notices (
          title, content, created_by
        ) VALUES (
          :title, :content, :createdBy
        );
      `,
      {
        replacements: {
          title,
          content,
          createdBy: executedBy,
        },
        type: db.sequelize.QueryTypes.INSERT,
        transaction: trx,
      },
    );

    return metadata;
  }, transaction);
}

// 공지사항 수정
export async function updateNotice(
  { noticeId, title, content },
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    await db.sequelize.query(
      `
        UPDATE ${db.ebiz}.notices
        SET title = :title,
            content = :content,
            updated_by = :updatedBy,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :noticeId;
      `,
      {
        replacements: {
          noticeId,
          title,
          content,
          updatedBy: executedBy,
        },
        type: db.sequelize.QueryTypes.UPDATE,
        transaction: trx,
      },
    );
  }, transaction);
}

// 공지사항 저장(등록, 수정)
export async function saveNotice(
  { notice, filesMetadata, filesToDelete },
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    // 등록 or 수정
    let noticeId = notice.noticeId;
    if (noticeId) {
      await updateNotice(notice, executedBy, transaction);
    } else {
      const insertResult = await insertNotice(notice, executedBy, transaction);
      noticeId = insertResult[0];
    }

    // 첨부파일 추가
    if (filesMetadata?.length > 0) {
      await insertAttachment(
        filesMetadata,
        'notice',
        noticeId,
        executedBy,
        transaction,
      );
    }

    // 첨부파일 삭제
    if (filesToDelete?.length > 0) {
      await deleteAttachment('notice', filesToDelete, transaction);
    }

    return { success: true };
  }, transaction);
}

// 공지사항 첨부파일 추가
export async function insertNoticeAttachment(
  filesMetadata,
  noticeId,
  executedBy,
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    const values = [];
    const replacements = {};

    filesMetadata.forEach((metadata, index) => {
      values.push(`(
    :noticeId${index}, :originalFileName${index}, :storedFileName${index}, :filePath${index},
    :mimeType${index}, :fileExtension${index}, :fileSize${index}, :createdBy${index}
  )`);
      replacements[`noticeId${index}`] = noticeId;
      replacements[`originalFileName${index}`] = metadata.originalFileName;
      replacements[`storedFileName${index}`] = metadata.storedFileName;
      replacements[`filePath${index}`] = metadata.filePath;
      replacements[`mimeType${index}`] = metadata.mimeType;
      replacements[`fileExtension${index}`] = metadata.fileExtension;
      replacements[`fileSize${index}`] = metadata.fileSize;
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
    await db.sequelize.query(
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

    await deleteAllAttachment('notice', noticeId, transaction);

    return { success: true };
  });
}
