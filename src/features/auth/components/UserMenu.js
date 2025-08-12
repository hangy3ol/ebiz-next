'use client';

import { AccountCircle, VpnKey, Logout } from '@mui/icons-material';
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Box,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { logoutApi } from '@/features/auth/api/authApi';
import UserPasswordDialog from '@/features/auth/components/UserPasswordDialog';
import UserProfileDialog from '@/features/auth/components/UserProfileDialog';
import { useProfileStore } from '@/common/stores/useProfileStore';
import { getProfile } from '@/common/utils/getProfile';

export default function UserMenu() {
  // 상태
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  // 훅
  const profile = getProfile();
  const router = useRouter();
  const { clearProfile } = useProfileStore();
  const { enqueueSnackbar } = useSnackbar();

  // 파생 상태
  const menuOpen = Boolean(anchorEl);

  // 메뉴 열기
  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  // 메뉴 닫기
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 프로필 다이얼로그 열기
  const handleOpenProfileDialog = () => {
    setOpenProfileDialog(true);
    handleClose();
  };

  // 프로필 다이얼로그 닫기
  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
  };

  // 비밀번호 변경 다이얼로그 열기
  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
    handleClose();
  };

  // 비밀번호 변경 다이얼로그 닫기
  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const { success, message } = await logoutApi();
      if (success) {
        clearProfile();
        enqueueSnackbar(message, {
          variant: 'success',
        });
        router.replace('/login');
      }
    } catch (error) {
      console.error('로그아웃 실패', error);
      enqueueSnackbar('로그아웃 중 오류가 발생했습니다.', { variant: 'error' });
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          ml: 1,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.9rem',
            justifyContent: 'center',
            backgroundColor: profile?.officeColorCode ?? '#ccc',
          }}
          variant="rounded"
        >
          {(profile?.officeName ?? '?').slice(0, 2)}
        </Avatar>

        <Box>
          <Typography variant="subtitle2" color="inherit">
            {profile?.name ?? '관리자'}
            {profile?.positionName ? ` ${profile.positionName}` : ''}
          </Typography>
        </Box>
      </IconButton>

      {/* 사용자 메뉴 */}
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
        <MenuItem onClick={handleOpenProfileDialog}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>내정보</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleOpenPasswordDialog}>
          <ListItemIcon>
            <VpnKey fontSize="small" />
          </ListItemIcon>
          <ListItemText>비밀번호 변경</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>로그아웃</ListItemText>
        </MenuItem>
      </Menu>

      {/* 내정보 다이얼로그 */}
      <UserProfileDialog
        open={openProfileDialog}
        onClose={handleCloseProfileDialog}
        profile={profile}
      />

      {/* 비밀번호 변경 */}
      <UserPasswordDialog
        open={openPasswordDialog}
        onClose={handleClosePasswordDialog}
        profile={profile}
      />
    </>
  );
}
