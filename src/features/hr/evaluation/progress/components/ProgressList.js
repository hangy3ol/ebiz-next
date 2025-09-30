'use client';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

import { matchEquals, matchIncludes } from '@/common/utils/filters';

export default function ProgressList({ initialRows = [], filterOptions = {} }) {
  // 상태
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    evaluationYear: '',
    officeId: '',
    jobGroup: '',
    jobTitle: '',
    keyword: '',
  });

  // 그리드 api
  const apiRef = useGridApiRef();

  // 훅
  const router = useRouter();

  // 그리드 컬럼
  const columns = useMemo(
    () => [
      {
        field: 'rowNum',
        headerName: '번호',
      },
      {
        field: 'evaluationYearLabel',
        headerName: '평가귀속연도',
      },
      { field: 'officeName', headerName: '사업부' },
      { field: 'title', headerName: '평가명' },
      { field: 'createdByName', headerName: '등록자' },
      { field: 'createdAt', headerName: '등록일시' },
    ],
    [],
  );

  // 필터
  const searchableFields = useMemo(
    () => columns.map((column) => column.field),
    [columns],
  );
  const filteredRows = useMemo(() => {
    return initialRows.filter(
      (row) =>
        matchEquals(row.evaluationYear, filters.evaluationYear) &&
        matchEquals(row.officeId, filters.officeId) &&
        matchEquals(row.jobGroupCode, filters.jobGroup) &&
        matchEquals(row.jobTitleCode, filters.jobTitle) &&
        matchIncludes(row, filters.keyword, searchableFields),
    );
  }, [initialRows, filters, searchableFields]);

  // 마운트
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색 조건, 그리드 초기화
  const handleReset = () => {
    // 1. 검색 조건 상태 초기화
    setFilters({
      evaluationYear: '',
      officeId: '',
      jobGroup: '',
      jobTitle: '',
      keyword: '',
    });

    // 2. DataGrid 내부 상태 초기화 (apiRef 사용)
    if (apiRef.current) {
      apiRef.current.setFilterModel({ items: [] });
      apiRef.current.setSortModel([]);
      apiRef.current.autosizeColumns({ includeHeaders: true, expand: true });
      apiRef.current.setPage(0);
    }
  };

  // 등록
  const handleCreate = async () => {
    router.push(`/hr/evaluation/progress/new`);
  };

  // 그리드 행 원클릭
  const handleRowClick = ({ id, row }) => {
    router.push(`/hr/evaluation/progress/${id}`);
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
        <Typography variant="h4">평가 진행 목록</Typography>
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
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>평가귀속연도</InputLabel>
            <Select
              label="평가귀속연도"
              value={filters.evaluationYear}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  evaluationYear: e.target.value,
                }))
              }
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.evaluationYear?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>사업부</InputLabel>
            <Select
              label="사업부"
              value={filters.officeId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, officeId: e.target.value }))
              }
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.office?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>직군</InputLabel>
            <Select
              label="직군"
              value={filters.jobGroup}
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
              label="직책"
              value={filters.jobTitle}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.jobTitle?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
          <Button variant="contained" onClick={handleCreate}>
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
            getRowId={(row) => row.rowNum}
            throttleRowsMs={0}
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
            autosizeOnMount
            autosizeOptions={{
              includeHeaders: true,
              expand: true,
            }}
            onRowClick={handleRowClick}
            slotProps={{
              loadingOverlay: {
                variant: 'linear-progress',
                noRowsVariant: 'linear-progress',
              },
            }}
            sx={{
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
