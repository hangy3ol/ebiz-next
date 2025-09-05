'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

// [수정] isEditable, onRowClick prop 추가
function AdjustmentTable({
  label,
  data,
  isEditable = false,
  onRowClick = () => {},
}) {
  const { level1, level2 } = data;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>

      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: '20%' }}>
                항목
              </TableCell>
              <TableCell align="center" sx={{ width: '30%' }}>
                내용
              </TableCell>
              <TableCell align="center" sx={{ width: '10%' }}>
                {label}
              </TableCell>
              <TableCell align="center" sx={{ width: '30%' }}>
                처리기준
              </TableCell>
              <TableCell align="center" sx={{ width: '10%' }}>
                중복구분
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {level1.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    등록된 {label} 항목이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {level1.map((lv1) => {
              const children = level2.filter((lv2) => lv2.parentId === lv1.id);

              if (children.length === 0) {
                return (
                  // [수정] 행(Row)에 클릭 이벤트 및 스타일 적용
                  <TableRow
                    key={lv1.id}
                    onClick={() => isEditable && onRowClick('level1', lv1)}
                    sx={{
                      cursor: isEditable ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: isEditable
                          ? 'action.hover'
                          : 'transparent',
                      },
                    }}
                  >
                    <TableCell>{lv1.name}</TableCell>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        등록된 내용이 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              return children.map((lv2, index) => (
                // [수정] 행(Row)에 클릭 이벤트 및 스타일 적용
                <TableRow
                  key={lv2.id}
                  onClick={() => isEditable && onRowClick('level2', lv2)}
                  sx={{
                    cursor: isEditable ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: isEditable
                        ? 'action.hover'
                        : 'transparent',
                    },
                  }}
                >
                  {index === 0 && (
                    <TableCell
                      rowSpan={lv1.rowSpan}
                      onClick={(e) => {
                        e.stopPropagation(); // 하위 요소 클릭 시 이벤트 전파 중단
                        isEditable && onRowClick('level1', lv1);
                      }}
                    >
                      {lv1.name}
                    </TableCell>
                  )}
                  <TableCell>{lv2.name}</TableCell>
                  <TableCell align="right">{lv2.score ?? ''}</TableCell>
                  {index === 0 && (
                    <TableCell rowSpan={lv1.rowSpan}>
                      {lv1.guideline || '-'}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    {lv2.duplicateLimit === -1
                      ? '무제한'
                      : `${lv2.duplicateLimit}회`}
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AdjustmentTable;
