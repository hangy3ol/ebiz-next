'use client';

import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Skeleton,
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo } from 'react';

import { matchEquals, matchIncludes } from '@/common/utils/filters';

export default function CriteriaList({ initialData, filterOptions = {} }) {
  // 상태
  const [rows, setRows] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    jobGroup: '',
    jobTitle: '',
    keyword: '',
  });

  // 그리드 api
  const apiRef = useGridApiRef();

  // 훅
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // 그리드 컬럼
  const columns = useMemo(
    () => [
      { field: 'rowNum', headerName: '번호' },
      { field: 'title', headerName: '제목' },
      { field: 'jobGroupName', headerName: '직군' },
      { field: 'jobTitleName', headerName: '직책' },
      { field: 'remark', headerName: '비고' },
      { field: 'createdByName', headerName: '등록자' },
      { field: 'createdAt', headerName: '등록일시' },
      { field: 'updatedByName', headerName: '변경자' },
      { field: 'updatedAt', headerName: '변경일시' },
    ],
    [],
  );

  // 필터
  const searchableFields = useMemo(
    () => columns.map((column) => column.field),
    [columns],
  );
  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) =>
        matchEquals(row.jobGroupCode, filters.jobGroup) &&
        matchEquals(row.jobTitleCode, filters.jobTitle) &&
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
      jobGroup: '',
      jobTitle: '',
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
  const createCriteria = async () => {
    router.push(`/hr/evaluation/criteria/new`);
  };

  // 그리드 행 원클릭
  const handleRowClick = ({ id, row }) => {
    router.push(`/hr/evaluation/criteria/${id}`);
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
        <Typography variant="h4">평가 기준 목록</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}></Box>
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

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>직군</InputLabel>
            <Select
              value={filters.jobGroup}
              label="직군"
              size="small"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, jobGroup: e.target.value }))
              }
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.jobGroup?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>직책</InputLabel>
            <Select
              value={filters.jobTitle}
              label="직책"
              size="small"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.jobTitle?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={handleReset}>
            초기화
          </Button>
        </Box>

        {/* 그리드 관련 도구 영역 (우측) */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={createCriteria}>
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
            loading={loading}
            throttleRowsMs={0}
            getRowId={(row) => row.criteriaMasterId}
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
            sx={{
              // 행 위에 마우스를 올렸을 때 커서를 포인터로 변경
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              },
            }}
          />
        ) : (
          <Skeleton variant="rounded" height="100%" animation="wave" />
        )}
      </Box>
    </Box>
  );
}
