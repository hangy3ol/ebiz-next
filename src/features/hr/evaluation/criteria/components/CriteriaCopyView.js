'use client'; // 클라이언트 컴포넌트로 지정

import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

import { confirm } from '@/common/utils/confirm'; // [추가] confirm 유틸리티 임포트
import CriteriaTable from '@/features/hr/evaluation/criteria/components/CriteriaTable';

// [수정] 컴포넌트 명을 CriteriaCopyView로 변경
export default function CriteriaCopyView({ initialData }) {
  const { master, detail } = initialData;
  const router = useRouter();

  // 목록으로 돌아가는 핸들러
  const handleBackToList = () => {
    // 팝업 내에서 URL을 변경하여 목록 화면으로 돌아갑니다.
    router.push('/popup/hr/evaluation/criteria');
  }; // 이 평가 기준을 복사하는 핸들러

  const handleCopy = async () => {
    const isConfirmed = await confirm({
      title: '평가 기준 복사',
      content:
        '기존 내용은 삭제되고, 선택한 평가 기준의 항목이 적용됩니다. 최종 저장은 등록 화면에서 완료해야 합니다. 계속하시겠습니까?',
    });

    if (isConfirmed) {
      // [수정] 부모 창에 데이터를 전달하고 팝업을 닫는 로직
      // 부모 창의 handleCopyCallback 함수가 있는지 확인합니다.
      if (
        window.opener &&
        typeof window.opener.handleCopyCallback === 'function'
      ) {
        // 부모 창의 함수를 호출하며 복사할 데이터를 전달합니다.
        window.opener.handleCopyCallback(initialData.detail); // 작업 완료 후 팝업 창을 닫습니다.
        window.close();
      } else {
        alert('부모 창을 찾을 수 없습니다.');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          <Typography variant="h4">평가 기준 상세</Typography>
        </Stack>
        {/* 복사하기 버튼만 남기고 목록으로 버튼 삭제 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text" onClick={handleBackToList}>
            목록
          </Button>

          <Button variant="contained" onClick={handleCopy}>
            복사하기
          </Button>
        </Box>
      </Box>

      {/* 본문 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', flexShrink: 1, mr: 1 }}
          >
            {master.title}
          </Typography>

          {/* 버튼 그룹 */}
          {/* <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }>
						<Button variant="text">
            	목록으로
          	</Button>
          </Box> */}
        </Box>

        {/* 작성 정보 */}
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            비고: {master.remark || '-'}
          </Typography>
        </Stack>

        {/* 본문 */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <CriteriaTable
            detail={detail}
            containerSx={{ maxHeight: '100%' }}
            isEditable={false}
          />
        </Paper>
      </Box>
    </Box>
  );
}
