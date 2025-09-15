import { Box } from '@mui/material';

import CriteriaCopyView from '@/features/hr/evaluation/criteria/components/CriteriaCopyView';
import { fetchCriteriaById } from '@/features/hr/evaluation/criteria/services/criteriaService';

export default async function CriteriaCopyViewPage({ params }) {
  // URL 파라미터에서 criteriaMasterId를 추출
  const { criteriaMasterId } = params;

  // 서버에서 해당 ID의 평가 기준 상세 정보 조회
  const { success, result } = await fetchCriteriaById(criteriaMasterId);

  // 데이터 조회 실패 시 에러 처리
  if (!success) {
    throw new Error('평가 기준 상세 정보를 불러오는데 실패했습니다.');
  }

  return (
    <Box sx={{ p: 3, height: '100vh', boxSizing: 'border-box' }}>
      <CriteriaCopyView initialData={result} />
    </Box>
  );
}
