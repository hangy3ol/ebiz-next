import { convertCamelCase } from '@/common/utils/caseConverter';
import { executeWithTransaction } from '@/common/utils/executeWithTransaction';
import { db } from '@/libs/db';

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

// 평가 기준 단건 조회
export async function fetchCriteriaById(criteriaMasterId, copyMode) {
  try {
    // copyMode 값에 따라 action 설정
    const isCopyMode = String(copyMode).toLowerCase() === 'true';
    const actionValue = isCopyMode ? 'insert' : 'keep';

    // 1) master 조회
    const masterResult = await db.sequelize.query(
      `
        SELECT
          id AS criteria_master_id,
          title,
          job_group_code,
          job_title_code,
          remark,
          (
            SELECT COUNT(*)
            FROM ${db.ebiz}.evaluation_setting_detail esd
            WHERE esd.criteria_master_id = :criteriaMasterId
          ) AS ref_count,
          created_by,
          fn_get_user_name(created_by) AS created_by_name,
          created_at,
          updated_by,
          fn_get_user_name(updated_by) AS updated_by_name,
          updated_at
        FROM ${db.ebiz}.evaluation_criteria_master
        WHERE id = :criteriaMasterId;
      `,
      {
        replacements: { criteriaMasterId },
        type: db.sequelize.QueryTypes.SELECT,
        plain: true, // 결과 1건만 객체로 반환
      },
    );

    const level1Result = await db.sequelize.query(
      `
        SELECT
          id,
          name,
          score,
          sort_order,
          level,
          '${actionValue}' AS action
        FROM ${db.ebiz}.evaluation_criteria_detail
        WHERE master_id = :criteriaMasterId
        AND level = 1
        ORDER BY sort_order;
      `,
      {
        replacements: { criteriaMasterId },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    const level2Result = await db.sequelize.query(
      `
        SELECT
          id,
          parent_id,
          name,
          sort_order,
          level,
          '${actionValue}' AS action
        FROM ${db.ebiz}.evaluation_criteria_detail
        WHERE master_id = :criteriaMasterId
        AND level = 2
        ORDER BY sort_order;
      `,
      {
        replacements: { criteriaMasterId },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    const level3Result = await db.sequelize.query(
      `
        SELECT
          lv3.id,
          lv3.parent_id,
          lv2.parent_id AS root_id,
          lv3.name,
          lv3.ratio,
          lv3.sort_order,
          lv3.level,
          '${actionValue}' AS action
        FROM ${db.ebiz}.evaluation_criteria_detail lv3
        JOIN ${db.ebiz}.evaluation_criteria_detail lv2
        ON lv3.parent_id = lv2.id AND lv2.level = 2
        WHERE lv3.master_id = :criteriaMasterId
        AND lv3.level = 3
        ORDER BY lv3.sort_order;
      `,
      {
        replacements: { criteriaMasterId },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    return {
      success: true,
      result: {
        master: convertCamelCase(masterResult || {}),
        detail: {
          level1: convertCamelCase(level1Result),
          level2: convertCamelCase(level2Result),
          level3: convertCamelCase(level3Result),
        },
      },
    };
  } catch (error) {
    console.error('[fetchCriteriaById] 직원 목록 조회 실패:', error);
    throw error;
  }
}

// Helper: 평가기준 디테일 등록
async function insertCriteriaDetail(
  item,
  masterId,
  employeeId,
  transaction,
  idMap,
) {
  const fields = ['master_id', 'level', 'name', 'sort_order', 'created_by'];
  const values = [':masterId', ':level', ':name', ':sortOrder', ':createdBy'];
  const replacements = {
    masterId,
    level: item.level,
    name: item.name,
    sortOrder: item.sortOrder,
    createdBy: employeeId,
  };

  // 부모 ID가 UUID일 경우, idMap에서 실제 DB ID를 찾아 변환합니다.
  if (item.parentId) {
    fields.push('parent_id');
    values.push(':parentId');
    replacements.parentId = idMap.get(item.parentId) || item.parentId;
  }
  if (item.score !== undefined) {
    fields.push('score');
    values.push(':score');
    replacements.score = item.score;
  }
  if (item.ratio !== undefined) {
    fields.push('ratio');
    values.push(':ratio');
    replacements.ratio = item.ratio;
  }

  const sql = `
    INSERT INTO ${db.ebiz}.evaluation_criteria_detail (${fields.join(', ')})
    VALUES (${values.join(', ')})
  `;

  const [insertId] = await db.sequelize.query(sql, {
    replacements,
    type: db.sequelize.QueryTypes.INSERT,
    transaction,
  });

  return insertId;
}

// Helper: 평가기준 디테일 수정
async function updateCriteriaDetail(item, employeeId, transaction) {
  const fields = [
    'name = :name',
    'sort_order = :sortOrder',
    'updated_by = :updatedBy',
    'updated_at = CURRENT_TIMESTAMP()',
  ];
  const replacements = {
    id: item.id,
    name: item.name,
    sortOrder: item.sortOrder,
    updatedBy: employeeId,
  };

  if (item.parentId !== undefined)
    fields.push('parent_id = :parentId'),
      (replacements.parentId = item.parentId);
  if (item.score !== undefined)
    fields.push('score = :score'), (replacements.score = item.score);
  if (item.ratio !== undefined)
    fields.push('ratio = :ratio'), (replacements.ratio = item.ratio);

  const sql = `
    UPDATE ${db.ebiz}.evaluation_criteria_detail
    SET ${fields.join(', ')}
    WHERE id = :id
  `;

  await db.sequelize.query(sql, {
    replacements,
    type: db.sequelize.QueryTypes.UPDATE,
    transaction,
  });
}

// Helper: 평가기준 디테일 삭제
async function deleteCriteriaDetail(item, transaction) {
  const sql = `
    DELETE FROM ${db.ebiz}.evaluation_criteria_detail
    WHERE id = :id
  `;
  await db.sequelize.query(sql, {
    replacements: { id: item.id },
    type: db.sequelize.QueryTypes.DELETE,
    transaction,
  });
}

// 메인: 평가기준 저장 (등록/수정)
export async function saveCriteria(params, executedBy) {
  return executeWithTransaction(async (transaction) => {
    const { master, detail } = params;

    // 1. Master 처리 (등록 또는 수정)
    let masterId = master.criteriaMasterId;
    if (masterId) {
      // 수정
      await db.sequelize.query(
        `
          UPDATE ${db.ebiz}.evaluation_criteria_master 
          SET title = :title,
              remark = :remark,
              updated_by = :updatedBy, 
              updated_at = CURRENT_TIMESTAMP() 
          WHERE id = :id
        `,
        {
          replacements: {
            id: masterId,
            title: master.title,
            remark: master.remark,
            updatedBy: executedBy,
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction,
        },
      );
    } else {
      // 등록
      const [newId] = await db.sequelize.query(
        `
          INSERT INTO ${db.ebiz}.evaluation_criteria_master (
            evaluation_year,
            title,
            job_group_code,
            job_title_code,
            remark,
            created_by
          ) VALUES (
           :evaluationYear,
           :title,
           :jobGroupCode,
           :jobTitleCode,
           :remark,
           :createdBy
          )
        `,
        {
          replacements: {
            evaluationYear: master.evaluationYear,
            title: master.title,
            jobGroupCode: master.jobGroupCode,
            jobTitleCode: master.jobTitleCode,
            remark: master.remark,
            createdBy: executedBy,
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction,
        },
      );
      masterId = newId;
    }

    // 2. Detail 처리
    const idMap = new Map(); // UUID와 실제 DB ID 매핑용

    // 삭제 (역순: L3 -> L2 -> L1)
    for (const item of detail.level3.filter((i) => i.action === 'delete'))
      await deleteCriteriaDetail(item, transaction);
    for (const item of detail.level2.filter((i) => i.action === 'delete'))
      await deleteCriteriaDetail(item, transaction);
    for (const item of detail.level1.filter((i) => i.action === 'delete'))
      await deleteCriteriaDetail(item, transaction);

    // 수정 (순서 무관)
    const updateList = [
      ...detail.level1.filter((i) => i.action === 'update'),
      ...detail.level2.filter((i) => i.action === 'update'),
      ...detail.level3.filter((i) => i.action === 'update'),
    ];
    for (const item of updateList)
      await updateCriteriaDetail(item, executedBy, transaction);

    // 등록 (순서 중요: L1 -> L2 -> L3)
    for (const item of detail.level1.filter((i) => i.action === 'insert')) {
      const dbId = await insertCriteriaDetail(
        item,
        masterId,
        executedBy,
        transaction,
        idMap,
      );
      idMap.set(item.id, dbId); // 클라이언트 UUID와 생성된 DB ID를 매핑
    }
    for (const item of detail.level2.filter((i) => i.action === 'insert')) {
      const dbId = await insertCriteriaDetail(
        item,
        masterId,
        executedBy,
        transaction,
        idMap,
      );
      idMap.set(item.id, dbId);
    }
    for (const item of detail.level3.filter((i) => i.action === 'insert')) {
      await insertCriteriaDetail(
        item,
        masterId,
        executedBy,
        transaction,
        idMap,
      );
    }

    return { success: true, result: { masterId } };
  });
}

// 평가기준 삭제
export async function deleteCriteria(criteriaMasterId) {
  return executeWithTransaction(async (transaction) => {
    // 1. 자식 테이블인 detail 레코드 먼저 삭제
    await db.sequelize.query(
      `
        DELETE FROM ${db.ebiz}.evaluation_criteria_detail 
        WHERE master_id = :criteriaMasterId
      `,
      {
        replacements: { criteriaMasterId },
        type: db.sequelize.QueryTypes.DELETE,
        transaction,
      },
    );

    // 2. 부모 테이블인 master 레코드 삭제
    await db.sequelize.query(
      `
        DELETE FROM ${db.ebiz}.evaluation_criteria_master
        WHERE id = :criteriaMasterId
      `,
      {
        replacements: { criteriaMasterId },
        type: db.sequelize.QueryTypes.DELETE,
        transaction,
      },
    );

    return { success: true };
  });
}
