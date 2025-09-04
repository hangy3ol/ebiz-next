import { Box } from '@mui/material';

import {
  fetchJobGroupOptions,
  fetchJobTitleOptions,
} from '@/common/services/codeService';
import CriteriaCopyList from '@/features/hr/evaluations/criteria/components/CriteriaCopyList';
import { fetchCriteriaList } from '@/features/hr/evaluations/criteria/services/criteriaService';

export default async function CriteriaPopupPage({ searchParams }) {
  const criteriaMasterId = searchParams.criteriaMasterId;

  const { success, result } = await fetchCriteriaList({ criteriaMasterId });

  if (!success) {
    throw new Error('평가 기준 목록을 불러오는데 실패했습니다.');
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

  return (
    <Box sx={{ p: 3 }}>
      <CriteriaCopyList initialData={result} filterOptions={filterOptions} />
    </Box>
  );
}
