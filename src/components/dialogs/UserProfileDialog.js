'use client';

import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  Stack,
  Button,
} from '@mui/material';

export default function UserProfileDialog({ open, onClose, profile }) {
  // 내부 재사용 컴포넌트 정의
  const Section = ({ icon, title, children }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );

  const InfoRow = ({ label, value }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary">
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.25rem',
          bgcolor: 'background.default',
        }}
      >
        내 정보
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: 'background.paper', py: 2 }}>
        <Section icon={<PersonOutlineIcon color="primary" />} title="기본 정보">
          <InfoRow label="이름" value={profile?.name} />
          <InfoRow label="직급" value={profile?.positionName} />
        </Section>

        <Section icon={<BusinessIcon color="primary" />} title="소속 정보">
          <InfoRow label="사업부" value={profile?.officeName} />
          <InfoRow label="부서" value={profile?.departmentName} />
        </Section>

        <Section icon={<PhoneIcon color="primary" />} title="연락처">
          <InfoRow label="전화번호" value={profile?.contact} />
          <InfoRow label="이메일" value={profile?.email} />
        </Section>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center', display: 'block' }}
        >
          ※ 정보 변경은 기획관리실 인사담당자에게 문의해 주세요.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ bgcolor: 'background.default' }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
