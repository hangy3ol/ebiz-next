'use client';

import {
  Box,
  Stack,
  Typography,
  Button,
  Divider,
  TextField,
} from '@mui/material';

export default function CriteriaPanel({
  mode = 'none', // 'add' | 'edit' | 'none'
  onClickAddLv1,
  onCancel,

  // lv1 폼
  lv1Form,
  lv1Errors = {},
  onChangeLv1Form,
  onSaveLv1,
  onDeleteLv1,
}) {
  const isNone = mode === 'none';
  const isEdit = mode === 'edit';
  const isAdd = mode === 'add';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 액션 버튼 */}
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={onClickAddLv1}>
          구분 추가
        </Button>
        <Button variant="outlined" disabled>
          평가 항목 추가
        </Button>
        <Button variant="outlined" disabled>
          평가 지표 추가
        </Button>
      </Stack>

      <Divider />

      {/* 기본 안내 */}
      {isNone && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            왼쪽에서 구분을 선택하거나 [구분 추가]를 눌러 시작하세요.
          </Typography>
        </Box>
      )}

      {/* 구분(Lv1) 폼 */}
      {(isAdd || isEdit) && (
        <Stack spacing={2}>
          {/* 타이틀 + (편집 시) 삭제 버튼 */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2">
              {isEdit ? '구분 편집' : '구분 추가'}
            </Typography>
            {isEdit && (
              <Button
                size="small"
                color="error"
                variant="text"
                onClick={onDeleteLv1}
              >
                삭제
              </Button>
            )}
          </Stack>

          <TextField
            label="구분명"
            size="small"
            fullWidth
            value={lv1Form.name ?? ''}
            onChange={(e) =>
              onChangeLv1Form({ ...lv1Form, name: e.target.value })
            }
            placeholder="예: 성과"
            error={!!lv1Errors.name}
            helperText={lv1Errors.name}
          />

          <TextField
            label="점수"
            size="small"
            fullWidth
            value={lv1Form.score ?? ''}
            onChange={(e) =>
              onChangeLv1Form({ ...lv1Form, score: e.target.value })
            }
            placeholder="예: 40"
            error={!!lv1Errors.score}
            helperText={lv1Errors.score}
          />

          <TextField
            label="정렬 순서"
            size="small"
            fullWidth
            value={lv1Form.sortOrder ?? ''}
            onChange={(e) =>
              onChangeLv1Form({ ...lv1Form, sortOrder: e.target.value })
            }
            placeholder="미입력 시 자동"
            error={!!lv1Errors.sortOrder}
            helperText={lv1Errors.sortOrder}
          />

          {/* 푸터: 취소/저장만 노출 */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" color="inherit" onClick={onCancel}>
              취소
            </Button>
            <Button variant="contained" onClick={onSaveLv1}>
              {isEdit ? '수정' : '추가'}
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
