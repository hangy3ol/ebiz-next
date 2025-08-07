'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { loginAction } from '@/app/actions/auth/authAction';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { loginApi } from '@/services/auth/authApi';
import { useProfileStore } from '@/stores/useProfileStore';
import { loginSchema } from '@/validations/loginSchema';

export default function LoginForm() {
  // 상태
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 훅
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { setProfile } = useProfileStore();

  // 폼검증
  const {
    control,
    handleSubmit,
    setError, // 에러 메시지 직접 설정 시 사용
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      userId: '',
      password: '',
    },
  });

  const onSubmit = async ({ userId, password }) => {
    setLoading(true);

    try {
      const { success, message, data } = await loginApi({
        userId,
        password,
      });
      console.log(success, message, data);
      if (success) {
        setProfile(data);
        enqueueSnackbar(message, { variant: 'success' });
        router.push('/notices');
      } else {
        enqueueSnackbar(message, { variant: 'error' });
      }
    } catch (error) {
      console.error('로그인 실패', error);
      enqueueSnackbar('로그인 중 오류가 발생했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      {/* 다크 모드 토글 버튼 */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <ThemeToggleButton />
      </Box>

      {/* 로그인 폼 */}
      <Box
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          width: '100%',
          maxWidth: 400,
        }}
        component="form"
        onSubmit={handleSubmit(onSubmit)} // handleSubmit으로 폼 제출 처리
        noValidate // 브라우저 기본 유효성 검사 비활성화
      >
        <Typography variant="h5" component="h1" gutterBottom>
          로그인
        </Typography>

        {/* 사용자 ID 입력 필드 */}
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="사용자 ID"
              variant="outlined"
              fullWidth
              margin="normal"
              autoComplete="username"
              error={!!errors.userId} // 에러가 있으면 true
              helperText={errors.userId?.message || '\u200B'} // 에러 메시지 표시, 없으면 공백 유지
            />
          )}
        />

        {/* 비밀번호 입력 필드 */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="비밀번호"
              type={showPassword ? 'text' : 'password'} // 비밀번호 가시성 토글
              variant="outlined"
              fullWidth
              margin="normal"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message || '\u200B'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSubmit(onSubmit)();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePassword}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* 로그인 버튼 */}
        <Button
          type="submit" // 폼 제출 버튼
          variant="contained"
          fullWidth
          sx={{ mt: 3, mb: 2 }}
          disabled={loading} // 로딩 중일 때 버튼 비활성화
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
        </Button>
      </Box>
    </>
  );
}
