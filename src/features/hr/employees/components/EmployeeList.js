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
  Checkbox,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { confirm } from '@/common/utils/confirm';
import { exportGridToExcel } from '@/common/utils/exportExcel';
import { matchEquals, matchIncludes } from '@/common/utils/filters';
import {
  fetchEmployeeListApi,
  syncEmployeesFromDisApi,
} from '@/features/hr/employees/api/employeeApi';

export default function EmployeeList({ initialData, filterOptions = {} }) {
  // 상태
  const [rows, setRows] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    office: '',
    department: '',
    position: '',
    keyword: '',
  });
  const [includeAll, setIncludeAll] = useState(false);

  // 그리드 api
  const apiRef = useGridApiRef();

  // 훅
  const { enqueueSnackbar } = useSnackbar();

  // 그리드 컬럼
  const columns = useMemo(
    () => [
      { field: 'rowNum', headerName: '번호' },
      { field: 'officeName', headerName: '사업부' },
      { field: 'departmentName', headerName: '부서' },
      { field: 'positionName', headerName: '직위' },
      { field: 'userId', headerName: '사원번호' },
      { field: 'userName', headerName: '이름' },
      { field: 'contact', headerName: '연락처' },
      { field: 'email', headerName: '이메일' },
      { field: 'hireDate', headerName: '입사일자' },
      { field: 'retirementDate', headerName: '퇴직일자' },
      { field: 'lastSyncAt', headerName: '최근연동일시' },
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
        matchEquals(row.officeId, filters.office) &&
        matchEquals(row.departmentId, filters.department) &&
        matchEquals(row.positionId, filters.position) &&
        matchIncludes(row, filters.keyword, searchableFields),
    );
  }, [rows, filters, searchableFields]);

  // 마운트
  useEffect(() => {
    setMounted(true);
  }, []);

  // 재조회
  const loadEmployeeList = useCallback(async () => {
    setLoading(true);
    try {
      const { data, success } = await fetchEmployeeListApi({ includeAll });
      if (success) {
        setRows(data);
      }
    } catch (err) {
      enqueueSnackbar('직원 목록 재조회 실패', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [includeAll, enqueueSnackbar]);

  // 최초 조회시 재조회 수행하지 않도록
  useEffect(() => {
    if (!mounted) {
      return;
    }

    loadEmployeeList();
  }, [includeAll, mounted, loadEmployeeList]);

  // 직원 DIS 동기화
  const handleSync = async () => {
    const isConfirm = await confirm({
      title: '확인 요청',
      content: 'DIS 시스템과 직원 정보를 동기화하시겠습니까?',
    });

    try {
      if (isConfirm) {
        const { success, message } = await syncEmployeesFromDisApi();
        if (success) {
          handleReset();
          await loadEmployeeList();
          enqueueSnackbar(message, { variant: 'success' });
        } else {
          enqueueSnackbar(message, { variant: 'error' });
        }
      }
    } catch (error) {
      enqueueSnackbar('직원 데이터 동기화에 실패했습니다.', {
        variant: 'error',
      });
    }
  };

  // 검색 조건, 그리드 초기화
  const handleReset = () => {
    // 1. 검색 조건 상태 초기화
    setFilters({
      office: '',
      department: '',
      position: '',
      keyword: '',
    });
    setIncludeAll(false);

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

  // 엑셀 다운로드
  const handleExport = () => {
    // 현재 날짜를 YYYYMMDD 형식으로 포맷팅
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 1월은 0이므로 +1
    const day = String(now.getDate()).padStart(2, '0');

    const today = `${year}${month}${day}`; // 포맷팅된 날짜를 파일명에 추가

    const filename = `${today}_임직원목록.xlsx`;

    exportGridToExcel(apiRef, filename);
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
        <Typography variant="h4">직원 목록</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleSync}>
            DIS 동기화
          </Button>
        </Box>
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
            <InputLabel>사업부</InputLabel>
            <Select
              value={filters.office}
              label="사업부"
              size="small"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, office: e.target.value }))
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
            <InputLabel>부서</InputLabel>
            <Select
              value={filters.department}
              label="부서"
              size="small"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.department?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>직위</InputLabel>
            <Select
              value={filters.position}
              label="직위"
              size="small"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  position: e.target.value,
                }))
              }
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">전체</MenuItem>
              {filterOptions.position?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={includeAll}
                onChange={(e) => setIncludeAll(e.target.checked)}
              />
            }
            label="퇴사자 포함"
          />

          <Button variant="outlined" onClick={handleReset}>
            초기화
          </Button>
        </Box>

        {/* 그리드 관련 도구 영역 (우측) */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={handleExport} color="excel">
            다운로드
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
            getRowId={(row) => row.userId}
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
    </Box>
  );
}
