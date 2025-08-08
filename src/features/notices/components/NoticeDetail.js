'use client';

import { InsertDriveFile } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import { formatFileSize } from '@/utils/fileUtils';
import { formatDate } from '@/utils/formatDate';

export default function NoticeDetail({ initialData }) {
  const { notice, files } = initialData;

  // 훅
  const router = useRouter();

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
          <Typography variant="h4">공지사항 상세</Typography>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="text" onClick={() => router.push('/notices')}>
            목록
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
      >
        {/* 게시글 제목과 수정/삭제 버튼을 같은 줄에 배치 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', flexShrink: 1, mr: 1 }}
          >
            {notice.title}
          </Typography>

          {/* 수정, 삭제 버튼 그룹 */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained" disabled>
              수정
            </Button>
            <Button variant="outlined" color="error" disabled>
              삭제
            </Button>
          </Box>
        </Box>

        {/* 작성 정보 */}
        <Stack direction="row" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            작성자: {notice.createdByName ?? notice.createdBy ?? '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            작성일자: {formatDate(notice.createdAt, 'yyyy-MM-dd HH:mm')}
          </Typography>
        </Stack>

        {/* 본문 */}
        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minHeight: 240, overflowY: 'auto' }}
        >
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {notice.content ?? ''}
          </Typography>
        </Paper>

        <Divider />

        {/* 첨부파일 (항상 섹션 유지) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            첨부파일
          </Typography>

          <Paper variant="outlined" sx={{ p: 1 }}>
            {files.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ px: 1, py: 0.5 }}
              >
                첨부파일 없음
              </Typography>
            ) : (
              <List dense>
                {files.map((file) => {
                  const name = file.name ?? '파일';
                  const bytes = file.fileSize; // 서버가 보장
                  const sizeLabel = Number.isFinite(bytes)
                    ? ` (${formatFileSize(bytes)})`
                    : '';

                  return (
                    <ListItem key={file.id} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <InsertDriveFile fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography noWrap title={name}>
                            {name}
                            {sizeLabel}
                          </Typography>
                        }
                        secondary={file.mime_type || file.type || undefined}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
