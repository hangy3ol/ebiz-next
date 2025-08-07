'use client';

import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  Skeleton,
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo } from 'react';

import NoticeDetailDialog from '@/app/(main)/notices/components/NoticeDetailDialog';
import { matchIncludes } from '@/utils/filters';

export default function NoticeList({ initialData, currentUser }) {
  // 상태
  const [rows, setRows] = useState(initialData);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 훅
  const router = useRouter();
  const apiRef = useGridApiRef();
  const { enqueueSnackbar } = useSnackbar();

  // 그리드 컬럼
  const columns = useMemo(
    () => [
      { field: 'rowNum', headerName: '번호' },
      { field: 'title', headerName: '제목' },
      { field: 'createdByName', headerName: '등록자' },
      { field: 'createdAt', headerName: '등록일시' },
      { field: 'updatedByName', headerName: '수정자' },
      { field: 'updatedAt', headerName: '수정일시' },
    ],
    [],
  );

  // 필터
  const searchableFields = useMemo(
    () => columns.map((column) => column.field),
    [columns],
  );
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      matchIncludes(row, filters.keyword, searchableFields),
    );
  }, [rows, filters, searchableFields]);

  // 마운트
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색 조건, 그리드 초기화
  const handleReset = () => {
    // 1. 검색 조건 상태 초기화
    setFilters({
      keyword: '',
    });

    // 2. DataGrid 내부 상태 초기화 (apiRef 사용)
    if (apiRef.current) {
      // 필터 모델 초기화
      apiRef.current.setFilterModel({ items: [] });
      // 정렬 모델 초기화
      apiRef.current.setSortModel([]);
      // 열 너비 자동 조절
      apiRef.current.autosizeColumns({
        includeHeaders: true,
        expand: true,
      });
      // 페이지네이션을 0페이지로 이동
      apiRef.current.setPage(0);
    }
  };

  // 등록
  const createNotice = () => {
    router.push('/notices/new');
  };

  // 그리드 행 원클릭
  const handleRowClick = ({ id, row }) => {
    // 클릭된 행의 데이터를 상태에 저장
    setSelectedNotice(id);
    setDialogOpen(true);
  };

  // 공지사항 다이얼로그 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNotice(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/*  제목 + 전역 액션 버튼 줄 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">공지사항 목록</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>{/* 버튼 */}</Box>
      </Box>

      {/*  버튼 제어 영역 (그리드 액션 관련) */}
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
        {/* 필터 영역 (좌측) */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <TextField
              label="키워드 검색"
              variant="outlined"
              size="small"
              value={filters.keyword}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
            />
          </FormControl>

          <Button variant="outlined" onClick={handleReset}>
            초기화
          </Button>
        </Box>

        {/* 그리드 관련 도구 영역 (우측) */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={createNotice}>
            등록
          </Button>
        </Box>
      </Box>

      {/* 그리드 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {mounted ? (
          <DataGrid
            apiRef={apiRef}
            rows={filteredRows}
            columns={columns}
            throttleRowsMs={0}
            getRowId={(row) => row.noticeId}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 100 } },
            }}
            pageSizeOptions={[100]}
            density="compact"
            localeText={{
              ...koKR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: '등록된 데이터가 없습니다.',
            }}
            disableColumnMenu
            autosizeOnMount // 마운트시 열너비 자동조절 추가
            autosizeOptions={{
              includeHeaders: true,
              // includeOutliers: false,
              // outliersFactor,
              expand: true,
            }} // 마운트시 열너비 자동조절 옵션
            onRowClick={handleRowClick}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
          />
        ) : (
          <Skeleton variant="rounded" height="100%" animation="wave" />
        )}
      </Box>

      {/* 공지사항 상세 다이얼로그 */}
      {selectedNotice && (
        <NoticeDetailDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          noticeId={selectedNotice}
        />
      )}
    </Box>
  );
}
