import {
  fetchJobGroupOptions,
  fetchJobTitleOptions,
} from '@/common/services/codeService';
import CriteriaList from '@/features/hr/evaluation/criteria/components/CriteriaList';
import { fetchCriteriaList } from '@/features/hr/evaluation/criteria/services/criteriaService';

export default async function CriteriaPage() {
  const { success, result } = await fetchCriteriaList();

  if (!success) {
    throw new Error();
  }

  // 필터옵션
  const [jobGroupResult, JobTitleResult] = await Promise.all([
    fetchJobGroupOptions({ mode: 'evaluation' }),
    fetchJobTitleOptions(),
  ]);

  const filterOptions = {
    jobGroup: [],
    jobTitle: [],
  };

  if (jobGroupResult.success) {
    filterOptions.jobGroup = jobGroupResult.result;
  }
  if (JobTitleResult.success) {
    filterOptions.jobTitle = JobTitleResult.result;
  }

  return <CriteriaList initialData={result} filterOptions={filterOptions} />;
}
