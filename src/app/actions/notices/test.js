import { db } from '@/libs/db';
import { convertCamelCase } from '@/utils/caseConverter';
import { response } from '@/utils/response';

// 공지사항 목록 조회
export async function fetchNoticeList(params) {
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

    return response.ok(
      '공지사항 목록을 성공적으로 조회하였습니다.',
      convertCamelCase(raw),
    );
  } catch (error) {
    console.error('[fetchNoticeList] 공지사항 목록 조회 실패:', error);
    throw error;
  }
}
