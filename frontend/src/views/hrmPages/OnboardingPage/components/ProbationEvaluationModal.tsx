import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  Box,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UpdateIcon from '@mui/icons-material/Update';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import pc from '@/utils/muiColors';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: 'background.paper',
    '& fieldset': { borderColor: pc.divider(0.85) },
    '&:hover fieldset': { borderColor: pc.primary(0.35) },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1.5,
    },
  },
};

interface Props {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  loading?: boolean;
  onSubmit: (payload: {
    result: 'PASSED' | 'EXTENDED' | 'FAILED';
    notes?: string;
    extension_days?: number;
  }) => void;
}

export const ProbationEvaluationModal: React.FC<Props> = ({
  open,
  onClose,
  employeeName,
  loading = false,
  onSubmit,
}) => {
  const [result, setResult] = useState<'PASSED' | 'EXTENDED' | 'FAILED'>('PASSED');
  const [notes, setNotes] = useState('');
  const [extensionDays, setExtensionDays] = useState<number>(30);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
    if ((result === 'EXTENDED' || result === 'FAILED') && !notes.trim()) {
      setErrorMsg('Vui lòng nhập lý do và nhận xét khi gia hạn hoặc từ chối thử việc.');
      return;
    }
    setErrorMsg('');
    onSubmit({
      result,
      notes: notes.trim(),
      extension_days: result === 'EXTENDED' ? Number(extensionDays) : undefined,
    });
  };

  const handleResetAndClose = () => {
    setResult('PASSED');
    setNotes('');
    setExtensionDays(30);
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleResetAndClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', p: 2.5 }}>
        Đánh giá Kết quả Thử việc
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: '20px !important' }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Nhân sự được đánh giá:
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              {employeeName}
            </Typography>
          </Box>

          {errorMsg && <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMsg}</Alert>}

          {/* Result Selection */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
              Quyết định đánh giá:
            </Typography>

            <RadioGroup
              value={result}
              onChange={(e) => setResult(e.target.value as 'PASSED' | 'EXTENDED' | 'FAILED')}
            >
              <Stack spacing={1.2}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderColor: result === 'PASSED' ? '#16a34a' : pc.divider(0.8),
                    bgcolor: result === 'PASSED' ? '#f0fdf4' : 'background.paper',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setResult('PASSED')}
                >
                  <FormControlLabel
                    value="PASSED"
                    control={<Radio color="success" size="small" />}
                    label={
                      <Box>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                          <Typography variant="subtitle2" fontWeight={700} color="#15803d">
                            Đạt thử việc - Ký Hợp đồng Lao động chính thức
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Chuyển trạng thái nhân sự sang Chính thức (Active), kích hoạt quyền lợi chính thức.
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderColor: result === 'EXTENDED' ? '#d97706' : pc.divider(0.8),
                    bgcolor: result === 'EXTENDED' ? '#fffbeb' : 'background.paper',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setResult('EXTENDED')}
                >
                  <FormControlLabel
                    value="EXTENDED"
                    control={<Radio color="warning" size="small" />}
                    label={
                      <Box>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <UpdateIcon sx={{ fontSize: 18, color: '#d97706' }} />
                          <Typography variant="subtitle2" fontWeight={700} color="#b45309">
                            Gia hạn thử việc
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Cần thêm thời gian theo dõi hiệu suất làm việc của nhân sự.
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderColor: result === 'FAILED' ? '#dc2626' : pc.divider(0.8),
                    bgcolor: result === 'FAILED' ? '#fef2f2' : 'background.paper',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setResult('FAILED')}
                >
                  <FormControlLabel
                    value="FAILED"
                    control={<Radio color="error" size="small" />}
                    label={
                      <Box>
                        <Stack direction="row" spacing={0.8} alignItems="center">
                          <HighlightOffIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                          <Typography variant="subtitle2" fontWeight={700} color="#b91c1c">
                            Không đạt - Kết thúc hợp tác
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Thanh lý hợp đồng thử việc và chuyển nhân sự sang trạng thái Đã nghỉ việc.
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Card>
              </Stack>
            </RadioGroup>
          </Box>

          {/* Extension Days Input (Only if EXTENDED) */}
          {result === 'EXTENDED' && (
            <TextField
              type="number"
              label="Số ngày gia hạn thêm"
              value={extensionDays}
              onChange={(e) => setExtensionDays(Math.max(1, Number(e.target.value)))}
              fullWidth
              sx={inputSx}
              helperText="Thông thường gia hạn từ 15 đến 30 ngày theo quy định công ty"
            />
          )}

          {/* Notes */}
          <TextField
            multiline
            rows={3}
            label={result === 'PASSED' ? 'Nhận xét & Đánh giá (tùy chọn)' : 'Lý do & Nhận xét chi tiết *'}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhận xét về thái độ, kỹ năng chuyên môn và kết quả hoàn thành công việc..."
            fullWidth
            sx={inputSx}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Button
          onClick={handleResetAndClose}
          sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          sx={{
            fontWeight: 800,
            borderRadius: 2,
            textTransform: 'none',
            bgcolor: result === 'PASSED' ? '#16a34a' : result === 'EXTENDED' ? '#d97706' : '#dc2626',
            '&:hover': {
              bgcolor: result === 'PASSED' ? '#15803d' : result === 'EXTENDED' ? '#b45309' : '#b91c1c',
            },
          }}
        >
          {loading ? 'Đang cập nhật...' : 'Xác nhận Đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
