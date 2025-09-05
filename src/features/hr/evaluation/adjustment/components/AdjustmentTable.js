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
import { useMemo } from 'react';

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const sum = (arr, pick = (x) => x) =>
  arr.reduce((acc, x) => acc + toNumber(pick(x), 0), 0);

const bySortOrder = (a, b) =>
  toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);

const isActive = (x) => x && x.action !== 'delete';

const fmtPct = (n) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

export default function AdjustmentTable({
  detail = { level1: [], level2: [], level3: [] },
  containerSx = { maxHeight: '100%' },
  onCellClick = () => {},
  isEditable = false,
}) {
  const rendered = useMemo(() => {
    const lv1Raw = Array.isArray(detail.level1) ? detail.level1 : [];
    const lv2Raw = Array.isArray(detail.level2) ? detail.level2 : [];
    const lv3Raw = Array.isArray(detail.level3) ? detail.level3 : [];

    const lv3Normalized = lv3Raw
      .filter(isActive)
      .map((x) => ({
        ...x,
        ratio: toNumber(x.ratio, 0),
        sortOrder: toNumber(x.sortOrder, 0),
      }))
      .sort(bySortOrder);

    const lv2NormalizedPreMeta = lv2Raw
      .filter(isActive)
      .map((x) => ({
        ...x,
        sortOrder: toNumber(x.sortOrder, 0),
      }))
      .sort(bySortOrder);

    const lv1NormalizedPreMeta = lv1Raw
      .filter(isActive)
      .map((x) => ({
        ...x,
        score: toNumber(x.score, 0),
        sortOrder: toNumber(x.sortOrder, 0),
      }))
      .sort(bySortOrder);

    const lv2WithMeta = lv2NormalizedPreMeta.map((lv2) => {
      const children3 = lv3Normalized.filter(
        (c) => String(c.parentId) === String(lv2.id),
      );
      const rowSpan = children3.length || 1;
      const totalRatio = sum(children3, (c) => c.ratio);
      return { ...lv2, rowSpan, totalRatio };
    });

    const lv1WithMeta = lv1NormalizedPreMeta.map((lv1) => {
      const children2 = lv2WithMeta.filter(
        (c) => String(c.parentId) === String(lv1.id),
      );
      const rowSpan =
        children2.length > 0 ? sum(children2, (c) => c.rowSpan) : 1;
      const totalRatio = sum(children2, (c) => c.totalRatio);
      return { ...lv1, rowSpan, totalRatio };
    });

    return {
      lv1: lv1WithMeta,
      lv2: lv2WithMeta,
      lv3: lv3Normalized,
    };
  }, [detail]);

  const clickableCellStyle = {
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'action.hover' },
  };

  const getCellProps = (level, item) => {
    if (!isEditable) return {};
    return {
      onClick: () => onCellClick(level, item),
      sx: clickableCellStyle,
    };
  };

  console.log(rendered);

  return (
    <TableContainer sx={containerSx}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center">구분</TableCell>
            <TableCell align="center">평가항목</TableCell>
            <TableCell align="center">평가지표</TableCell>
            <TableCell align="center">비율(%)</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rendered.lv1.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="text.secondary">
                  표시할 평가 기준이 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {rendered.lv1.map((lv1) => {
            const lv2List = rendered.lv2.filter(
              (x) => String(x.parentId) === String(lv1.id),
            );

            if (lv2List.length === 0) {
              return (
                <TableRow key={`lv1-${lv1.id}`}>
                  <TableCell rowSpan={1} {...getCellProps('level1', lv1)}>
                    <Box component="span" fontWeight="bold">
                      {lv1.name}
                    </Box>
                    ({lv1.score}점)
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      [총계: {fmtPct(lv1.totalRatio)}%]
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary">
                      평가항목/지표가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            }

            return lv2List.flatMap((lv2, lv2Idx) => {
              const lv3List = rendered.lv3.filter(
                (x) => String(x.parentId) === String(lv2.id),
              );

              if (lv3List.length === 0) {
                return (
                  <TableRow key={`lv1-${lv1.id}-lv2-${lv2.id}`}>
                    {lv2Idx === 0 && (
                      <TableCell
                        rowSpan={lv1.rowSpan}
                        {...getCellProps('level1', lv1)}
                      >
                        <Box component="span" fontWeight="bold">
                          {lv1.name}
                        </Box>{' '}
                        ({lv1.score}점)
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          [총계: {fmtPct(lv1.totalRatio)}%]
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell rowSpan={1} {...getCellProps('level2', lv2)}>
                      <Box component="span" fontWeight="bold">
                        {lv2.name}
                      </Box>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        [소계: {fmtPct(lv2.totalRatio)}%]
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={2} align="center">
                      <Typography color="text.secondary">
                        평가지표가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              return lv3List.map((lv3, lv3Idx) => (
                <TableRow key={`lv3-${lv3.id}`}>
                  {lv2Idx === 0 && lv3Idx === 0 && (
                    <TableCell
                      rowSpan={lv1.rowSpan}
                      {...getCellProps('level1', lv1)}
                    >
                      <Box component="span" fontWeight="bold">
                        {lv1.name}
                      </Box>{' '}
                      ({lv1.score}점)
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        [총계: {fmtPct(lv1.totalRatio)}%]
                      </Typography>
                    </TableCell>
                  )}
                  {lv3Idx === 0 && (
                    <TableCell
                      rowSpan={lv2.rowSpan}
                      {...getCellProps('level2', lv2)}
                    >
                      <Box component="span" fontWeight="bold">
                        {lv2.name}
                      </Box>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        [소계: {fmtPct(lv2.totalRatio)}%]
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell {...getCellProps('level3', lv3)}>
                    {lv3.name}
                  </TableCell>
                  <TableCell align="right" {...getCellProps('level3', lv3)}>
                    {fmtPct(lv3.ratio)}
                  </TableCell>
                </TableRow>
              ));
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
