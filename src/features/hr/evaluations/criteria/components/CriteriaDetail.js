'use client';

import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { computeDetailMeta } from '@/features/hr/evaluations/criteria/utils/criteriaMeta';

export default function CriteriaDetail({ initialData }) {
  const { master, detail } = initialData;

  const detailWithMeta = useMemo(() => computeDetailMeta(detail), [detail]);

  // 훅
  const router = useRouter();

  // 비율 표기 헬퍼(소수 2자리)
  const fmtPct = (n) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          <Typography variant="h4">평가 기준 상세</Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="text"
            onClick={() => router.push('/hr/evaluations/criteria')}
          >
            목록
          </Button>
        </Box>
      </Box>

      {/* 본문 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', flexShrink: 1, mr: 1 }}
          >
            {master.title}
          </Typography>

          {/* 수정, 삭제 버튼 그룹 */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained">수정</Button>
            <Button variant="outlined" color="error">
              삭제
            </Button>
          </Box>
        </Box>

        {/* 작성 정보 */}
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            비고: {master.remark || '-'}
          </Typography>
        </Stack>

        {/* 본문 */}
        <Paper variant="outlined" sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TableContainer sx={{ maxHeight: '100%' }}>
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
                {detailWithMeta.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">
                        표시할 평가 기준이 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* lv1 루프 */}
                {detailWithMeta.map((lv1) => {
                  const lv2List = lv1.children || [];

                  // lv2가 전혀 없으면 단일행 안내
                  if (lv2List.length === 0) {
                    return (
                      <TableRow key={`lv1-${lv1.id}`}>
                        <TableCell rowSpan={1}>
                          {lv1.name} ({lv1.score}점)
                          <br />
                          [총계: {lv1.totalRatio}%]
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
                    const lv3List = lv2.children || [];

                    // lv3가 없으면 안내 행
                    if (lv3List.length === 0) {
                      return (
                        <TableRow key={`lv1-${lv1.id}-lv2-${lv2.id}`}>
                          {/* lv1 셀: 첫 lv2 첫 행에서만 출력 */}
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

                    // lv3가 있을 때 실제 지표 행들
                    return lv3List.map((lv3, lv3Idx) => (
                      <TableRow key={`lv3-${lv3.id}`}>
                        {/* lv1: 첫 lv2의 첫 lv3에서만 출력 */}
                        {lv2Idx === 0 && lv3Idx === 0 && (
                          <TableCell rowSpan={lv1.rowSpan}>
                            {lv1.name} ({lv1.score}점)
                            <br />
                            [총계: {fmtPct(lv1.totalRatio)}%]
                          </TableCell>
                        )}

                        {/* lv2: 각 lv2의 첫 lv3에서만 출력 */}
                        {lv3Idx === 0 && (
                          <TableCell rowSpan={lv2.rowSpan}>
                            {lv2.name}
                            <br />
                            [소계: {fmtPct(lv2.totalRatio)}%]
                          </TableCell>
                        )}

                        {/* lv3 데이터 */}
                        <TableCell>{lv3.name}</TableCell>
                        <TableCell align="right">{fmtPct(lv3.ratio)}</TableCell>
                      </TableRow>
                    ));
                  });
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}
