'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  criteriaLevel1Schema,
  criteriaLevel2Schema,
  criteriaLevel3Schema,
} from '@/features/hr/evaluations/criteria/schemas/criteriaSchema';

export default function CriteriaFormDialog({
  open,
  onClose,
  dialogType,
  onSubmit,
  level1Option = [],
  level2Option = [],
  mode = 'add',
  initialData = null,
}) {
  const schemaMap = {
    level1: criteriaLevel1Schema,
    level2: criteriaLevel2Schema,
    level3: criteriaLevel3Schema,
  };

  const form = useForm({
    resolver: yupResolver(schemaMap[dialogType]),
  });

  const { control, reset, handleSubmit, watch, setValue } = form;
  const rootId = watch('rootId');

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        reset(initialData);
      } else {
        if (dialogType === 'level1') {
          reset({ name: '', score: '', sortOrder: '' });
        } else if (dialogType === 'level2') {
          reset({ parentId: '', name: '', sortOrder: '' });
        } else if (dialogType === 'level3') {
          reset({
            rootId: '',
            parentId: '',
            name: '',
            ratio: '',
            sortOrder: '',
          });
        }
      }
    }
  }, [open, mode, initialData, dialogType, reset]);

  // ⭐️ [수정된 부분] mode === 'add' 조건을 추가하여 수정 모드에서는 이 로직이 실행되지 않도록 합니다.
  useEffect(() => {
    if (mode === 'add' && dialogType === 'level3' && rootId) {
      setValue('parentId', '');
    }
  }, [rootId, setValue, dialogType, mode]);

  const getTitle = () => {
    const actionText = mode === 'add' ? '추가' : '수정';
    switch (dialogType) {
      case 'level1':
        return `구분 ${actionText}`;
      case 'level2':
        return `평가 항목 ${actionText}`;
      case 'level3':
        return `평가 지표 ${actionText}`;
      default:
        return '';
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const filteredLevel2Options = level2Option.filter(
    (opt) => opt.parentId === rootId,
  );

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
        {dialogType === 'level1' && (
          <Stack spacing={2} mt={1}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="구분명"
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
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    '미입력 시 자동으로 순서가 설정됩니다.'
                  }
                />
              )}
            />
          </Stack>
        )}

        {dialogType === 'level2' && (
          <Stack spacing={2} mt={1}>
            <Controller
              name="parentId"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>구분</InputLabel>
                  <Select {...field} label="구분">
                    {level1Option.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <Typography variant="caption" color="error">
                      {fieldState.error.message}
                    </Typography>
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
                  label="평가항목명"
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
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    '미입력 시 자동으로 순서가 설정됩니다.'
                  }
                />
              )}
            />
          </Stack>
        )}

        {dialogType === 'level3' && (
          <Stack spacing={2} mt={1}>
            <Controller
              name="rootId"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>구분</InputLabel>
                  <Select {...field} label="구분">
                    {level1Option.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <Typography variant="caption" color="error">
                      {fieldState.error.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            <Controller
              name="parentId"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                  <InputLabel>평가 항목</InputLabel>
                  <Select {...field} label="평가 항목" disabled={!rootId}>
                    {filteredLevel2Options.map((opt) => (
                      <MenuItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <Typography variant="caption" color="error">
                      {fieldState.error.message}
                    </Typography>
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
                  label="평가 지표명"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="ratio"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="적용 비율(%)"
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
                  fullWidth
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    '미입력 시 자동으로 순서가 설정됩니다.'
                  }
                />
              )}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">
          취소
        </Button>
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
