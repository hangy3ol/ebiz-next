'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import FileUploader from '@/components/FileUploader';
import { saveNoticeApi } from '@/features/notices/api/noticeApi';
import { noticeSchema } from '@/features/notices/schemas/noticeSchema';

export default function NoticeForm({ mode = 'create', initialData = null }) {
  const isEdit = mode === 'edit';

  const [files, setFiles] = useState(initialData?.files || []);

  // 훅
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(noticeSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: initialData?.notice?.title || '',
      content: initialData?.notice?.content || '',
    },
  });

  const onSubmit = async (data) => {
    console.log(data, files);
    try {
      // form 객체 생성
      const formData = new FormData();

      // 공지사항 본문
      formData.append('notice', JSON.stringify(data));

      // 첨부파일이 있는 경우
      if (files.length > 0) {
        // 첨부파일 등록
        files
          .filter((item) => item.action === 'insert')
          .forEach((item) => {
            formData.append('files', item.file);
          });

        // 첨부파일 삭제
        const filesToDelete = JSON.stringify(
          files
            .filter((item) => item.action === 'delete')
            .map((item) => item.id),
        );
        formData.append('filesToDelete', filesToDelete);
      }

      const { success, message } = await saveNoticeApi(formData);
      console.log(success, message);
      if (success) {
        enqueueSnackbar(message, { variant: 'success' });
        router.push('/notices');
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('공지사항 저장에 실패했습니다.', {
        variant: 'error',
      });
    }
  };

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
          <Typography variant="h4">
            {isEdit ? '공지사항 수정' : '공지사항 등록'}
          </Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text">취소</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)}>
            {isEdit ? '수정' : '등록'}
          </Button>
        </Box>
      </Box>

      {/* 본문/메타/첨부 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* 제목 */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="제목"
              fullWidth
              required
              placeholder="제목을 입력하세요"
              sx={{ mt: 1 }}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        {/* 본문 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="본문"
                fullWidth
                multiline
                required
                placeholder="내용을 입력하세요"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                  },
                  '& .MuiInputBase-input': {
                    overflowY: 'auto !important',
                    height: '100% !important',
                  },
                }}
                error={!!errors.content}
                helperText={errors.content?.message}
              />
            )}
          />
        </Box>

        <Divider />

        {/* 첨부 파일 */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">첨부파일</Typography>

          <FileUploader
            files={files}
            onChange={setFiles}
            maxFiles={3}
            maxSize={10 * 1024 * 1024}
          />
        </Stack>
      </Box>
    </Box>
  );
}
