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

// 테이블 렌더링 전문 컴포넌트
function AdjustmentTable({ label, data }) {
  const { level1, level2 } = data;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* 테이블 제목 */}
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>

      {/* 테이블 */}
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
            {/* level1 데이터가 없을 경우 */}
            {level1.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    등록된 {label} 항목이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/* level1 데이터를 순회하며 행 생성 */}
            {level1.map((lv1) => {
              const children = level2.filter((lv2) => lv2.parentId === lv1.id);

              // level2 데이터가 없는 경우
              if (children.length === 0) {
                return (
                  <TableRow key={lv1.id}>
                    <TableCell>{lv1.name}</TableCell>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        등록된 내용이 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              // level2 데이터가 있는 경우
              return children.map((lv2, index) => (
                <TableRow key={lv2.id}>
                  {index === 0 && (
                    <TableCell rowSpan={lv1.rowSpan}>{lv1.name}</TableCell>
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
