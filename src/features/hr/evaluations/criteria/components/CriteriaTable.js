'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

import { computeDetailMeta } from '@/features/hr/evaluations/criteria/utils/criteriaMeta';

export default function CriteriaTable({
  detail = [],
  readOnly = true,
  selected = null, // 선택 하이라이트는 현재 미사용
  onSelect = null,
  containerSx = { maxHeight: '100%' },
}) {
  const detailWithMeta = useMemo(() => computeDetailMeta(detail), [detail]);
  const fmtPct = (n) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

  const clickable = !readOnly;
  const cellBase = clickable ? { cursor: 'pointer' } : { cursor: 'default' };
  const cellHover = clickable ? { '&:hover': { bgcolor: 'action.hover' } } : {};

  const click = (level, ids, node) => {
    if (!clickable || !onSelect) return;
    onSelect({ level, ids, node });
  };

  return (
    <TableContainer sx={containerSx}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center">구분</TableCell>
            <TableCell align="center">평가 항목</TableCell>
            <TableCell align="center">평가 지표</TableCell>
            <TableCell align="center">비율(%)</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {detailWithMeta.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="text.secondary">
                  표시할 평가 기준이 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {detailWithMeta.map((lv1) => {
            const lv2List = lv1.children || [];

            if (lv2List.length === 0) {
              return (
                <TableRow key={`lv1-${lv1.id}`}>
                  <TableCell
                    rowSpan={1}
                    sx={{ ...cellBase, ...cellHover }}
                    onClick={() =>
                      click(
                        'lv1',
                        { lv1Id: lv1.id, lv2Id: null, lv3Id: null },
                        lv1,
                      )
                    }
                  >
                    {lv1.name} ({lv1.score}점)
                    <br />
                    [총계: {fmtPct(lv1.totalRatio)}%]
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
              const lv3List = lv2.children || [];

              if (lv3List.length === 0) {
                return (
                  <TableRow key={`lv1-${lv1.id}-lv2-${lv2.id}`}>
                    {lv2Idx === 0 && (
                      <TableCell
                        rowSpan={lv1.rowSpan}
                        sx={{ ...cellBase, ...cellHover }}
                        onClick={() =>
                          click(
                            'lv1',
                            { lv1Id: lv1.id, lv2Id: null, lv3Id: null },
                            lv1,
                          )
                        }
                      >
                        {lv1.name} ({lv1.score}점)
                        <br />
                        [총계: {fmtPct(lv1.totalRatio)}%]
                      </TableCell>
                    )}

                    <TableCell
                      rowSpan={1}
                      sx={{ ...cellBase, ...cellHover }}
                      onClick={() =>
                        click(
                          'lv2',
                          { lv1Id: lv1.id, lv2Id: lv2.id, lv3Id: null },
                          lv2,
                        )
                      }
                    >
                      {lv2.name}
                      <br />
                      [소계: {fmtPct(lv2.totalRatio)}%]
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
                      sx={{ ...cellBase, ...cellHover }}
                      onClick={() =>
                        click(
                          'lv1',
                          { lv1Id: lv1.id, lv2Id: null, lv3Id: null },
                          lv1,
                        )
                      }
                    >
                      {lv1.name} ({lv1.score}점)
                      <br />
                      [총계: {fmtPct(lv1.totalRatio)}%]
                    </TableCell>
                  )}

                  {lv3Idx === 0 && (
                    <TableCell
                      rowSpan={lv2.rowSpan}
                      sx={{ ...cellBase, ...cellHover }}
                      onClick={() =>
                        click(
                          'lv2',
                          { lv1Id: lv1.id, lv2Id: lv2.id, lv3Id: null },
                          lv2,
                        )
                      }
                    >
                      {lv2.name}
                      <br />
                      [소계: {fmtPct(lv2.totalRatio)}%]
                    </TableCell>
                  )}

                  <TableCell
                    sx={{ ...cellBase, ...cellHover }}
                    onClick={() =>
                      click(
                        'lv3',
                        { lv1Id: lv1.id, lv2Id: lv2.id, lv3Id: lv3.id },
                        lv3,
                      )
                    }
                  >
                    {lv3.name}
                  </TableCell>
                  <TableCell align="right">{fmtPct(lv3.ratio)}</TableCell>
                </TableRow>
              ));
            });
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
