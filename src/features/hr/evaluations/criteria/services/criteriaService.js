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

// // 평가 기준 단건 조회
// export async function fetchCriteriaById(criteriaMasterId, copyMode) {
//   try {
//     // copyMode 값에 따라 action 설정
//     const isCopyMode = String(copyMode).toLowerCase() === 'true';
//     const actionValue = isCopyMode ? 'insert' : 'keep';

//     // 1) master 조회
//     const masterResult = await db.sequelize.query(
//       `
//         SELECT
//           id AS criteria_master_id,
//           title,
//           job_group_code,
//           job_title_code,
//           remark,
//           (
//             SELECT COUNT(*)
//             FROM ${db.ebiz}.evaluation_setting_detail esd
//             WHERE esd.criteria_master_id = :criteriaMasterId
//           ) AS ref_count,
//           created_by,
//           fn_get_user_name(created_by) AS created_by_name,
//           created_at,
//           updated_by,
//           fn_get_user_name(updated_by) AS updated_by_name,
//           updated_at
//         FROM ${db.ebiz}.evaluation_criteria_master
//         WHERE id = :criteriaMasterId;
//       `,
//       {
//         replacements: { criteriaMasterId },
//         type: db.sequelize.QueryTypes.SELECT,
//         plain: true, // 결과 1건만 객체로 반환
//       },
//     );

//     // 2) detail 한 방 조회 (lv1 → lv2 → lv3)
//     const rows = await db.sequelize.query(
//       `
//         SELECT
//           lv1.id         AS lv1_id,
//           lv1.name       AS lv1_name,
//           lv1.score      AS lv1_score,
//           lv1.sort_order AS lv1_sort,
//           lv1.level      AS lv1_level,

//           lv2.id         AS lv2_id,
//           lv2.parent_id  AS lv2_parent_id,
//           lv2.name       AS lv2_name,
//           lv2.sort_order AS lv2_sort,
//           lv2.level      AS lv2_level,

//           lv3.id         AS lv3_id,
//           lv3.parent_id  AS lv3_parent_id,
//           lv3.name       AS lv3_name,
//           lv3.ratio      AS lv3_ratio,
//           lv3.sort_order AS lv3_sort,
//           lv3.level      AS lv3_level

//         FROM ${db.ebiz}.evaluation_criteria_detail lv1
//         LEFT JOIN ${db.ebiz}.evaluation_criteria_detail lv2
//         ON lv2.parent_id = lv1.id AND lv2.level = 2
//         LEFT JOIN ${db.ebiz}.evaluation_criteria_detail lv3
//         ON lv3.parent_id = lv2.id AND lv3.level = 3
//         WHERE lv1.master_id = :criteriaMasterId
//         AND lv1.level = 1
//         ORDER BY lv1.sort_order, lv2.sort_order, lv3.sort_order;
//       `,
//       {
//         replacements: { criteriaMasterId },
//         type: db.sequelize.QueryTypes.SELECT,
//       },
//     );

//     // 3) 트리 조립
//     const lv1Map = new Map();
//     const lv2Map = new Map();

//     for (const r of rows) {
//       // lv1
//       if (r.lv1_id && !lv1Map.has(r.lv1_id)) {
//         lv1Map.set(r.lv1_id, {
//           id: r.lv1_id,
//           name: r.lv1_name,
//           score: r.lv1_score,
//           sortOrder: r.lv1_sort,
//           level: r.lv1_level,
//           action: actionValue,
//           children: [],
//         });
//       }

//       // lv2
//       if (r.lv2_id && !lv2Map.has(r.lv2_id)) {
//         const parentLv1 = lv1Map.get(r.lv2_parent_id);
//         if (parentLv1) {
//           const nodeLv2 = {
//             id: r.lv2_id,
//             parentId: r.lv2_parent_id,
//             name: r.lv2_name,
//             sortOrder: r.lv2_sort,
//             level: r.lv2_level,
//             action: actionValue,
//             children: [],
//           };
//           parentLv1.children.push(nodeLv2);
//           lv2Map.set(r.lv2_id, nodeLv2);
//         }
//       }

//       // lv3
//       if (r.lv3_id) {
//         const parentLv2 = lv2Map.get(r.lv3_parent_id);
//         if (parentLv2) {
//           parentLv2.children.push({
//             id: r.lv3_id,
//             parentId: r.lv3_parent_id,
//             rootId: r.lv2_parent_id, // lv1 id
//             name: r.lv3_name,
//             ratio: r.lv3_ratio,
//             sortOrder: r.lv3_sort,
//             level: r.lv3_level,
//             action: actionValue,
//           });
//         }
//       }
//     }

//     // 4) 정렬
//     const tree = Array.from(lv1Map.values())
//       // lv1 계층
//       .map((lv1) => {
//         return {
//           ...lv1,
//           // lv2 계층
//           children: (lv1.children || [])
//             .map((lv2) => {
//               return {
//                 ...lv2,
//                 // lv3 계층
//                 children: (lv2.children || []).sort(
//                   (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
//                 ),
//               };
//             })
//             .sort(
//               (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
//             ),
//         };
//       })
//       // lv1 정렬
//       .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

//     return {
//       success: true,
//       result: { master: convertCamelCase(masterResult || {}), detail: tree },
//     };
//   } catch (error) {
//     console.error('[fetchCriteriaById] 직원 목록 조회 실패:', error);
//     throw error;
//   }
// }
