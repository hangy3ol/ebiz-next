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
import { useState, useEffect } from 'react';

export default function CriteriaPanel({
  list, // 원본 데이터 리스트
  selectedJobGroup, // 필터링 조건 1
  selectedJobTitle, // 필터링 조건 2
  selectedId, // 부모로부터 받은 선택된 ID
  onSelect, // 부모에게 선택된 ID를 알리는 함수
  onPreview, // 부모에게 미리보기를 알리는 함수
}) {
  const [filteredCriteria, setFilteredCriteria] = useState([]);

  useEffect(() => {
    if (!list) return;

    if (selectedJobGroup && selectedJobTitle) {
      const filtered = list.filter(
        (item) =>
          item.jobGroupCode === selectedJobGroup &&
          item.jobTitleCode === selectedJobTitle,
      );
      setFilteredCriteria(filtered);
    } else {
      setFilteredCriteria([]);
    }
  }, [selectedJobGroup, selectedJobTitle, list]);

  return (
    <Box
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <Typography variant="subtitle2" fontWeight="medium">
        1. 평가 기준 선택
      </Typography>
      <Paper variant="outlined" sx={{ mt: 1, flex: 1, overflow: 'auto' }}>
        {selectedJobGroup && selectedJobTitle ? (
          <List dense>
            {filteredCriteria.length > 0 ? (
              filteredCriteria.map((criterion) => (
                <ListItemButton
                  key={criterion.criteriaMasterId}
                  selected={selectedId === criterion.criteriaMasterId}
                  onClick={() => onSelect(criterion.criteriaMasterId)}
                >
                  <ListItemText primary={criterion.title} />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(criterion.criteriaMasterId);
                    }}
                  >
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="해당 조건의 평가 기준이 없습니다."
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
              기본 정보(평가귀속연도, 사업부 등)를 먼저 선택해주세요.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
