'use client';

import { Box, Button, Typography } from '@mui/material';
import NoSsr from '@mui/material/NoSsr';
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

export default function ListTemplateLayout() {
  // 필수 상태만 정의
  const [rows, setRows] = useState([]); // ✅ 빈 배열
  const [loading, setLoading] = useState(false); // ✅ 기본 false
  const { enqueueSnackbar } = useSnackbar(); // ✅ 필수 스낵바 훅

  // 예시 스낵바 호출 (없어도 렌더링엔 영향 없음)
  useEffect(() => {
    // enqueueSnackbar('목록 레이아웃 템플릿입니다.', { variant: 'info' });
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: '이름', flex: 1 },
  ]; // ✅ 최소 컬럼 정의

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 제목 + 전역 버튼 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">목록 페이지 템플릿</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" disabled>
            전역 설정
          </Button>
          <Button variant="outlined" disabled>
            기타
          </Button>
        </Box>
      </Box>

      {/* 필터 + 툴바 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          rowGap: 1,
          mb: 2,
        }}
      >
        {/* 필터 (좌측) */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" disabled>
            필터1
          </Button>
          <Button variant="outlined" disabled>
            필터2
          </Button>
          <Button variant="outlined" disabled>
            필터3
          </Button>
          <Button variant="outlined" disabled>
            키워드 검색
          </Button>
        </Box>

        {/* 도구 버튼 (우측) */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" disabled>
            엑셀 다운로드
          </Button>
          <Button variant="outlined" disabled>
            선택 삭제
          </Button>
          <Button variant="outlined" disabled>
            데이터 새로고침
          </Button>
          <Button variant="contained" disabled>
            + 등록
          </Button>
        </Box>
      </Box>

      {/* 그리드 */}
      <NoSsr>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 100 } },
            }}
            pageSizeOptions={[100]}
            density="compact"
            localeText={{
              ...koKR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: '데이터가 없습니다.',
            }}
            disableColumnMenu
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
              },
            }}
          />
        </Box>
      </NoSsr>
    </Box>
  );
}
