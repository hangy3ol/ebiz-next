import {
  fetchJobGroupOptions,
  fetchJobTitleOptions,
} from '@/common/services/codeService';
import { makeYearOptions } from '@/common/utils/yearOptions';
import CriteriaForm from '@/features/hr/evaluation/criteria/components/CriteriaForm';
import { fetchCriteriaById } from '@/features/hr/evaluation/criteria/services/criteriaService';

export default async function CriteriaEditPage({ params }) {
  const resolvedParams = await params;
  const criteriaMasterId = resolvedParams?.criteriaMasterId;

  const { success, result } = await fetchCriteriaById(criteriaMasterId);

  if (!success) {
    throw new Error();
  }

  // 선택옵션
  const [yearResult, jobGroupResult, jobTitleResult] = await Promise.all([
    makeYearOptions({
      startYear: 2023,
      range: 5,
      mode: 'forward',
      order: 'asc',
    }),
    fetchJobGroupOptions({ mode: 'evaluation' }),
    fetchJobTitleOptions(),
  ]);

  const selectOptions = {
    jobGroup: [],
    jobTitle: [],
  };

  if (yearResult) {
    selectOptions.year = yearResult;
  }
  if (jobGroupResult.success) {
    selectOptions.jobGroup = jobGroupResult.result;
  }
  if (jobTitleResult.success) {
    selectOptions.jobTitle = jobTitleResult.result;
  }

  return (
    <CriteriaForm
      mode="edit"
      initialData={result}
      selectOptions={selectOptions}
    />
  );
}
