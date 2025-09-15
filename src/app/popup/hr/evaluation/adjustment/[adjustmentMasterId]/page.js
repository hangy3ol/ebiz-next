import { Box } from '@mui/material';

import AdjustmentCopyView from '@/features/hr/evaluation/adjustment/components/AdjustmentCopyView';
import { fetchAdjustmentById } from '@/features/hr/evaluation/adjustment/services/adjustmentService';

export default async function AdjustmentCopyDetailPage({ params }) {
  // URL 파라미터에서 adjustmentMasterId를 추출
  const { adjustmentMasterId } = params; // 서버에서 해당 ID의 감/가점 기준 상세 정보 조회

  const { success, result } = await fetchAdjustmentById(adjustmentMasterId); // 데이터 조회 실패 시 에러 처리

  if (!success) {
    throw new Error('감/가점 기준 상세 정보를 불러오는데 실패했습니다.');
  }

  return (
    <Box sx={{ p: 3, height: '100vh', boxSizing: 'border-box' }}>
      <AdjustmentCopyView initialData={result} />
    </Box>
  );
}
