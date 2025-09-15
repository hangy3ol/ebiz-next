'use client';

// [수정] mui 컴포넌트 추가 import
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
import { useEffect, useMemo, useState } from 'react';

// [수정] 필터 유틸리티 추가 import
import { matchEquals, matchIncludes } from '@/common/utils/filters';

// [수정] SettingList 컴포넌트 전체 수정
export default function SettingList({ initialData, filterOptions = {} }) {
  // 상태
  const [rows, setRows] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  // [수정] 필터 상태 변경
  const [filters, setFilters] = useState({
    evaluationYear: '',
    officeId: '',
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
        width: 80,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'evaluationYearLabel',
        headerName: '평가귀속연도',
        width: 120,
        align: 'center',
        headerAlign: 'center',
      },
      { field: 'officeName', headerName: '사업부', width: 150 },
      { field: 'title', headerName: '평가설정명', flex: 1, minWidth: 250 },
      { field: 'createdByName', headerName: '생성자', width: 120 },
      { field: 'createdAt', headerName: '생성일시', width: 180 },
      { field: 'updatedByName', headerName: '수정자', width: 120 },
      { field: 'updatedAt', headerName: '수정일시', width: 180 },
    ],
    [],
  );

  // 필터
  const searchableFields = useMemo(
    () => ['title', 'officeName', 'createdByName'],
    [],
  );
  // [수정] 필터링 로직 변경
  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) =>
        matchEquals(row.evaluationYear, filters.evaluationYear) &&
        matchEquals(row.officeId, filters.officeId) &&
        matchIncludes(row, filters.keyword, searchableFields),
    );
  }, [rows, filters, searchableFields]);

  // 마운트
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색 조건, 그리드 초기화
  const handleReset = () => {
    setFilters({
      evaluationYear: '',
      officeId: '',
      keyword: '',
    });

    if (apiRef.current) {
      apiRef.current.setFilterModel({ items: [] });
      apiRef.current.setSortModel([]);
      apiRef.current.autosizeColumns({ includeHeaders: true, expand: true });
      apiRef.current.setPage(0);
    }
  };

  // 등록
  const handleCreate = () => {
    router.push(`/hr/evaluation/setting/new`);
  };

  // 그리드 행 원클릭
  const handleRowClick = ({ id }) => {
    router.push(`/hr/evaluation/setting/${id}`);
  };

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
        <Typography variant="h4">평가 설정 목록</Typography>
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
          {/* [추가] 평가귀속연도 필터 */}
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>평가귀속연도</InputLabel>
            <Select
              value={filters.evaluationYear}
              label="평가귀속연도"
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

          {/* [추가] 사업부 필터 */}
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>사업부</InputLabel>
            <Select
              value={filters.officeId}
              label="사업부"
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

          {/* 키워드 검색 */}
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

        {/* 액션 버튼 영역 (우측) */}
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
            loading={loading}
            getRowId={(row) => row.settingMasterId} // [수정] PK 컬럼명 변경
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
            autosizeOptions={{ includeHeaders: true, expand: true }}
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
