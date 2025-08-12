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

import CriteriaPanel from '@/features/hr/evaluations/criteria/components/CriteriaPanel';
import CriteriaTable from '@/features/hr/evaluations/criteria/components/CriteriaTable';
import { criteriaLevel1Schema } from '@/features/hr/evaluations/criteria/schemas/criteriaSchema';

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

  // 테이블 선택/패널 모드
  const [selected, setSelected] = useState(null); // { level, ids:{ lv1Id }, node }
  const [selLevel, setSelLevel] = useState('none'); // 'none' | 'lv1'

  // Lv1 폼 + 에러
  const [lv1Form, setLv1Form] = useState({
    name: '',
    score: '',
    sortOrder: '',
  });
  const [lv1Errors, setLv1Errors] = useState({});

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

  // 테이블에서 Lv1 선택 시 편집으로
  const handleSelectFromTable = (payload) => {
    const lv1Id = payload?.ids?.lv1Id;
    if (!lv1Id) return;

    const node = detail.find((n) => n.id === lv1Id);
    if (!node) return;

    setSelected({ level: 'lv1', ids: { lv1Id }, node });
    setSelLevel('lv1');
    setLv1Form({
      name: node.name ?? '',
      score: node.score == null ? '' : String(node.score),
      sortOrder: node.sortOrder == null ? '' : String(node.sortOrder),
    });
    setLv1Errors({});
  };

  // Lv1 추가 버튼
  const onClickAddLv1 = () => {
    setSelected(null);
    setSelLevel('lv1');
    setLv1Form({ name: '', score: '', sortOrder: '' });
    setLv1Errors({});
  };

  // Lv1 저장(추가/수정) — zod 검증
  const handleSaveLv1 = () => {
    const input = {
      name: lv1Form.name,
      score: lv1Form.score, // 문자열로 넣고 schema에서 숫자 변환
      sortOrder: lv1Form.sortOrder === '' ? null : lv1Form.sortOrder,
    };

    const parsed = criteriaLevel1Schema.safeParse(input);
    if (!parsed.success) {
      const errs = {};
      parsed.error.errors.forEach((e) => {
        const key = String(e.path[0] || '');
        if (!errs[key]) errs[key] = e.message;
      });
      setLv1Errors(errs);
      return;
    }
    setLv1Errors({});
    const { name, score, sortOrder } = parsed.data;

    const editingId = selected?.ids?.lv1Id ?? null;
    const isEditing = !!editingId;

    const maxOrder = detail.reduce(
      (m, n) => Math.max(m, Number(n.sortOrder || 0)),
      0,
    );
    const finalOrder = isEditing ? sortOrder : sortOrder ?? maxOrder + 1;

    if (isEditing) {
      setDetail((prev) =>
        prev.map((n) =>
          n.id !== editingId
            ? n
            : {
                ...n,
                name,
                score,
                sortOrder: finalOrder,
                action: n.action === 'insert' ? 'insert' : 'update',
              },
        ),
      );
    } else {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now());
      setDetail((prev) => [
        ...prev,
        {
          id,
          name,
          score,
          sortOrder: finalOrder,
          level: '1',
          action: 'insert',
          children: [],
        },
      ]);
    }

    // 종료
    setSelected(null);
    setSelLevel('none');
    setLv1Form({ name: '', score: '', sortOrder: '' });
  };

  // Lv1 삭제
  const handleDeleteLv1 = () => {
    const editingId = selected?.ids?.lv1Id ?? null;
    if (!editingId) return;

    setDetail((prev) => {
      const target = prev.find((n) => n.id === editingId);
      if (!target) return prev;

      if (target.action === 'insert') {
        // 아직 서버 저장 전이면 실제 제거
        return prev.filter((n) => n.id !== editingId);
      }
      // 기존 데이터면 delete 마킹
      return prev.map((n) =>
        n.id === editingId ? { ...n, action: 'delete' } : n,
      );
    });

    setSelected(null);
    setSelLevel('none');
    setLv1Form({ name: '', score: '', sortOrder: '' });
    setLv1Errors({});
  };

  const panelMode = selected?.ids?.lv1Id
    ? 'edit'
    : selLevel === 'lv1'
      ? 'add'
      : 'none';

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
          <CriteriaTable
            detail={detail}
            readOnly={false}
            selected={selected}
            onSelect={handleSelectFromTable}
            containerSx={{ maxHeight: '100%' }}
          />
        </Paper>

        {/* 우측 패널 */}
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
          <CriteriaPanel
            mode={panelMode} // 'add' | 'edit' | 'none'
            onClickAddLv1={onClickAddLv1}
            onCancel={() => {
              setSelected(null);
              setSelLevel('none');
              setLv1Form({ name: '', score: '', sortOrder: '' });
              setLv1Errors({});
            }}
            // lv1
            lv1Form={lv1Form}
            lv1Errors={lv1Errors}
            onChangeLv1Form={setLv1Form}
            onSaveLv1={handleSaveLv1}
            onDeleteLv1={handleDeleteLv1}
          />
        </Paper>
      </Box>
    </Box>
  );
}
