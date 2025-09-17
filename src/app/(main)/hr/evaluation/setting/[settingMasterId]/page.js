// [수정] 서비스 import 경로를 사용자님 환경에 맞게 수정
import { fetchEmployeeList } from '@/features/hr/employee/services/employeeService';
import { fetchAdjustmentList } from '@/features/hr/evaluation/adjustment/services/adjustmentService';
import { fetchCriteriaList } from '@/features/hr/evaluation/criteria/services/criteriaService';
import SettingView from '@/features/hr/evaluation/setting/components/SettingView';
import { fetchSettingById } from '@/features/hr/evaluation/setting/services/settingService';

export default async function SettingViewPage({ params }) {
  // [수정] params를 await으로 처리하여 동적 파라미터를 안전하게 가져옵니다.
  const resolvedParams = await params;
  const { settingMasterId } = resolvedParams;

  // 1. 기본 설정 정보 (master, detail) 조회
  const { success, master, detail } = await fetchSettingById(settingMasterId);

  if (!success || !master) {
    throw new Error('기본 설정 정보를 가져오는 데 실패했습니다.');
  }

  // 2. 나머지 목록 데이터 병렬 조회
  const [criteriaResult, adjustmentResult, employeeResult] = await Promise.all([
    fetchCriteriaList({
      jobGroupCode: master.jobGroupCode,
      jobTitleCode: master.jobTitleCode,
    }),
    fetchAdjustmentList({}),
    fetchEmployeeList({ evaluationYear: master.evaluationYear }),
  ]);

  // 3. 모든 데이터를 initialData 객체로 묶어 전달
  const initialData = {
    master,
    detail,
    criteriaList: criteriaResult.success ? criteriaResult.result : [],
    adjustmentList: adjustmentResult.success ? adjustmentResult.result : [],
    employeeList: employeeResult.success ? employeeResult.result : [],
  };

  return <SettingView initialData={initialData} />;
}
