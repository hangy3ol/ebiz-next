import { convertCamelCase } from '@/common/utils/caseConverter';
import { executeWithTransaction } from '@/common/utils/executeWithTransaction';
import { db } from '@/libs/db';

// 평가설정 목록 조회
export const fetchSettingList = async (params) => {
  try {
    let sql = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY id DESC) AS row_num,
        id AS setting_master_id,
        office_id,
        fn_get_office_name(office_id) AS office_name,
        evaluation_year,
        IF(evaluation_year IS NOT NULL, CONCAT(evaluation_year, '년'), NULL) AS evaluation_year_label,
        title,
        job_group_code,
        fn_get_ebiz_code_name('job_group', job_group_code) AS job_group_name,
        job_title_code,
        fn_get_ebiz_code_name('job_title', job_title_code) AS job_title_name,
        created_by,
        fn_get_user_name(created_by) AS created_by_name,
        created_at,
        updated_by,
        fn_get_user_name(updated_by) AS updated_by_name,
        updated_at
      FROM ${db.ebiz}.evaluation_setting_master esm
      WHERE 1=1
    `;

    const replacements = {};

    if (params.officeId) {
      sql += ' AND office_id = :officeId';
      replacements.officeId = params.officeId;
    }
    if (params.evaluationYear) {
      sql += ' AND evaluation_year = :evaluationYear';
      replacements.evaluationYear = params.evaluationYear;
    }
    if (params.title) {
      sql += ' AND title LIKE :title';
      replacements.title = `%${params.title}%`;
    }
    if (params.jobGroupCode) {
      sql += ` AND job_group_code = :jobGroupCode`;
      replacements.jobGroupCode = params.jobGroupCode;
    }
    if (params.jobTitleCode) {
      sql += ` AND job_title_code = :jobTitleCode`;
      replacements.jobTitleCode = params.jobTitleCode;
    }

    sql += ' ORDER BY id DESC';

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

// 평가설정 단건 조회
export const fetchSettingById = async (settingMasterId) => {
  try {
    const masterResult = await db.sequelize.query(
      `
        /* setting-service -> fetchSettingById */
        SELECT
          id AS setting_master_id,
          office_id,
          evaluation_year,
          title,
          job_group_code,
          job_title_code,
          (
            SELECT COUNT(*)
            FROM (
              SELECT DISTINCT setting_detail_id
              FROM evaluation_criteria_score
              WHERE setting_master_id = :settingMasterId

              UNION

              SELECT DISTINCT setting_detail_id
              FROM evaluation_adjustment_score
              WHERE setting_master_id = :settingMasterId
            ) t
          ) AS ref_count,
          created_by,
          fn_get_user_name(created_by) AS created_by_name,
          created_at,
          updated_by,
          fn_get_user_name(updated_by) AS updated_by_name,
          updated_at
        FROM ${db.ebiz}.evaluation_setting_master
        WHERE id = :settingMasterId;
      `,
      {
        replacements: { settingMasterId },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    const detailResult = await db.sequelize.query(
      `
        /* setting-service -> fetchSettingById */
        SELECT
          esd.id AS setting_detail_id,
          esd.evaluatee_id,
          fn_get_user_name(esd.evaluatee_id) AS evaluatee_name,
          esd.criteria_master_id,
          esd.adjustment_master_id,
          (SELECT title FROM evaluation_criteria_master WHERE id = esd.criteria_master_id) AS criteria_master_title,
          (SELECT title FROM evaluation_adjustment_master WHERE id = esd.adjustment_master_id) AS adjustment_master_title,
          MAX(CASE WHEN ep.evaluation_step = 1 THEN ep.evaluator_id END) AS evaluator_id_1,
          MAX(CASE WHEN ep.evaluation_step = 1 THEN fn_get_user_name(ep.evaluator_id) END) AS evaluator_name_1,
          MAX(CASE WHEN ep.evaluation_step = 1 THEN ep.weight END) AS evaluator_weight_1,
          MAX(CASE WHEN ep.evaluation_step = 2 THEN ep.evaluator_id END) AS evaluator_id_2,
          MAX(CASE WHEN ep.evaluation_step = 2 THEN fn_get_user_name(ep.evaluator_id) END) AS evaluator_name_2,
          MAX(CASE WHEN ep.evaluation_step = 2 THEN ep.weight END) AS evaluator_weight_2,
          MAX(CASE WHEN ep.evaluation_step = 3 THEN ep.evaluator_id END) AS evaluator_id_3,
          MAX(CASE WHEN ep.evaluation_step = 3 THEN fn_get_user_name(ep.evaluator_id) END) AS evaluator_name_3,
          MAX(CASE WHEN ep.evaluation_step = 3 THEN ep.weight END) AS evaluator_weight_3,
          'keep' AS action
        FROM ${db.ebiz}.evaluation_setting_detail esd
        LEFT JOIN ${db.ebiz}.evaluation_progress ep
        ON esd.id = ep.setting_detail_id
        WHERE esd.master_id = :settingMasterId
        GROUP BY esd.id, esd.evaluatee_id, esd.criteria_master_id, esd.adjustment_master_id;
      `,
      {
        replacements: { settingMasterId },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    return {
      success: true,
      master: convertCamelCase(masterResult[0]) || null,
      detail: convertCamelCase(detailResult),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 평가설정 마스터 등록
export const insertSettingMaster = async (
  params,
  createdBy,
  transaction = null,
) => {
  return await executeWithTransaction(async (trx) => {
    const fields = ['created_by'];
    const values = [':createdBy'];
    const replacements = {
      createdBy,
    };

    if (params.officeId !== undefined) {
      fields.push('office_id');
      values.push(':officeId');
      replacements.officeId = params.officeId;
    }
    if (params.evaluationYear !== undefined) {
      fields.push('evaluation_year');
      values.push(':evaluationYear');
      replacements.evaluationYear = params.evaluationYear;
    }
    if (params.title !== undefined) {
      fields.push('title');
      values.push(':title');
      replacements.title = params.title;
    }
    if (params.jobGroupCode !== undefined) {
      fields.push('job_group_code');
      values.push(':jobGroupCode');
      replacements.jobGroupCode = params.jobGroupCode;
    }
    if (params.jobTitleCode !== undefined) {
      fields.push('job_title_code');
      values.push(':jobTitleCode');
      replacements.jobTitleCode = params.jobTitleCode;
    }

    const sql = `
      INSERT INTO ${db.ebiz}.evaluation_setting_master (${fields.join(', ')}) 
      VALUES (${values.join(', ')})
    `;

    const result = await db.sequelize.query(sql, {
      replacements,
      type: db.sequelize.QueryTypes.INSERT,
      transaction: trx,
    });

    return { success: true, insertId: result[0] };
  }, transaction);
};

// 평가설정 마스터 수정
export const updateSettingMaster = async (
  params,
  updatedBy,
  transaction = null,
) => {
  return await executeWithTransaction(async (trx) => {
    const replacements = {
      id: params.id,
      updatedBy,
    };

    await db.sequelize.query(
      `
        UPDATE ${db.ebiz}.evaluation_setting_master
        SET 
          updated_by = :updatedBy,
          updated_at = CURRENT_TIMESTAMP()
        WHERE id = :id;
      `,
      {
        replacements,
        type: db.sequelize.QueryTypes.UPDATE,
        transaction: trx,
      },
    );
    return { success: true };
  }, transaction);
};

// 평가설정 마스터 삭제
export const deleteSettingMaster = async (params, transaction = null) => {
  return await executeWithTransaction(async (trx) => {
    const sql = `
      DELETE FROM ${db.ebiz}.evaluation_setting_master WHERE id = :settingMasterId;
    `;
    await db.sequelize.query(sql, {
      replacements: { settingMasterId: params.settingMasterId },
      type: db.sequelize.QueryTypes.DELETE,
      transaction: trx,
    });
    return { success: true };
  }, transaction);
};

// 평가설정 디테일 등록
export const insertSettingDetail = async (
  item,
  masterId,
  employeeId,
  evaluationYear,
  transaction,
) => {
  // 1. evaluation_setting_detail INSERT
  const detailSql = `
    INSERT INTO ${db.ebiz}.evaluation_setting_detail (
      master_id, evaluatee_id, criteria_master_id, adjustment_master_id, created_by
    ) VALUES (
      :masterId, :evaluateeId, :criteriaMasterId, :adjustmentMasterId, :createdBy
    );
  `;
  const [settingDetailId] = await db.sequelize.query(detailSql, {
    replacements: {
      masterId,
      evaluateeId: item.evaluateeId,
      criteriaMasterId: item.criteriaMasterId,
      adjustmentMasterId: item.adjustmentMasterId,
      createdBy: employeeId,
    },
    type: db.sequelize.QueryTypes.INSERT,
    transaction,
  });

  // 2. evaluation_progress INSERT
  const progressRows = [];
  if (item.evaluatorId1)
    progressRows.push({
      step: 1,
      id: item.evaluatorId1,
      weight: item.evaluatorWeight1,
    });
  if (item.evaluatorId2)
    progressRows.push({
      step: 2,
      id: item.evaluatorId2,
      weight: item.evaluatorWeight2,
    });
  if (item.evaluatorId3)
    progressRows.push({
      step: 3,
      id: item.evaluatorId3,
      weight: item.evaluatorWeight3,
    });

  if (progressRows.length > 0) {
    const valuesClause = progressRows
      .map(
        (_, i) =>
          `(:mId, :dId, :eId${i}, :step${i}, :w${i}, :status${i}, :cBy)`,
      )
      .join(', ');
    const replacements = {
      mId: masterId,
      dId: settingDetailId,
      cBy: employeeId,
    };
    progressRows.forEach((row, i) => {
      replacements[`eId${i}`] = row.id;
      replacements[`step${i}`] = row.step;
      replacements[`w${i}`] = row.weight ?? null;
      replacements[`status${i}`] = row.step === 1 ? '02' : '01';
    });

    const progressSql = `
      INSERT INTO ${db.ebiz}.evaluation_progress (
        setting_master_id, setting_detail_id, evaluator_id, evaluation_step, weight, status_code, created_by
      ) VALUES ${valuesClause};
    `;
    await db.sequelize.query(progressSql, {
      replacements,
      type: db.sequelize.QueryTypes.INSERT,
      transaction,
    });
  }
};

// 평가설정 디테일 수정
export const updateSettingDetail = async (item, employeeId, transaction) => {
  // 1. evaluation_setting_detail 테이블 업데이트
  const detailFields = [
    'updated_by = :updatedBy',
    'updated_at = CURRENT_TIMESTAMP()',
  ];
  const detailReplacements = {
    settingDetailId: item.settingDetailId,
    updatedBy: employeeId,
  };

  if (item.criteriaMasterId !== undefined) {
    detailFields.push('criteria_master_id = :criteriaMasterId');
    detailReplacements.criteriaMasterId = item.criteriaMasterId;
  }

  if (item.adjustmentMasterId !== undefined) {
    detailFields.push('adjustment_master_id = :adjustmentMasterId');
    detailReplacements.adjustmentMasterId = item.adjustmentMasterId;
  }

  const detailSql = `
    UPDATE ${db.ebiz}.evaluation_setting_detail
    SET ${detailFields.join(', ')}
    WHERE id = :settingDetailId;
  `;
  await db.sequelize.query(detailSql, {
    replacements: detailReplacements,
    type: db.sequelize.QueryTypes.UPDATE,
    transaction,
  });

  // 2. evaluation_progress 테이블을 각 step별로 개별 UPDATE
  for (let step = 1; step <= 3; step++) {
    const evaluatorId = item[`evaluatorId${step}`];
    const weight = item[`evaluatorWeight${step}`];

    // evaluatorId와 weight가 모두 없으면 해당 차수의 평가자가 없는 것이므로 UPDATE하지 않음
    if (evaluatorId === undefined && weight === undefined) {
      continue;
    }

    const progressFields = [
      'updated_by = :updatedBy',
      'updated_at = CURRENT_TIMESTAMP()',
    ];
    const progressReplacements = {
      settingDetailId: item.settingDetailId,
      evaluationStep: step,
      updatedBy: employeeId,
    };

    if (evaluatorId !== undefined) {
      progressFields.push('evaluator_id = :evaluatorId');
      progressReplacements.evaluatorId = evaluatorId;
    }

    if (weight !== undefined) {
      progressFields.push('weight = :weight');
      progressReplacements.weight = weight;
    }

    const progressUpdateSql = `
      UPDATE ${db.ebiz}.evaluation_progress
      SET ${progressFields.join(', ')}
      WHERE setting_detail_id = :settingDetailId AND evaluation_step = :evaluationStep;
    `;
    await db.sequelize.query(progressUpdateSql, {
      replacements: progressReplacements,
      type: db.sequelize.QueryTypes.UPDATE,
      transaction,
    });
  }
};

// 평가설정 디테일 삭제
export const deleteSettingDetail = async (params, transaction) => {
  const replacements = {};

  let deleteDetailSql = `DELETE FROM ${db.ebiz}.evaluation_setting_detail WHERE 1 = 1`;
  let deleteProgressSql = `DELETE FROM ${db.ebiz}.evaluation_progress WHERE 1 = 1`;

  // settingDetailId 기반 삭제 (saveSetting에서 호출 시)
  if (params.settingDetailId) {
    deleteDetailSql += ` AND id = :settingDetailId`;
    deleteProgressSql += ` AND setting_detail_id = :settingDetailId`;
    replacements.settingDetailId = params.settingDetailId;
  }
  // settingMasterId 기반 삭제 (deleteSetting에서 호출 시)
  else if (params.settingMasterId) {
    deleteDetailSql += ` AND master_id = :settingMasterId`;
    deleteProgressSql += ` AND setting_master_id = :settingMasterId`;
    replacements.settingMasterId = params.settingMasterId;
  }
  // 처리할 ID가 없으면 함수 종료
  else {
    return;
  }

  // progress 데이터 먼저 삭제
  await db.sequelize.query(deleteProgressSql, {
    replacements,
    type: db.sequelize.QueryTypes.DELETE,
    transaction,
  });

  // detail 데이터 삭제
  await db.sequelize.query(deleteDetailSql, {
    replacements,
    type: db.sequelize.QueryTypes.DELETE,
    transaction,
  });
};

// 평가설정 저장(등록, 수정)
export const saveSetting = async (params, employeeId) => {
  return await executeWithTransaction(async (transaction) => {
    const { master, detail } = params;
    let settingMasterId = master.id;

    if (settingMasterId) {
      // [수정] exports.xxx() 호출을 내부 함수 호출로 변경
      await updateSettingMaster(master, employeeId, transaction);
    } else {
      const { insertId } = await insertSettingMaster(
        master,
        employeeId,
        transaction,
      );
      settingMasterId = insertId;
    }

    const insertList = detail.filter((i) => i.action === 'insert');
    const updateList = detail.filter((i) => i.action === 'update');
    const deleteList = detail.filter((i) => i.action === 'delete');

    for (const item of insertList) {
      await insertSettingDetail(
        item,
        settingMasterId,
        employeeId,
        master.evaluationYear,
        transaction,
      );
    }
    for (const item of updateList) {
      await updateSettingDetail(item, employeeId, transaction);
    }
    for (const item of deleteList) {
      await deleteSettingDetail(
        { settingDetailId: item.settingDetailId },
        transaction,
      );
    }

    return { success: true, settingMasterId };
  });
};

// 평가설정 삭제
export const deleteSetting = async (params) => {
  console.log('params: ', params);

  return await executeWithTransaction(async (transaction) => {
    // 1. 평가설정 디테일 삭제 (전달받은 파라미터 그대로 넘김)
    await deleteSettingDetail(params, transaction);

    // 2. 평가설정 마스터 삭제 (전달받은 파라미터 그대로 넘김)
    await deleteSettingMaster(params, transaction);

    return { success: true };
  });
};
