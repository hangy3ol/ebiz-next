import { Box } from '@mui/material';

import AdjustmentCopyList from '@/features/hr/evaluation/adjustment/components/AdjustmentCopyList';
import { fetchAdjustmentList } from '@/features/hr/evaluation/adjustment/services/adjustmentService';

export default async function AdjustmentCopyPage({ searchParams }) {
  // 서버에서 감/가점 기준 목록을 조회합니다.
  const { success, result } = await fetchAdjustmentList(searchParams);

  if (!success) {
    throw new Error('평가 기준 목록을 불러오는데 실패했습니다.');
  }

  return (
    <Box sx={{ p: 3, height: '100vh', boxSizing: 'border-box' }}>
      {/* 조회한 데이터를 initialData prop으로 전달하여 리스트 컴포넌트를 렌더링합니다. */}
      <AdjustmentCopyList initialData={result} />
    </Box>
  );
}
