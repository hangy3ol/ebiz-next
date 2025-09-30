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

  // 그리드 api
  const apiRef = useGridApiRef();

  const columns = useMemo(
    () => [
      {
        field: 'rowNum',
        headerName: '번호',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'evaluationYearLabel',
        headerName: '평가귀속연도',
        align: 'center',
        headerAlign: 'center',
      },
      { field: 'officeName', headerName: '사업부' },
      { field: 'title', headerName: '평가명' },
      { field: 'createdByName', headerName: '등록자' },
      { field: 'createdAt', headerName: '등록일시' },
    ],
    [], // 의존성 배열을 비워두어 최초 1회만 생성되도록 함
  );

  // [추가] 키워드 검색 대상 필드 정의
  const searchableFields = useMemo(
    () => ['title', 'officeName', 'createdByName'],
    [],
  );

  // [추가] 필터링된 행 데이터
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

      {/* 버튼 제어 영역 */}
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
            {/* [수정] value, onChange 추가 */}
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
            {/* [수정] value, onChange 추가 */}
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
            {/* [수정] value, onChange 추가 */}
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
            {/* [수정] value, onChange 추가 */}
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
            {/* [수정] value, onChange 추가 */}
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
          <Button variant="outlined">초기화</Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}></Box>
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
