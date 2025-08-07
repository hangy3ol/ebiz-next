import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { updatePasswordAction } from '@/app/actions/auth/authAction';
import { updatePasswordApi } from '@/services/auth/authApi';
import { updatePasswordSchema } from '@/validations/updatePasswordSchema';

export default function UserPasswordDialog({ open, onClose, profile }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // 다이얼로그가 닫힐 때마다 reset 호출
  useEffect(() => {
    if (!open) {
      reset();
      setShowPassword(false);
    }
  }, [open, reset]);

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setLoading(true);

    try {
      const { success, message } = await updatePasswordApi({
        currentPassword,
        newPassword,
      });

      if (success) {
        enqueueSnackbar(message, { variant: 'success' });
        onClose();
      } else {
        enqueueSnackbar(message, { variant: 'error' });
      }
    } catch (error) {
      console.error('비밀번호 변경 실패', error);
      enqueueSnackbar('비밀번호 변경 중 오류가 발생했습니다.', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>비밀번호 변경</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
              }
              label="비밀번호 보기"
            />

            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="현재 비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message || '\u200B'}
                />
              )}
            />

            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="새 비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message || '\u200B'}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="비밀번호 확인"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message || '\u200B'}
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
          <Button type="submit" variant="contained">
            저장
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
