import { db } from '@/libs/db';
import { convertCamelCase } from '@/utils/caseConverter';
import { executeWithTransaction } from '@/utils/executeWithTransaction';

// 직원목록 조회
export async function fetchEmployeeList(params) {
  try {
    let sql = `
			SELECT
				ROW_NUMBER() OVER (ORDER BY office_id ASC, department_id ASC, position_id ASC, hire_date ASC) AS row_num,
				id AS user_id,
				name AS user_name,
				office_id,
				fn_get_office_name(office_id) AS office_name,
				department_id,
				fn_get_department_name(department_id) AS department_name,
				position_id,
				fn_get_position_name(position_id) AS position_name,
				rank_id,
				fn_get_rank_name(rank_id) AS rank_name,
				executive_yn,
				job_type_code,
				fn_get_ebiz_code_name('job_type', job_type_code) AS job_type_name,
				job_group_code,
				fn_get_ebiz_code_name('job_group', job_group_code) AS job_group_name,
				job_title_code,
				fn_get_ebiz_code_name('job_title', job_title_code) AS job_title_name,
				hr_committee_yn,
				contact,
				email,
				hire_date,
				retirement_date,
				hidden_yn,
				hrm_code,
				'keep' AS action,
				created_by,
				fn_get_user_name(created_by) AS created_by_name,
				created_at,
				updated_by,
				fn_get_user_name(updated_by) AS updated_by_name,
				updated_at,
				last_sync_by,
				fn_get_user_name(last_sync_by) AS last_sync_by_name,
				last_sync_at
			FROM ${db.ebiz}.users
			WHERE id != 'ADMIN'
		`;

    const replacements = {};

    if (!params.includeAll) {
      sql += ' AND retirement_date IS NULL';
    }

    if (params.officeId !== undefined) {
      sql += ` AND office_id = :officeId`;
      replacements.officeId = params.officeId;
    }

    if (params.jobGroupCode !== undefined) {
      sql += ` AND job_group_code = :jobGroupCode`;
      replacements.jobGroupCode = params.jobGroupCode;
    }

    if (params.jobTitleCode !== undefined) {
      sql += ` AND job_title_code = :jobTitleCode`;
      replacements.jobTitleCode = params.jobTitleCode;
    }

    // 인사평가
    // AND 조건1 - 해당 평가귀속연도 06월 30일 이전 입사자(입사 6개월 경과)
    // AND 조건2 - 해당 평가귀속연도 이후 퇴사자
    if (params.evaluationYear) {
      const cutoffDate = `${params.evaluationYear}-12-31`;

      sql += `
        AND hire_date <= DATE_SUB(:cutoffDate, INTERVAL 6 MONTH)
        AND (retirement_date IS NULL OR retirement_date > :cutoffDate)
      `;
      replacements.cutoffDate = cutoffDate;
    }

    const raw = await db.sequelize.query(sql, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT,
    });

    return { success: true, result: convertCamelCase(raw) };
  } catch (error) {
    console.error('[fetchEmployeeList] 직원 목록 조회 실패:', error);
    throw error;
  }
}

// 직원 정보 DIS 동기화
export async function syncEmployeesFromDis(params, transaction = null) {
  return await executeWithTransaction(async (trx) => {
    try {
      // 1단계: UPSERT
      await db.sequelize.query(
        `
        INSERT INTO ${db.ebiz}.users (
          id,
          name,
          office_id,
          department_id,
          position_id,
          rank_id,
          executive_yn,
          job_type_code,
          job_group_code,
          job_title_code,
          hr_committee_yn,
          contact,
          email,
          hire_date,
          retirement_date,
          hidden_yn,
          hrm_code,
          created_by,
          created_at,
          last_sync_by,
          last_sync_at
        )
        SELECT
          b.loginid AS id,
          IFNULL(im.name, '관리자') AS name,
          im.bns_code AS office_id,
          im.team AS department_id,
          im.grade AS position_id, -- AH
          im.jik_grade AS rank_id, -- AJ
          CASE 
            WHEN b.loginid = 'ADMIN' THEN 'N' -- ADMIN인 경우
            WHEN im.executive_yn = 0 THEN 'N' -- 기존 조건 유지
            ELSE 'Y'
          END AS executive_yn,
          CASE 
            WHEN (im.resignationdate IS NULL OR im.resignationdate = '')
            THEN LPAD(im.job_type, 2, '0')
            ELSE null
          END AS job_type_code,
          CASE 
            WHEN (im.resignationdate IS NULL OR im.resignationdate = '')
            THEN NULLIF(d.job_group_code, '')
            ELSE null
          END AS job_group_code,
          CASE 
            -- 재직중 + 직종 사무직 + 직급 부장인 경우 팀장 직책 일괄 부여(세부사항 화면에서 수정)
            WHEN (im.resignationdate IS NULL OR im.resignationdate = '') AND LPAD(im.job_type, 2, '0') = '01' AND im.grade = '20'
            THEN '01' 
            -- 재직중 + 직종 사무직 + 직급 부장 미만인 경우 팀원 직책 일괄 부여(세부사항 화면에서 수정)
            WHEN (im.resignationdate IS NULL OR im.resignationdate = '') AND LPAD(im.job_type, 2, '0') = '01' AND im.grade > '20'
            THEN '02'
            ELSE null
          END AS job_title_code,
          CASE 
            -- 재직중 + 직종 사무직인 경우 인사위원회 위원여부 N 일괄 부여(세부사항 화면에서 수정)
            WHEN (im.resignationdate IS NULL OR im.resignationdate = '') AND LPAD(im.job_type, 2, '0') = '01'
            THEN 'N' 
            ELSE null
          END AS hr_committee_yn,
          CASE 
            WHEN TRIM(im.telno) = ''
            THEN null
            ELSE TRIM(im.telno)
          END AS contact,
          CASE 
            WHEN TRIM(im.email) = ''
            THEN null
            ELSE TRIM(im.email)
          END AS email,
          DATE_FORMAT(im.hireddate, '%Y-%m-%d') AS hire_date,
          CASE 
            WHEN im.resignationdate = ''
            THEN null
            ELSE im.resignationdate
          END AS retirement_dt,
          CASE 
            WHEN b.loginid = 'ADMIN' THEN 'Y' -- ADMIN인 경우
            WHEN (im.resignationdate IS NULL OR im.resignationdate = '') THEN 'N'
            ELSE 'Y'
          END AS hidden_yn,
          im.code AS hrm_code,
          :executedBy,
          CURRENT_TIMESTAMP() AS created_at,
          :executedBy,
          CURRENT_TIMESTAMP() AS last_sync_at
        FROM (
          SELECT loginid, code
          FROM (
            SELECT DISTINCT officeID AS loginid, code 
            FROM ${db.dis}.insa_m
            UNION ALL
            SELECT loginid, code
            FROM ${db.dis}.users
            WHERE loginid  = 'ADMIN'
          ) a
        ) b
        LEFT JOIN ${db.dis}.insa_m im ON b.loginid = im.officeID
        LEFT JOIN ${db.ebiz}.users usrs ON b.loginid = usrs.id
        LEFT JOIN ${db.ebiz}.department d ON d.id = im.team
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          office_id = VALUES(office_id),
          department_id = VALUES(department_id),
          position_id = VALUES(position_id),
          executive_yn = VALUES(executive_yn),
          rank_id = VALUES(rank_id),
          contact = VALUES(contact),
          email = VALUES(email),
          hire_date = VALUES(hire_date),
          retirement_date = VALUES(retirement_date),
          hidden_yn = VALUES(hidden_yn),
          hrm_code = VALUES(hrm_code),
          last_sync_by = :executedBy,
          last_sync_at = NOW();
      `,
        {
          replacements: { executedBy: params.executedBy },
          transaction,
        },
      );

      return { success: true };
    } catch (error) {
      console.error('[syncEmployeeFromDis] 직원 정보 동기화 실패:', error);
      throw error;
    }
  }, transaction);
}
