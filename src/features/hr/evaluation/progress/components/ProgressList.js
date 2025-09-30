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
import { DataGrid } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useState, useEffect } from 'react';

// [수정] filterOptions prop 추가
export default function ProgressList({ initialRows = [], filterOptions = {} }) {
  const [mounted, setMounted] = useState(false);

  // [수정] columns를 데이터에 맞게 정의
  const columns = [
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
    { field: 'title', headerName: '평가명', flex: 1, minWidth: 250 },
    { field: 'createdByName', headerName: '등록자', width: 120 },
    { field: 'createdAt', headerName: '등록일시', width: 180 },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ... 제목 영역은 이전과 동일 ... */}
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
            <Select label="평가귀속연도" value="">
              <MenuItem value="">전체</MenuItem>
              {/* [추가] 평가귀속연도 옵션 렌더링 */}
              {filterOptions.evaluationYear?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>사업부</InputLabel>
            <Select label="사업부" value="">
              <MenuItem value="">전체</MenuItem>
              {/* [추가] 사업부 옵션 렌더링 */}
              {filterOptions.office?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>직군</InputLabel>
            <Select label="직군" value="">
              <MenuItem value="">전체</MenuItem>
              {/* [추가] 직군 옵션 렌더링 */}
              {filterOptions.jobGroup?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>직책</InputLabel>
            <Select label="직책" value="">
              <MenuItem value="">전체</MenuItem>
              {/* [추가] 직책 옵션 렌더링 */}
              {filterOptions.jobTitle?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <TextField label="키워드 검색" variant="outlined" size="small" />
          </FormControl>
          <Button variant="outlined">초기화</Button>
        </Box>
        {/* ... 액션 버튼 영역은 이전과 동일 ... */}
        <Box sx={{ display: 'flex', gap: 1 }}></Box>
      </Box>

      {/* 그리드 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {mounted ? (
          <DataGrid
            // [수정] initialRows와 columns를 props와 state에서 받도록 수정
            rows={initialRows}
            columns={columns}
            // [추가] getRowId 추가
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
