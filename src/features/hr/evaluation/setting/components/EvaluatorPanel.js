// [추가] 파일 신규 생성
'use client';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export default function EvaluatorPanel({
  visible,
  jobTitle,
  evaluatorList,
  selectedEvaluators,
  evaluatorWeights,
  onEvaluatorChange,
  onWeightChange,
}) {
  // [추가] '목록 적용' 버튼의 비활성화 여부를 계산하는 로직
  const isApplyDisabled = (() => {
    if (!visible) return true; // 패널이 보이지 않으면 항상 비활성화

    if (jobTitle === '01') {
      // 팀장(01)은 1, 2차 평가자 모두 선택해야 활성화
      return !selectedEvaluators.step1 || !selectedEvaluators.step2;
    }
    if (jobTitle === '02') {
      // 팀원(02)은 1, 2, 3차 평가자 모두 선택해야 활성화
      return (
        !selectedEvaluators.step1 ||
        !selectedEvaluators.step2 ||
        !selectedEvaluators.step3
      );
    }
    return true; // 그 외의 경우는 항상 비활성화
  })();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight="medium">
          4. 평가자 선택
        </Typography>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          disabled={isApplyDisabled}
        >
          목록 적용
        </Button>
      </Stack>

      <Box sx={{ mt: 1, flex: 1 }}>
        {visible ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              {/* 1차 평가자 */}
              <FormControl size="small" fullWidth>
                <InputLabel>1차 평가자</InputLabel>
                <Select
                  label="1차 평가자"
                  value={selectedEvaluators.step1}
                  onChange={(e) => onEvaluatorChange('step1', e.target.value)}
                >
                  {evaluatorList.step1.map((emp) => (
                    <MenuItem key={emp.userId} value={emp.userId}>
                      {emp.userName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* 2차 평가자 */}
              <FormControl size="small" fullWidth>
                <InputLabel>2차 평가자</InputLabel>
                <Select
                  label="2차 평가자"
                  value={selectedEvaluators.step2}
                  onChange={(e) => onEvaluatorChange('step2', e.target.value)}
                >
                  {evaluatorList.step2.map((emp) => (
                    <MenuItem key={emp.userId} value={emp.userId}>
                      {emp.userName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* 3차 평가자 (조건부) */}
              {jobTitle === '02' && (
                <FormControl size="small" fullWidth>
                  <InputLabel>3차 평가자</InputLabel>
                  <Select
                    label="3차 평가자"
                    value={selectedEvaluators.step3}
                    onChange={(e) => onEvaluatorChange('step3', e.target.value)}
                  >
                    {evaluatorList.step3.map((emp) => (
                      <MenuItem key={emp.userId} value={emp.userId}>
                        {emp.userName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
            <Stack direction="row" spacing={2}>
              {/* 1차 가중치 */}
              <TextField
                label="가중치 (%)"
                type="number"
                size="small"
                fullWidth
                value={evaluatorWeights.step1}
                onChange={(e) => onWeightChange('step1', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              {/* 2차 가중치 */}
              <TextField
                label="가중치 (%)"
                type="number"
                size="small"
                fullWidth
                value={evaluatorWeights.step2}
                onChange={(e) => onWeightChange('step2', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              {/* 3차 가중치 (조건부) */}
              {jobTitle === '02' && (
                <TextField
                  label="가중치 (%)"
                  type="number"
                  size="small"
                  fullWidth
                  value={evaluatorWeights.step3}
                  onChange={(e) => onWeightChange('step3', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: '100%' }}
          >
            <Typography color="text.secondary" variant="body2">
              대상자를 먼저 선택해주세요.
            </Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
