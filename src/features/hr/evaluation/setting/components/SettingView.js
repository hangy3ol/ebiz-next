'use client';

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import AdjustmentDataGrid from '@/features/hr/evaluation/setting/components/AdjustmentDataGrid';
import CriteriaDataGrid from '@/features/hr/evaluation/setting/components/CriteriaDataGrid';

export default function SettingView({ initialData }) {
  const router = useRouter();
  const { master, detail, criteriaList, adjustmentList, employeeList } =
    initialData || {};

  const selectedCriteriaId = detail?.[0]?.criteriaMasterId || null;
  const selectedAdjustmentId = detail?.[0]?.adjustmentMasterId || null;

  const handlePreviewClick = (e, row, type) => {
    e.stopPropagation(); // 행 클릭 방지

    const width = 1200;
    const height = 800;

    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const screenWidth =
      window.innerWidth ?? document.documentElement.clientWidth;
    const screenHeight =
      window.innerHeight ?? document.documentElement.clientHeight;

    const left = dualScreenLeft + (screenWidth - width) / 2;
    const top = dualScreenTop + (screenHeight - height) / 2;

    let url = '';
    if (type === 'criteria') {
      url = `${window.location.origin}/popup/hr/evaluation/criteria/${row.criteriaMasterId}`;
    } else if (type === 'adjustment') {
      url = `${window.location.origin}/popup/hr/evaluation/adjustment/${row.adjustmentMasterId}`;
    }
    window.open(
      url,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left}`,
    );
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          {master?.settingMasterId ? '평가 설정 상세' : '평가 설정 등록'}
        </Typography>
        <Button
          variant="text"
          onClick={() => router.push('/hr/evaluation/setting')}
        >
          목록
        </Button>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold" noWrap>
            {master?.title || '제목 없음'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained">수정</Button>
            <Button variant="outlined" color="error">
              삭제
            </Button>
          </Box>
        </Stack>

        {/* 전체 컨텐츠 영역을 감싸는 최상위 Paper는 유지 */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            p: 2,
            gap: 2,
            overflow: 'auto',
          }}
        >
          {/* 첫 번째 열 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0, height: '100%' }}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <CriteriaDataGrid
                criteriaList={criteriaList}
                selectedId={selectedCriteriaId}
                onPreviewClick={handlePreviewClick}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <AdjustmentDataGrid
                adjustmentList={adjustmentList}
                selectedId={selectedAdjustmentId}
                onPreviewClick={handlePreviewClick}
              />
            </Box>
          </Stack>

          {/* 두 번째 열 */}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                3. 대상자
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography color="text.secondary">(대상자 그리드)</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                4. 평가자
              </Typography>
              <Box sx={{ pt: 1, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  (평가자 선택 영역)
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* 세 번째 열 */}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              5. 평가설정 목록
            </Typography>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography color="text.secondary">
                (최종 설정 목록 그리드)
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}
