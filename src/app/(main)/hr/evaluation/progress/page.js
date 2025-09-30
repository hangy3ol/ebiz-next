import {
  fetchEvaluationYearOptions,
  fetchOfficeOptions,
  fetchJobGroupOptions,
  fetchJobTitleOptions,
} from '@/common/services/codeService';
import ProgressList from '@/features/hr/evaluation/progress/components/ProgressList';
import { fetchProgressList } from '@/features/hr/evaluation/progress/services/progressService';
import { getCurrentUser } from '@/libs/auth/getCurrentUser';

export default async function ProgressPage() {
  // getCurrentUser를 호출하여 사용자 정보 가져오기
  const user = await getCurrentUser();
  if (!user) {
    throw new Error();
  }

  // 로그인한 사용자의 ID로 progress 목록 데이터 조회
  const { success, result } = await fetchProgressList(null, user.userId);
  if (!success) {
    throw new Error();
  }

  // 필터옵션
  const [
    evaluationYearOptionsResult,
    officeResult,
    jobGroupResult,
    jobTitleResult,
  ] = await Promise.all([
    fetchEvaluationYearOptions(),
    fetchOfficeOptions(),
    fetchJobGroupOptions({ mode: 'evaluation' }),
    fetchJobTitleOptions(),
  ]);

  const filterOptions = {
    office: [],
    evaluationYear: [],
    jobGroup: [],
    jobTitle: [],
  };

  if (evaluationYearOptionsResult.success) {
    filterOptions.evaluationYear = evaluationYearOptionsResult.result;
  }
  if (officeResult.success) {
    filterOptions.office = officeResult.result;
  }
  if (jobGroupResult.success) {
    filterOptions.jobGroup = jobGroupResult.result;
  }
  if (jobTitleResult.success) {
    filterOptions.jobTitle = jobTitleResult.result;
  }

  return <ProgressList initialRows={result} filterOptions={filterOptions} />;
}
