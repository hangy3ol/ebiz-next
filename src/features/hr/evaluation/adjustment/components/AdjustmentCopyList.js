'use client';

import { Box, Button, TextField, Typography, Skeleton } from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { matchIncludes } from '@/common/utils/filters';

export default function AdjustmentCopyList({ initialData }) {
  // 상태
  const [rows, setRows] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
  }); // 그리드 api

  const apiRef = useGridApiRef(); // 훅

  const router = useRouter(); // 그리드 컬럼 정의

  const columns = useMemo(
    () => [
      {
        field: 'rowNum',
        headerName: '번호',
        headerAlign: 'center',
        align: 'center',
      },
      { field: 'title', headerName: '제목' },
      { field: 'remark', headerName: '비고' },
    ],
    [],
  ); // 필터링 로직

  const searchableFields = useMemo(() => ['title', 'createdByName'], []);
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      matchIncludes(row, filters.keyword, searchableFields),
    );
  }, [rows, filters, searchableFields]); // 마운트 상태 설정

  useEffect(() => {
    setMounted(true);
  }, []); // 필터 초기화 핸들러

  const handleReset = () => {
    setFilters({ keyword: '' });
    if (apiRef.current) {
      apiRef.current.setFilterModel({ items: [] });
      apiRef.current.setSortModel([]);
      apiRef.current.autosizeColumns({ expand: true });
    }
  }; // 행 클릭 핸들러

  const handleRowClick = ({ id }) => {
    router.push(`/popup/hr/evaluation/adjustment/${id}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        감/가점 기준 목록
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="키워드 검색"
          variant="outlined"
          size="small"
          value={filters.keyword}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, keyword: e.target.value }))
          }
        />

        <Button variant="outlined" onClick={handleReset}>
          초기화
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {mounted ? (
          <DataGrid
            apiRef={apiRef}
            rows={filteredRows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.adjustmentMasterId}
            initialState={{
              pagination: { paginationModel: { pageSize: 100 } },
            }}
            pageSizeOptions={[100]}
            density="compact"
            localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
            disableColumnMenu
            autosizeOnMount
            autosizeOptions={{ includeHeaders: true, expand: true }}
            onRowClick={handleRowClick}
            sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
          />
        ) : (
          <Skeleton variant="rounded" height="100%" animation="wave" />
        )}
      </Box>
    </Box>
  );
}
