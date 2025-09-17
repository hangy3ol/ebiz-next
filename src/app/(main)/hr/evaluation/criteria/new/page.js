import {
  fetchJobGroupOptions,
  fetchJobTitleOptions,
} from '@/common/services/codeService';
import { makeYearOptions } from '@/common/utils/yearOptions';
import CriteriaForm from '@/features/hr/evaluation/criteria/components/CriteriaForm';

export default async function NewCriteriaPage() {
  const [yearResult, jobGroupResult, jobTitleResult] = await Promise.all([
    makeYearOptions({
      startYear: new Date().getFullYear(),
      range: 5,
      mode: 'forward',
      order: 'asc',
    }),
    fetchJobGroupOptions({ mode: 'evaluation' }),
    fetchJobTitleOptions(),
  ]);

  const selectOptions = {
    year: [],
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

  return <CriteriaForm mode="create" selectOptions={selectOptions} />;
}
