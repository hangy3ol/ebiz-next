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

function AdjustmentTable({
  label,
  data,
  isEditable = false,
  onRowClick = () => {},
}) {
  const { level1, level2 } = data;

  // [추가] CriteriaTable과 동일한 셀 스타일 객체
  const clickableCellStyle = {
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'action.hover' },
  };

  // [추가] CriteriaTable과 동일한 prop 생성 헬퍼 함수
  const getCellProps = (level, item) => {
    if (!isEditable) return {};
    return {
      onClick: () => onRowClick(level, item),
      sx: clickableCellStyle,
    };
  };

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
                  // [삭제] 행(Row) 단위 이벤트 및 스타일 제거
                  <TableRow key={lv1.id}>
                    {/*
                    onClick={() => isEditable && onRowClick('level1', lv1)}
                    sx={{
                      cursor: isEditable ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: isEditable
                          ? 'action.hover'
                          : 'transparent',
                      },
                    }}
                  */}
                    {/* [수정] 개별 셀에 이벤트 적용 */}
                    <TableCell {...getCellProps('level1', lv1)}>
                      {lv1.name}
                    </TableCell>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        등록된 내용이 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              return children.map((lv2, index) => (
                // [삭제] 행(Row) 단위 이벤트 및 스타일 제거
                <TableRow key={lv2.id}>
                  {/*
                  onClick={() => isEditable && onRowClick('level2', lv2)}
                  sx={{
                    cursor: isEditable ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: isEditable
                        ? 'action.hover'
                        : 'transparent',
                    },
                  }}
                */}
                  {index === 0 && (
                    <TableCell
                      rowSpan={lv1.rowSpan}
                      // [수정] 개별 셀에 이벤트 적용 (기존 stopPropagation 로직은 불필요하여 제거)
                      {...getCellProps('level1', lv1)}
                    >
                      {lv1.name}
                    </TableCell>
                  )}
                  {/* [수정] 개별 셀에 이벤트 적용 */}
                  <TableCell {...getCellProps('level2', lv2)}>
                    {lv2.name}
                  </TableCell>
                  <TableCell align="right" {...getCellProps('level2', lv2)}>
                    {lv2.score ?? ''}
                  </TableCell>
                  {index === 0 && (
                    <TableCell
                      rowSpan={lv1.rowSpan}
                      // [수정] 개별 셀에 이벤트 적용
                      {...getCellProps('level1', lv1)}
                    >
                      {lv1.guideline || '-'}
                    </TableCell>
                  )}
                  <TableCell align="center" {...getCellProps('level2', lv2)}>
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
