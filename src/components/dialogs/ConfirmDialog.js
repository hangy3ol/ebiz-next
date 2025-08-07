'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

import { useConfirmStore } from '@/stores/useConfirmStore';

export default function ConfirmDialog() {
  const { open, title, content, confirm, cancel } = useConfirmStore();

  return (
    <Dialog
      open={open}
      onClose={cancel}
      disableEnforceFocus={false}
      disableAutoFocus={false}
      disableRestoreFocus={true}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel}>취소</Button>
        <Button onClick={confirm} variant="contained" color="primary">
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
