import { AttachFile, Close } from '@mui/icons-material';
import {
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Divider,
  Dialog,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import {
  fetchNoticeById,
  deleteNotice,
  downloadNoticeAttachment,
  downloadNoticeAttachmentAll,
} from '@/services/notices/noticeService';
import { confirm } from '@/utils/confirm';
import { triggerFileDownload } from '@/utils/fileUtils';

export default function NoticeDetailDialog({ noticeId, onClose }) {
  // 상태
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

  // 훅
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // 공지사항 로드
  useEffect(() => {
    const loadNoticeById = async () => {
      try {
        const { success, data } = await fetchNoticeById({ noticeId });
        if (!success) {
          throw new Error();
        }

        setNotice(data.notice);

        if (data.attachment && Array.isArray(data.attachment)) {
          setFiles(
            data.attachment.map((item) => ({
              id: item.id,
              name: item.name,
              action: item.action,
            })),
          );
        }
      } catch {
        enqueueSnackbar('공지사항을 불러오지 못했습니다.', {
          variant: 'error',
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (noticeId) {
      loadNoticeById();
    }
  }, [noticeId, enqueueSnackbar, onClose]);

  // 초기화
  // useEffect(() => {
  //   if (!initialStatus) {
  //     enqueueSnackbar('공지사항 목록 조회에 실패했습니다.', {
  //       variant: 'error',
  //     });
  //   }
  // }, [initialStatus, enqueueSnackbar]);

  // 수정
  const handleUpdate = () => {
    router.push(`/notices/${noticeId}`);
  };

  // 삭제
  const handleDelete = async () => {
    try {
      const isConfirm = await confirm({
        title: '확인 요청',
        content: '정말 이 공지사항을 삭제하시겠습니까?',
      });

      if (isConfirm) {
        const result = await deleteNotice(noticeId);
        if (result.success) {
          enqueueSnackbar(result.message, {
            variant: 'success',
          });
          onClose();
        }
      }
    } catch (error) {
      enqueueSnackbar('삭제에 실패했습니다.', {
        variant: 'error',
      });
    }
  };

  // 첨부파일 개별 다운로드
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await downloadNoticeAttachment(fileId);
      triggerFileDownload(response.data, fileName);
    } catch (error) {
      enqueueSnackbar('파일 다운로드에 실패했습니다.', {
        variant: 'error',
      });
    }
  };

  // 첨부파일 전체 다운로드
  const handleDownloadAll = async () => {
    const downloadFileIds = files
      .filter((f) => f.action !== 'delete' && !f.file)
      .map((f) => f.id);

    setDownloadLoading(true);
    try {
      const response = await downloadNoticeAttachmentAll(downloadFileIds);
      triggerFileDownload(
        response.data,
        `공지사항_${notice.title}_첨부파일.zip`,
      );
    } catch (error) {
      enqueueSnackbar('파일 다운로드에 실패했습니다.', {
        variant: 'error',
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{notice?.title}</Typography>
            <IconButton size="small" onClick={onClose} aria-label="close">
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="caption" color="text.secondary" mt={0.5}>
            {notice?.createdByName} · {notice?.createdAt}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {notice?.content}
          </Typography>

          {/* 첨부파일 목록 */}
          {files.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle2">첨부파일</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={handleDownloadAll}
                >
                  전체 다운로드
                </Button>
              </Stack>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {files.map((file) => (
                  <Chip
                    key={file.id}
                    icon={<AttachFile />}
                    label={file.name}
                    onClick={() => handleDownload(file.id, file.name)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={handleDelete} variant="outlined" color="error">
              삭제
            </Button>

            <Button onClick={handleUpdate} variant="contained" color="primary">
              수정
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
