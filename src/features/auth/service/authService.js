import { db } from '@/libs/db';
import { convertCamelCase } from '@/utils/caseConverter';
import { executeWithTransaction } from '@/utils/executeWithTransaction';

// 로그인
export async function login({ userId, password }) {
  try {
    // 1. 비밀번호 조회
    const { password: storedPassword } = await db.sequelize.query(
      `
				SELECT password
				FROM ${db.ebiz}.user_passwords
				WHERE user_id = :userId
				LIMIT 1;
			`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT,
        plain: true, // 결과 1건만 객체로 반환
      },
    );

    if (!storedPassword) {
      throw new Error('사용자가 존재하지 않습니다.');
    }

    if (password !== storedPassword) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 2. 사용자 상세 정보 조회
    const [raw] = await db.sequelize.query(
      `
				SELECT
					id AS user_id,
					name,
					office_id,
					fn_get_office_name(office_id) AS office_name,
					fn_get_office_color_code(office_id) AS office_color_code,
					department_id,
					fn_get_department_name(department_id) AS department_name,
					position_id,
					fn_get_position_name(position_id) AS position_name,
					contact,
					email,
					hire_date,
					fn_get_dis_users_code(id) AS dis_code,
					hrm_code
				FROM ${db.ebiz}.users
				WHERE retirement_date IS NULL
					AND id = :userId
				LIMIT 1;
			`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT,
      },
    );

    if (!raw) {
      throw new Error('퇴직자이거나 사용자 정보가 없습니다.');
    }

    const user = convertCamelCase(raw);

    return { success: true, result: user };
  } catch (error) {
    console.error('[login] 로그인 실패:', error);
    throw error;
  }
}

// 비밀번호 변경
export async function updatePassword(
  { currentPassword, newPassword, excutedBy },
  transaction = null,
) {
  return await executeWithTransaction(async (trx) => {
    try {
      // 1. 비밀번호 조회
      const { password: storedPassword } = await db.sequelize.query(
        `
					SELECT password
					FROM ${db.ebiz}.user_passwords
					WHERE user_id = :excutedBy
					LIMIT 1;
				`,
        {
          replacements: { excutedBy },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: trx,
          plain: true, // 결과 1건만 객체로 반환
        },
      );

      if (!storedPassword) {
        throw new Error('사용자가 존재하지 않습니다.');
      }

      if (currentPassword !== storedPassword) {
        throw new Error('현재 비밀번호가 일치하지 않습니다.');
      }

      // 2. 비밀번호 업데이트
      await db.sequelize.query(
        `
					UPDATE ${db.ebiz}.user_passwords
					SET password = :newPassword
					WHERE user_id = :excutedBy;
				`,
        {
          replacements: { newPassword, excutedBy },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: trx,
        },
      );

      return { success: true };
    } catch (error) {
      console.error('[changePassword] 비밀번호 변경 실패:', error);
      throw error;
    }
  }, transaction);
}
