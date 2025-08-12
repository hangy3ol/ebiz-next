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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import CriteriaTable from '@/features/hr/evaluations/criteria/components/CriteriaTable';

export default function CriteriaFormPage({ selectOptions }) {
  const router = useRouter();

  // 옵션
  const { year = [], jobGroup = [], jobTitle = [] } = selectOptions || {};

  // 선택값
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedJobGroup, setSelectedJobGroup] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [title, setTitle] = useState('');
  const [remark, setRemark] = useState('');

  // detail
  const [detail, setDetail] = useState([]);

  // 제목 자동 생성
  const getName = (list, id) => list.find((x) => x.id === id)?.name1 || '';
  useEffect(() => {
    if (!selectedYear || !selectedJobGroup || !selectedJobTitle) {
      setTitle('');
      return;
    }
    const y = getName(year, selectedYear);
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

      {/* 본문 레이아웃 */}
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
          {/* 상단 마스터 */}
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

            {/* 제목 (읽기전용) */}
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

          {/* 테이블 */}
          <CriteriaTable detail={detail} containerSx={{ maxHeight: '100%' }} />
        </Paper>
      </Box>
    </Box>
  );
}
