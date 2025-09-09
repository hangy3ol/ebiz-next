'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup'; // [추가] yup을 직접 임포트

import {
  adjustmentLevel1Schema,
  adjustmentLevel2Schema,
} from '@/features/hr/evaluation/adjustment/schemas/adjustmentSchema';

export default function AdjustmentFormDialog({
  open,
  onClose,
  dialogType,
  mode = 'add',
  initialData = null,
  onSubmit,
  onDelete,
  level1Option = [],
}) {
  // [수정] dialogType이 없을 경우를 대비하여 기본값 할당
  const [division, level] = dialogType ? dialogType.split('-') : ['', ''];

  const schemaMap = {
    level1: adjustmentLevel1Schema,
    level2: adjustmentLevel2Schema,
  };

  // [수정] 모든 Hook을 컴포넌트 최상단에서 무조건 호출
  const form = useForm({
    // level이 없을 경우 빈 스키마를 사용하도록 하여 오류 방지
    resolver: yupResolver(schemaMap[level] || yup.object()),
  });

  const { control, reset, handleSubmit } = form;

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        // null 값을 빈 문자열로 변환하는 데이터 정제 로직
        const sanitizedData = {
          ...initialData,
          name: initialData.name ?? '',
          guideline: initialData.guideline ?? '',
          sortOrder: initialData.sortOrder ?? '',
          score: initialData.score ?? '',
          parentId: initialData.parentId ?? '',
          duplicateLimit: initialData.duplicateLimit ?? -1,
        };
        reset(sanitizedData);
      } else {
        // 추가 모드일 때 필드 초기화
        const defaultValues =
          level === 'level1'
            ? { name: '', guideline: '', sortOrder: '' }
            : {
                parentId: '',
                name: '',
                score: '',
                duplicateLimit: -1,
                sortOrder: '',
              };
        reset(defaultValues);
      }
    }
  }, [open, mode, initialData, level, reset]);

  const getTitle = () => {
    // level이 아직 없을 경우 제목을 렌더링하지 않음
    if (!level) return '';
    const divisionText = division === 'penalty' ? '감점' : '가점';
    const levelText = level === 'level1' ? '항목' : '내용';
    const modeText = mode === 'add' ? '추가' : '수정';
    return `${divisionText} ${levelText} ${modeText}`;
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(initialData);
    }
    onClose();
  };

  // [수정] open이 false이면 아무것도 렌더링하지 않음
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {getTitle()}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {level === 'level1' && (
          <Stack spacing={2} mt={1}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="항목명"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="guideline"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="처리기준"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="sortOrder"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="정렬 순서"
                  type="number"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message || '미입력 시 자동 설정됩니다.'
                  }
                />
              )}
            />
          </Stack>
        )}
        {level === 'level2' && (
          <Stack spacing={2} mt={1}>
            <Controller
              name="parentId"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>항목</InputLabel>
                  <Select {...field} label="항목">
                    {level1Option.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="내용"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="score"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="점수"
                  type="number"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="duplicateLimit"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>중복 구분</InputLabel>
                  <Select {...field} label="중복 구분">
                    <MenuItem value={-1}>무제한</MenuItem>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}회
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="sortOrder"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="정렬 순서"
                  type="number"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message || '미입력 시 자동 설정됩니다.'
                  }
                />
              )}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        {mode === 'edit' && (
          <Button onClick={handleDeleteClick} color="error">
            삭제
          </Button>
        )}
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          color="primary"
        >
          {mode === 'add' ? '추가' : '수정'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
