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

/* ---------- helpers (module-scope: stable identity) ---------- */
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

/**
 * detail: {
 *   level1: [{ id, name, score, sortOrder, action? }],
 *   level2: [{ id, parentId, name, sortOrder, action? }],
 *   level3: [{ id, parentId, rootId, name, ratio, sortOrder, action? }]
 * }
 */
export default function CriteriaTable({
  detail = { level1: [], level2: [], level3: [] },
  containerSx = { maxHeight: '100%' },
}) {
  // ---- build render model from separated levels ---------------------------
  const rendered = useMemo(() => {
    const lv1Raw = Array.isArray(detail.level1) ? detail.level1 : [];
    const lv2Raw = Array.isArray(detail.level2) ? detail.level2 : [];
    const lv3Raw = Array.isArray(detail.level3) ? detail.level3 : [];

    // 1) 삭제 제외 + 숫자 정규화 + 정렬
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

    // 2) 메타 계산
    //    - level2: rowSpan(자식 lv3 개수, 최소 1), totalRatio(자식 비율 합)
    const lv2WithMeta = lv2NormalizedPreMeta.map((lv2) => {
      const children3 = lv3Normalized.filter((c) => c.parentId === lv2.id);
      const rowSpan = children3.length || 1;
      const totalRatio = sum(children3, (c) => c.ratio);
      return { ...lv2, rowSpan, totalRatio };
    });

    //    - level1: rowSpan(lv2.rowSpan 합, 최소 1), totalRatio(하위 lv3 비율 총합)
    const lv1WithMeta = lv1NormalizedPreMeta.map((lv1) => {
      const children2 = lv2WithMeta.filter((c) => c.parentId === lv1.id);
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

  // ---- render -------------------------------------------------------------
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
          {/* 아무 항목도 없을 때 */}
          {rendered.lv1.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="text.secondary">
                  표시할 평가 기준이 없습니다.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {/* lv1 루프 */}
          {rendered.lv1.map((lv1) => {
            const lv2List = rendered.lv2.filter((x) => x.parentId === lv1.id);

            // lv2가 없을 때
            if (lv2List.length === 0) {
              return (
                <TableRow key={`lv1-${lv1.id}`}>
                  <TableCell rowSpan={1}>
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

            // lv2가 있을 때
            return lv2List.flatMap((lv2, lv2Idx) => {
              const lv3List = rendered.lv3.filter((x) => x.parentId === lv2.id);

              // lv3가 없을 때
              if (lv3List.length === 0) {
                return (
                  <TableRow key={`lv1-${lv1.id}-lv2-${lv2.id}`}>
                    {lv2Idx === 0 && (
                      <TableCell rowSpan={lv1.rowSpan}>
                        {lv1.name} ({lv1.score}점)
                        <br />
                        [총계: {fmtPct(lv1.totalRatio)}%]
                      </TableCell>
                    )}
                    <TableCell rowSpan={1}>
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

              // lv3가 있을 때
              return lv3List.map((lv3, lv3Idx) => (
                <TableRow key={`lv3-${lv3.id}`}>
                  {lv2Idx === 0 && lv3Idx === 0 && (
                    <TableCell rowSpan={lv1.rowSpan}>
                      {lv1.name} ({lv1.score}점)
                      <br />
                      [총계: {fmtPct(lv1.totalRatio)}%]
                    </TableCell>
                  )}
                  {lv3Idx === 0 && (
                    <TableCell rowSpan={lv2.rowSpan}>
                      {lv2.name}
                      <br />
                      [소계: {fmtPct(lv2.totalRatio)}%]
                    </TableCell>
                  )}
                  <TableCell>{lv3.name}</TableCell>
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
