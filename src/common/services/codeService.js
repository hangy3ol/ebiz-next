import { db } from '@/libs/db';

// DIS 옵션
export async function fetchDisOptions(mcode, filters = []) {
  let sql = `
    SELECT
      sbcode AS id,
      REPLACE(REPLACE(codenms, '　', ''), ' ', '') AS name1,
      codenmf AS name2
    FROM ${db.dis}.base_code_usr
    WHERE mcode = :mcode
  `;

  filters.forEach((clause) => {
    sql += ` ${clause}`;
  });

  sql += ' ORDER BY id ASC;';

  try {
    const result = await db.sequelize.query(sql, {
      replacements: { mcode },
      type: db.sequelize.QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error(`[fetchDisOptions] ${mcode} 옵션 조회 실패:`, error);
    throw error;
  }
}

// DIS 코드 - 직위 옵션 조회(사원, 대리 등)
export async function fetchPositionOptions(params = {}) {
  try {
    const result = await fetchDisOptions('AH', [], params);
    // return response.ok('직위 옵션 목록을 성공적으로 가져왔습니다.', result);
    return { success: true, result };
  } catch (error) {
    console.error('[fetchPositionOptions] 직위 옵션 조회 실패:', error);
    throw error;
  }
}
/* DIS 코드 end */

/* EBIZ 코드 start */
// EBIZ 공통코드 조회
export async function fetchEbizOptions(codeGroup, filters = [], params = {}) {
  let sql = `
    SELECT
      code AS id,
      code_name_1 AS name1,
      code_name_2 AS name2
    FROM ${db.ebiz}.common_code
    WHERE code_group = :codeGroup
    AND use_yn = 'Y'
  `;

  filters.forEach((clause) => {
    sql += ` ${clause}`;
  });

  sql += ' ORDER BY id ASC;';

  try {
    const result = await db.sequelize.query(sql, {
      replacements: { codeGroup },
      type: db.sequelize.QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error(`[fetchEbizOptions] ${codeGroup} 옵션 조회 실패:`, error);
    throw error;
  }
}

// EBIZ 코드 - 사업부 옵션 조회
export async function fetchOfficeOptions(params = {}) {
  const sql = `
    SELECT
      id,
      name AS name1,
      name AS name2
    FROM ${db.ebiz}.office
    WHERE use_yn = 'Y'
    ORDER BY id ASC;
  `;

  try {
    const result = await db.sequelize.query(sql, {
      replacements: {},
      type: db.sequelize.QueryTypes.SELECT,
    });

    return { success: true, result };
  } catch (error) {
    console.error('[fetchOfficeOption] 사업부 옵션 조회 실패:', error);
    throw error;
  }
}

// EBIZ 코드 - 부서 옵션 조회
export async function fetchDepartmentOptions(params = {}) {
  const { officeId } = params;

  let sql = `
    SELECT
      id,
      name AS name1,
      name AS name2
    FROM ${db.ebiz}.department
    WHERE use_yn = 'Y'
  `;

  if (officeId) {
    sql += ` AND office_id = :officeId`;
  }

  sql += ' ORDER BY id ASC;';

  try {
    const result = await db.sequelize.query(sql, {
      replacements: { officeId },
      type: db.sequelize.QueryTypes.SELECT,
    });

    return { success: true, result };
  } catch (error) {
    console.error('[fetchDepartmentOptions] 부서 옵션 조회 실패:', error);
    throw error;
  }
}

// EBIZ 코드 - 직종 옵션 조회(현장, 사무)
export async function fetchJobTypeOptions(params = {}) {
  try {
    const result = await fetchEbizOptions('job_type', [], params);
    return { success: true, result };
  } catch (error) {
    console.error('[fetchJobTypeOptions] 직종 옵션 조회 실패:', error);
    throw error;
  }
}

// EBIZ 코드 - 직책 옵션 조회(팀장, 팀원)
export async function fetchJobTitleOptions(params = {}) {
  try {
    const result = await fetchEbizOptions('job_title', [], params);
    return { success: true, result };
  } catch (error) {
    console.error('[fetchJobTitleOptions] 직책 옵션 조회 실패:', error);
    throw error;
  }
}

// EBIZ 코드 - 인사평가 평가귀속연도 옵션 조회
export async function fetchEvaluationYearOptions(params = {}) {
  const sql = `
    SELECT
      DISTINCT evaluation_year AS id,
      IF(evaluation_year IS NOT NULL, CONCAT(evaluation_year, '년'), NULL) AS name1,
      IF(evaluation_year IS NOT NULL, CONCAT(evaluation_year, '년'), NULL) AS name2
    FROM ${db.ebiz}.evaluation_setting_master;
  `;

  try {
    const raw = await db.sequelize.query(sql, {
      replacements: {},
      type: db.sequelize.QueryTypes.SELECT,
    });

    // 연도 옵션 생성
    const result = formatYearOption(raw, params);

    return { success: true, result };
  } catch (error) {
    console.error(
      '[fetchEvaluationYearOptions] 인사평가 평가귀속연도 옵션 조회 실패:',
      error,
    );
    throw error;
  }
}

// EBIZ 코드 - 인사평가 진행상태 옵션 조회
export async function fetchEvaluationStatusOptions(params = {}) {
  try {
    const result = await fetchEbizOptions('evaluation_status', [], params);
    return { success: true, result };
  } catch (error) {
    console.error(
      '[fetchEvaluationStatusOptions] 인사평가 진행상태 옵션 조회 실패:',
      error,
    );
    throw error;
  }
}

// // EBIZ 코드 - 휴가설정 연도 옵션 조회
// export async function fetchLeaveYearOptions(params = {}) {
//   // 1. DB에서 `leave_setting` 테이블에 저장된 연도 목록 조회
//   let sql = `
//     SELECT
//       DISTINCT year AS id
//     FROM ${db.ebiz}.leave_setting
//     WHERE year IS NOT NULL;
//   `;

//   try {
//     const result = await db.sequelize.query(sql, {
//       type: db.sequelize.QueryTypes.SELECT,
//       replacements: {},
//     });

//     // 2. 연도 옵션 생성
//     const yearOption = exports.formatYearOption(result, params);

//     return {
//       success: true,
//       result: yearOption,
//     };
//   } catch (error) {
//     throw error;
//   }
// }

/* EBIZ 코드 end */

// 연도 옵션 가공
export async function formatYearOption(result, params = {}) {
  let yearSet = new Set(result.map((row) => Number(row.id)));

  // 1. DB에 조회된 연도가 없는 경우: 현재 연도 기준으로 특정 범위의 연도 추가
  if (result.length === 0) {
    const currentYear = new Date().getFullYear();
    const range = Number(params.range || 2); // 기본값 2
    const startYear = currentYear - range;
    const endYear = currentYear + range;

    for (let y = startYear; y <= endYear; y++) {
      yearSet.add(y);
    }
  } else {
    // DB에 조회된 연도가 있는 경우: 최소값 -1, 최대값 +1 연도 추가
    const existingYear = Array.from(yearSet);
    const minYear = Math.min(...existingYear);
    const maxYear = Math.max(...existingYear);

    yearSet.add(minYear - 1);
    yearSet.add(maxYear + 1);
  }

  // 2. Set을 배열로 변환 후 내림차순 정렬 (최신 연도가 위로 오도록)
  let sortedList = Array.from(yearSet).sort((a, b) => b - a);

  // 3. 최종 옵션 형식으로 변환
  const option = sortedList.map((year) => ({
    id: String(year),
    name1: `${year}년`,
    name2: `${year}년`,
  }));

  return option;
}
