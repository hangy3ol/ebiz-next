'use client';

import PreviewIcon from '@mui/icons-material/Preview';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';

export default function AdjustmentPanel({
  list, // 원본 데이터 리스트
  enabled, // 부모로부터 받은 목록 활성화 여부
  selectedId, // 부모로부터 받은 선택된 ID
  onSelect, // 부모에게 선택된 ID를 알리는 함수
  onPreview, // 부모에게 미리보기를 알리는 함수
}) {
  return (
    <Box
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <Typography variant="subtitle2" fontWeight="medium">
        2. 감/가점 기준 선택
      </Typography>
      <Paper variant="outlined" sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
        {enabled ? (
          <List dense>
            {list?.length > 0 ? (
              list.map((adjustment) => (
                <ListItemButton
                  key={adjustment.adjustmentMasterId}
                  selected={selectedId === adjustment.adjustmentMasterId}
                  onClick={() => onSelect(adjustment.adjustmentMasterId)}
                >
                  <ListItemText primary={adjustment.title} />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(adjustment.adjustmentMasterId);
                    }}
                  >
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="등록된 항목이 없습니다."
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <Typography color="text.secondary" variant="body2">
              설정(연도, 사업부 등)과 평가 기준을 먼저 선택해주세요.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
