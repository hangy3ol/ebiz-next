export const response = {
  // 요청이 정상적으로 처리되었을 때의 응답 객체 생성
  ok: (message, data) => ({ success: true, message, data }),

  // 요청이 실패하거나 에러가 발생했을 때의 응답 객체 생성
  fail: (message, data = null) => ({ success: false, message, data }),
};
