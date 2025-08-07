'use client';

import { InsertDriveFile, Delete, Download } from '@mui/icons-material';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';

import {
  isBlockedExtension,
  formatFileSize,
  triggerFileDownload,
} from '@/utils/fileUtils';

export default function FileUploader({
  files = [],
  onChange,
  maxFiles,
  maxSize,
}) {
  // 상태
  const theme = useTheme();

  // 훅
  const { enqueueSnackbar } = useSnackbar();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: undefined,
    multiple: true,
    maxFiles,
    maxSize,
    onDrop: (incomingFiles) => {
      const activeFiles = files.filter((f) => f.action !== 'delete');

      // 남은 허용 가능 개수 계산
      const remaining = maxFiles - activeFiles.length;

      // 실제로 추가 가능한 파일만 추림
      const newFiles = incomingFiles
        .filter((file) => !isBlockedExtension(file.name))
        .filter((file) => !activeFiles.some((f) => f.name === file.name))
        .slice(0, remaining) // 초과된 개수는 잘라냄
        .map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          action: 'insert',
        }));

      const blocked = incomingFiles.filter((file) =>
        isBlockedExtension(file.name),
      );
      if (blocked.length > 0) {
        const message = `차단된 확장자: ${blocked.map((f) => f.name).join(', ')}`;
        enqueueSnackbar(message, { variant: 'error' });
      }

      if (incomingFiles.length > remaining) {
        enqueueSnackbar(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`, {
          variant: 'error',
        });
      }

      if (newFiles.length > 0) {
        onChange([...files, ...newFiles]);
      }
    },
    onDropRejected: (rejections) => {
      const oversizeFiles = rejections
        .flatMap((r) => r.errors)
        .filter((err) => err.code === 'file-too-large');

      if (oversizeFiles.length > 0) {
        enqueueSnackbar(
          `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}MB까지 업로드할 수 있습니다.`,
          {
            variant: 'error',
          },
        );
        return;
      }

      enqueueSnackbar('파일 업로드에 실패했습니다.', {
        variant: 'error',
      });
    },
  });

  const handleRemove = (index) => {
    const target = files[index];
    const updated = [...files];

    if (target.action === 'insert') {
      updated.splice(index, 1); // 새로 추가된 건 제거
    } else {
      updated[index] = { ...target, action: 'delete' }; // 기존 파일은 삭제 표시
    }

    onChange(updated);
  };

  // 유효한 파일만 필터링
  const activeFiles = files.filter((f) => f.action !== 'delete');

  // 현재 업로드된 파일 수와 총 용량
  const totalSize = activeFiles.reduce((sum, f) => sum + f.size, 0);
  const fileCount = activeFiles.length;

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: `1px dashed grey`,
        borderRadius: 1,
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive
          ? theme.palette.action.hover
          : 'transparent',
        transition: 'background-color 0.3s ease',
      }}
    >
      <input {...getInputProps()} />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          파일을 드래그하거나 클릭해서 업로드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          (최대 {maxFiles}개, 개당 {formatFileSize(maxSize)} / 현재 {fileCount}
          개, 총 {formatFileSize(totalSize)})
        </Typography>
      </Box>

      {files.filter((f) => f.action !== 'delete').length > 0 && (
        <Box>
          <List dense>
            {files.map((file, index) => {
              if (file.action === 'delete') {
                return null;
              }

              return (
                <ListItem key={`${file.name}-${index}`} disablePadding>
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>

                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)}`}
                  />

                  <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={(e) => {
                        e.stopPropagation();

                        if (file.url) {
                          // 서버에서 온 파일
                          window.open(file.url, '_blank');
                        } else if (file.file) {
                          // 클라이언트에서 업로드한 파일
                          triggerFileDownload(file.file, file.name);
                        } else {
                          enqueueSnackbar('다운로드할 수 없는 파일입니다.', {
                            variant: 'error',
                          });
                        }
                      }}
                    >
                      <Download />
                    </IconButton>

                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
}
