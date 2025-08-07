'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { saveNoticeAction } from '@/app/actions/notices/noticeAction';
import FileUploader from '@/components/FileUploader';
import { noticeSchema } from '@/validations/noticeSchema';

export default function NoticeForm({ initialData, isNew }) {
  const [files, setFiles] = useState([]);

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

      const { success, message } = await saveNoticeAction(formData);
      if (success) {
        enqueueSnackbar(message, { variant: 'success' });
        // router.push('/notices');
      }
    } catch (error) {
      enqueueSnackbar('공지사항 저장에 실패했습니다.', {
        variant: 'error',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/*  페이지 제목 + 전역 액션 버튼 줄 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">
          {isNew ? '공지사항 등록' : '공지사항 수정'}
        </Typography>
      </Box>

      {/* 컨테이너 */}
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
        {/* 버튼 그룹 */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {!isNew && (
            <Button variant="contained" color="error">
              삭제
            </Button>
          )}
          <Button type="submit" variant="contained">
            저장
          </Button>
        </Box>

        {/* 제목 */}
        <Box>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label="제목"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
        </Box>

        {/* 내용 */}
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
                fullWidth
                required
                label="내용"
                multiline
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

        {/*  첨부파일 */}
        <Box>
          {/* <Typography variant="subtitle1">첨부파일 영역</Typography> */}
          {/* 여기에 첨부파일 업로드 컴포넌트 등을 추가할 수 있습니다. */}
          <FileUploader
            files={files}
            onChange={setFiles}
            maxFiles={3}
            maxSize={10 * 1024 * 1024}
          />
        </Box>
      </Box>
    </Box>
  );
}
