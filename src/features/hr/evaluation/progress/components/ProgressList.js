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
// [수정] useGridApiRef import 추가
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useState, useEffect, useMemo } from 'react';

import { matchEquals, matchIncludes } from '@/common/utils/filters';

export default function ProgressList({ initialRows = [], filterOptions = {} }) {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    evaluationYear: '',
    officeId: '',
    jobGroup: '',
    jobTitle: '',
    keyword: '',
  });

  // [추가] 그리드 api 참조
  const apiRef = useGridApiRef();

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // [추가] 검색 조건, 그리드 초기화 메서드
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ... 제목, 필터 영역은 이전과 동일 ... */}
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
          {/* [수정] onClick 이벤트에 handleReset 연결 */}
          <Button variant="outlined" onClick={handleReset}>
            초기화
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}></Box>
      </Box>

      {/* 그리드 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {mounted ? (
          <DataGrid
            // [수정] apiRef prop 추가
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
              noRowsLabel: '진행할 평가가 없습니다.',
            }}
            disableColumnMenu
            autosizeOnMount
            autosizeOptions={{
              includeHeaders: true,
              expand: true,
            }}
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
