import { convertCamelCase } from '@/common/utils/caseConverter';
import { executeWithTransaction } from '@/common/utils/executeWithTransaction';
import { db } from '@/libs/db';

// 평가진행 목록 조회
export const fetchProgressList = async (params, loginUserId) => {
  try {
    let sql = `
			SELECT 
        ROW_NUMBER() OVER (ORDER BY esm.id ASC, esm.evaluation_year DESC, esm.office_id ASC) AS row_num,
        esm.id AS setting_master_id,
        ep.setting_detail_id,
        esm.office_id,
        fn_get_office_name(esm.office_id) AS office_name,
        esm.evaluation_year,
        IF(esm.evaluation_year IS NOT NULL, CONCAT(esm.evaluation_year, '년'), NULL) AS evaluation_year_label,
        esm.title,
        esm.job_group_code,
        esm.job_title_code,
        fn_get_user_name(esm.created_by) AS created_by_name,
        esm.created_at,
        esm.updated_by,
        fn_get_user_name(esm.updated_by) AS updated_by_name,
        esm.updated_at
      FROM ${db.ebiz}.evaluation_progress ep
      JOIN ${db.ebiz}.evaluation_setting_master esm 
      ON ep.setting_master_id = esm.id
      WHERE 1 = 1
		`;

    const replacements = {};

    // ADMIN 외에는 로그인 사용자가 평가자로 지정되고, 해당 평가가 진행중인 것만 조회
    if (loginUserId !== 'ADMIN') {
      sql += ` 
        AND ep.evaluator_id = :loginUserId
        AND ep.status_code = '02'
      `;
      replacements.loginUserId = loginUserId;
    }

    // 중복 setting_master_id 제거
    sql += ` GROUP BY esm.id;`;

    const result = await db.sequelize.query(sql, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT,
    });

    return { success: true, result: convertCamelCase(result) };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
