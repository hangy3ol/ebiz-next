// [수정]
import { fetchSettingById } from '@/features/hr/evaluation/setting/services/settingService';

// [수정] 컴포넌트명 변경 및 UI 렌더링 코드 제거
export default async function SettingViewPage({ params }) {
  const { settingMasterId } = params;

  // 1. 서버에서 데이터 조회
  const { success, master, detail } = await fetchSettingById(settingMasterId);

  // 2. 서버 콘솔(터미널)에 조회 결과 출력
  console.log('--- fetchSettingById Result ---');
  console.log('Success:', success);
  console.log('Master Data:', master);
  console.log('Detail Data:', detail);
  console.log('-----------------------------');

  // 3. 요청하신 대로 화면에는 아무것도 렌더링하지 않음
  return null;
}
