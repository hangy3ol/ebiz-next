import { db } from '@/libs/db';

// 트랜잭션 내에서 실행할 async 함수
export async function executeWithTransaction(
  operation,
  externalTransaction = null,
) {
  let trx = externalTransaction; // 외부 트랜잭션이 있으면 그것을 사용
  const isNewTransaction = !trx; // 내부에서 새 트랜잭션을 생성해야 하는지 여부

  if (isNewTransaction) {
    trx = await db.sequelize.transaction(); // 새로운 트랜잭션 시작
  }

  try {
    const result = await operation(trx); // 트랜잭션을 넘겨서 비즈니스 로직 실행

    if (isNewTransaction) {
      await trx.commit(); // 내가 생성한 트랜잭션이라면 커밋
    }

    return result; // 결과 반환
  } catch (err) {
    if (isNewTransaction && trx) {
      try {
        await trx.rollback(); // 에러 발생 시 롤백
      } catch (rollbackErr) {
        console.error('트랜잭션 롤백 중 오류 발생:', rollbackErr);
      }
    }
    console.error('트랜잭션 실행 중 오류 발생:', err);
    throw err; // 에러를 상위로 전파
  }
}
