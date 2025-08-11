import { db } from '@/libs/db';
import { convertCamelCase } from '@/utils/caseConverter';
import { executeWithTransaction } from '@/utils/executeWithTransaction';

// 평가 기준 목록 조회
export async function fetchCriteriaList(params = {}) {
  try {
    let sql = `
			SELECT
        ROW_NUMBER() OVER (ORDER BY id DESC, job_group_code ASC, job_title_code ASC) AS row_num,
        id AS criteria_master_id,
        title,
        job_group_code,
        fn_get_ebiz_code_name('job_group', job_group_code) AS job_group_name,
        job_title_code,
        fn_get_ebiz_code_name('job_title',job_title_code) AS job_title_name,
        remark,
        created_by,
        fn_get_user_name(created_by) AS created_by_name,
        created_at,
        updated_by,
        fn_get_user_name(updated_by) AS updated_by_name,
        updated_at
			FROM ${db.ebiz}.evaluation_criteria_master
      WHERE 1 = 1
		`;

    const replacements = {};

    // 해당 criteriaMasterId 빼고 조회
    if (params.criteriaMasterId) {
      sql += ` AND id != :criteriaMasterId`;
      replacements.criteriaMasterId = params.criteriaMasterId;
    }

    // 직군 조건
    if (params.jobGroupCode) {
      sql += ` AND job_group_code = :jobGroupCode`;
      replacements.jobGroupCode = params.jobGroupCode;
    }

    // 직책 조건
    if (params.jobTitleCode) {
      sql += ` AND job_title_code = :jobTitleCode`;
      replacements.jobTitleCode = params.jobTitleCode;
    }

    const raw = await db.sequelize.query(sql, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT,
    });

    return { success: true, result: convertCamelCase(raw) };
  } catch (error) {
    console.error('[fetchCriteriaList] 직원 목록 조회 실패:', error);
    throw error;
  }
}
