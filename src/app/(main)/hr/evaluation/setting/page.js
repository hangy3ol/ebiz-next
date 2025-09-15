// [수정]
import {
  fetchEvaluationYearOptions,
  fetchOfficeOptions,
} from '@/common/services/codeService';
import SettingList from '@/features/hr/evaluation/setting/components/SettingList';
import { fetchSettingList } from '@/features/hr/evaluation/setting/services/settingService';

export default async function SettingPage() {
  // 1. 본문 목록 데이터 조회
  const { success, result } = await fetchSettingList({});

  if (!success) {
    throw new Error('목록 데이터를 가져오는 데 실패했습니다.');
  }

  // 2. 필터 옵션 데이터 병렬 조회
  const [officeOptionsResult, evaluationYearOptionsResult] = await Promise.all([
    fetchOfficeOptions(),
    fetchEvaluationYearOptions(),
  ]);

  // 3. filterOptions 객체로 가공
  const filterOptions = {
    office: [],
    evaluationYear: [],
  };

  if (officeOptionsResult.success) {
    filterOptions.office = officeOptionsResult.result;
  }
  if (evaluationYearOptionsResult.success) {
    filterOptions.evaluationYear = evaluationYearOptionsResult.result;
  }

  // 4. 클라이언트 컴포넌트에 initialData와 filterOptions를 각각 전달
  return <SettingList initialData={result} filterOptions={filterOptions} />;
}
