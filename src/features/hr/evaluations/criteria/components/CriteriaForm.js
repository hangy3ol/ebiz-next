'use client';

import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

export default function CriteriaFormPage({ selectOptions }) {
  const router = useRouter();

  // 옵션
  const { year = [], jobGroup = [], jobTitle = [] } = selectOptions || {};

  // 데모 전용 선택 레벨(실제 구현 땐 제거)
  const [selLevel, setSelLevel] = useState('none');

  // 선택값
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedJobGroup, setSelectedJobGroup] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');

  // 이름 조회 헬퍼
  const getName = (list, id) => list.find((x) => x.id === id)?.name1 || '';

  // 제목은 "연도 + 직군 + 직책"이 모두 선택된 경우에만 생성
  useEffect(() => {
    const allSelected = !!(
      selectedYear &&
      selectedJobGroup &&
      selectedJobTitle
    );

    if (!allSelected) {
      setTitle('');
      return;
    }

    const y = getName(year, selectedYear); // ex) "2025년"
    const g = getName(jobGroup, selectedJobGroup);
    const t = getName(jobTitle, selectedJobTitle);

    setTitle(`${y} 귀속 ${g} ${t} 평가기준`);
  }, [
    selectedYear,
    selectedJobGroup,
    selectedJobTitle,
    year,
    jobGroup,
    jobTitle,
  ]);

  // 데모 테이블 데이터(모양만)
  const sample = useMemo(
    () => [
      {
        id: 'L1-A',
        name: '구분 A',
        score: 50,
        totalRatio: 100,
        rowSpan: 3,
        children: [
          {
            id: 'L2-A1',
            name: '평가항목 A-1',
            totalRatio: 60,
            rowSpan: 2,
            children: [
              { id: 'L3-A11', name: '평가지표 A-1-1', ratio: 30 },
              { id: 'L3-A12', name: '평가지표 A-1-2', ratio: 30 },
            ],
          },
          {
            id: 'L2-A2',
            name: '평가항목 A-2',
            totalRatio: 40,
            rowSpan: 1,
            children: [{ id: 'L3-A21', name: '평가지표 A-2-1', ratio: 40 }],
          },
        ],
      },
      {
        id: 'L1-B',
        name: '구분 B',
        score: 50,
        totalRatio: 100,
        rowSpan: 2,
        children: [
          {
            id: 'L2-B1',
            name: '평가항목 B-1',
            totalRatio: 100,
            rowSpan: 2,
            children: [
              { id: 'L3-B11', name: '평가지표 B-1-1', ratio: 60 },
              { id: 'L3-B12', name: '평가지표 B-1-2', ratio: 40 },
            ],
          },
        ],
      },
    ],
    [],
  );

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
        <Typography variant="h4">평가 기준 등록</Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="text"
            onClick={() => router.push('/hr/evaluations/criteria')}
          >
            목록
          </Button>
          <Button variant="contained" disabled>
            저장
          </Button>
        </Stack>
      </Box>

      {/* 본문 레이아웃: Flex 좌/우 */}
      <Box sx={{ display: 'flex', gap: 2, minHeight: 0, flex: 1 }}>
        {/* 좌측 */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            flex: '1 1 0%',
            minWidth: 0,
          }}
        >
          {/* 상단 마스터 입력영역 */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            {/* 연도 */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>연도</InputLabel>
              <Select
                label="연도"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {year.map((y) => (
                  <MenuItem key={y.id} value={y.id}>
                    {y.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 직군 */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>직군</InputLabel>
              <Select
                label="직군"
                value={selectedJobGroup}
                onChange={(e) => setSelectedJobGroup(e.target.value)}
              >
                {jobGroup.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 직책 */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>직책</InputLabel>
              <Select
                label="직책"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
              >
                {jobTitle.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 제목 (자동 생성, 읽기 전용) */}
            <TextField
              label="제목"
              size="small"
              fullWidth
              value={title}
              InputProps={{ readOnly: true }}
              placeholder="연도·직군·직책을 모두 선택하세요"
            />

            {/* 비고 */}
            <TextField
              label="비고"
              size="small"
              fullWidth
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="비고(선택)"
            />
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* 미리보기 테이블(데모) */}
          <TableContainer sx={{ overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 260 }}>
                    구분
                  </TableCell>
                  <TableCell align="center" sx={{ width: 260 }}>
                    평가항목
                  </TableCell>
                  <TableCell align="center">평가지표</TableCell>
                  <TableCell align="center" sx={{ width: 120 }}>
                    비율(%)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sample.map((lv1) => {
                  if (!lv1.children?.length) {
                    return (
                      <TableRow key={lv1.id}>
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

                  return lv1.children.flatMap((lv2, lv2Idx) => {
                    if (!lv2.children?.length) {
                      return (
                        <TableRow key={`${lv1.id}-${lv2.id}`}>
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

                    return lv2.children.map((lv3, lv3Idx) => (
                      <TableRow key={`${lv1.id}-${lv2.id}-${lv3.id}`}>
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
        </Paper>

        {/* 우측 패널(데모) */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: '0 0 380px',
            width: 380,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" fontWeight="bold">
              에디트 패널
            </Typography>
            <Chip
              size="small"
              label={
                selLevel === 'none'
                  ? '선택 없음'
                  : `선택: ${selLevel.toUpperCase()}`
              }
            />
          </Stack>

          {/* 데모 전환 토글 (실제 구현 시 삭제 예정) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              선택 레벨(데모):
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={selLevel}
              exclusive
              onChange={(_, v) => v && setSelLevel(v)}
            >
              <ToggleButton value="none">없음</ToggleButton>
              <ToggleButton value="lv1">구분</ToggleButton>
              <ToggleButton value="lv2">평가항목</ToggleButton>
              <ToggleButton value="lv3">평가지표</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined">구분 추가</Button>
            <Button variant="outlined" disabled={selLevel === 'none'}>
              평가항목 추가
            </Button>
            <Button
              variant="outlined"
              disabled={selLevel === 'none' || selLevel === 'lv1'}
            >
              평가지표 추가
            </Button>
          </Stack>

          <Divider />

          {selLevel === 'none' && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                왼쪽에서 선택하거나 위 버튼으로 추가를 시작하세요.
              </Typography>
            </Box>
          )}

          {selLevel === 'lv1' && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">구분 편집</Typography>
              <TextField
                label="구분명"
                size="small"
                fullWidth
                placeholder="예: 성과"
              />
              <TextField
                label="점수"
                size="small"
                fullWidth
                placeholder="예: 40"
              />
              <TextField
                label="정렬 순서"
                size="small"
                fullWidth
                placeholder="미입력 시 자동"
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" color="error">
                  삭제
                </Button>
                <Button variant="contained">저장</Button>
              </Stack>
            </Stack>
          )}

          {selLevel === 'lv2' && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">평가항목 편집</Typography>
              <FormControl size="small" fullWidth>
                <InputLabel>구분</InputLabel>
                <Select label="구분" value="">
                  <MenuItem value="">구분 선택</MenuItem>
                  <MenuItem value="L1-A">구분 A</MenuItem>
                  <MenuItem value="L1-B">구분 B</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="평가항목명"
                size="small"
                fullWidth
                placeholder="예: 매출"
              />
              <TextField
                label="정렬 순서"
                size="small"
                fullWidth
                placeholder="미입력 시 자동"
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" color="error">
                  삭제
                </Button>
                <Button variant="contained">저장</Button>
              </Stack>
            </Stack>
          )}

          {selLevel === 'lv3' && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">평가지표 편집</Typography>
              <FormControl size="small" fullWidth>
                <InputLabel>구분</InputLabel>
                <Select label="구분" value="" disabled>
                  <MenuItem value="">(선택됨)</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>평가항목</InputLabel>
                <Select label="평가항목" value="">
                  <MenuItem value="">평가항목 선택</MenuItem>
                  <MenuItem value="L2-A1">평가항목 A-1</MenuItem>
                  <MenuItem value="L2-A2">평가항목 A-2</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="평가지표명"
                size="small"
                fullWidth
                multiline
                minRows={3}
                placeholder="예: 월매출"
              />
              <TextField
                label="비율(%)"
                size="small"
                fullWidth
                placeholder="예: 20"
              />
              <TextField
                label="정렬 순서"
                size="small"
                fullWidth
                placeholder="미입력 시 자동"
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" color="error">
                  삭제
                </Button>
                <Button variant="contained">저장</Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
