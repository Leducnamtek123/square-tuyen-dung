'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Grid2 as Grid,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import EngineeringIcon from '@mui/icons-material/Engineering';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import HandshakeIcon from '@mui/icons-material/Handshake';
import httpRequest from '@/utils/httpRequest';

interface EvaluationWeights {
  technical: number;
  communication: number;
  situational: number;
  culture_fit: number;
  attitude: number;
}

const DEFAULT_WEIGHTS: EvaluationWeights = {
  technical: 30,
  communication: 20,
  situational: 20,
  culture_fit: 20,
  attitude: 10,
};

const CRITERIA_CONFIG = [
  {
    key: 'technical' as const,
    label: 'Chuyên môn kỹ thuật',
    icon: EngineeringIcon,
    color: '#2563EB',
    description: 'Đánh giá kiến thức nền tảng, kinh nghiệm thực tế và độ chính xác trong giải pháp chuyên ngành.',
  },
  {
    key: 'communication' as const,
    label: 'Khả năng giao tiếp',
    icon: RecordVoiceOverIcon,
    color: '#0891B2',
    description: 'Đánh giá khả năng diễn đạt lưu loát, trình bày mạch lạc và phản xạ trước câu hỏi phỏng vấn.',
  },
  {
    key: 'situational' as const,
    label: 'Xử lý tình huống',
    icon: PsychologyIcon,
    color: '#8B5CF6',
    description: 'Đánh giá năng lực ứng biến, giải quyết mâu thuẫn và thích ứng với biến cố công trường thực tế.',
  },
  {
    key: 'culture_fit' as const,
    label: 'Phù hợp văn hóa',
    icon: Diversity3Icon,
    color: '#059669',
    description: 'Đánh giá mức độ đồng điệu với giá trị cốt lõi, tinh thần phụng sự và quy chuẩn ứng xử của doanh nghiệp.',
  },
  {
    key: 'attitude' as const,
    label: 'Thái độ và cam kết',
    icon: HandshakeIcon,
    color: '#D97706',
    description: 'Đánh giá tinh thần trách nhiệm, mức độ cầu thị và ý chí gắn bó đường dài cùng công ty.',
  },
];

export const CompanyEvaluationWeightsCard: React.FC = () => {
  const [weights, setWeights] = useState<EvaluationWeights>(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const totalWeight =
    weights.technical +
    weights.communication +
    weights.situational +
    weights.culture_fit +
    weights.attitude;

  const isValidTotal = totalWeight === 100;

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      const response: any = await httpRequest.get('info/web/private-companies/evaluation-weights/');
      const data = response?.data?.data || response?.data || response;
      if (data?.evaluationWeights) {
        setWeights({
          technical: Number(data.evaluationWeights.technical ?? 30),
          communication: Number(data.evaluationWeights.communication ?? 20),
          situational: Number(data.evaluationWeights.situational ?? 20),
          culture_fit: Number(data.evaluationWeights.culture_fit ?? 20),
          attitude: Number(data.evaluationWeights.attitude ?? 10),
        });
      }
    } catch {
      // Keep default weights
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key: keyof EvaluationWeights, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetDefault = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  const handleSave = async () => {
    if (!isValidTotal) {
      setToastSeverity('error');
      setToastMessage('Tổng các trọng số phải bằng đúng 100%.');
      return;
    }

    setSaving(true);
    try {
      await httpRequest.put('info/web/private-companies/evaluation-weights/', {
        evaluationWeights: weights,
      });
      setToastSeverity('success');
      setToastMessage('Đã lưu thành công cấu hình trọng số văn hóa tuyển dụng!');
    } catch (err: any) {
      setToastSeverity('error');
      setToastMessage(err?.response?.data?.error?.details?.detail || 'Có lỗi xảy ra khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Banner */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 1,
              borderRadius: 2,
              bgcolor: 'primary.50',
              color: 'primary.main',
            }}
          >
            <TuneIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Cấu hình trọng số đánh giá năng lực theo văn hóa doanh nghiệp
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Nhà tuyển dụng có thể tự thiết lập tỷ trọng điểm số cho từng tiêu chí, hệ thống AI và báo cáo PDF sẽ tự động áp dụng công thức riêng này.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Total Score Indicator Bar */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: isValidTotal ? 'success.light' : 'warning.light',
          bgcolor: isValidTotal ? '#f0fdf4' : '#fffbeb',
        }}
      >
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CheckCircleOutlineIcon
                sx={{
                  color: isValidTotal ? 'success.main' : 'warning.main',
                  fontSize: 28,
                }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Tổng trọng số hiện tại: {totalWeight}% / 100%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {isValidTotal
                    ? 'Tỷ lệ phân bổ hoàn hảo, sẵn sàng lưu vào hệ thống đánh giá.'
                    : `Cần điều chỉnh tăng hoặc giảm ${Math.abs(100 - totalWeight)}% để đạt đúng 100%.`}
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={isValidTotal ? 'Đạt chuẩn 100%' : 'Chưa đạt 100%'}
              color={isValidTotal ? 'success' : 'warning'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Criteria Sliders List */}
      <Stack spacing={2.5}>
        {CRITERIA_CONFIG.map((item) => {
          const IconComp = item.icon;
          const currentValue = weights[item.key];

          return (
            <Card
              key={item.key}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: item.color,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          p: 0.8,
                          borderRadius: 2,
                          bgcolor: `${item.color}15`,
                          color: item.color,
                          display: 'inline-flex',
                        }}
                      >
                        <IconComp sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      label={`${currentValue}%`}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        bgcolor: `${item.color}15`,
                        color: item.color,
                        border: `1px solid ${item.color}30`,
                        minWidth: 60,
                      }}
                    />
                  </Stack>

                  <Box sx={{ px: 1, pt: 1 }}>
                    <Slider
                      value={currentValue}
                      min={5}
                      max={60}
                      step={5}
                      onChange={(_, val) => handleWeightChange(item.key, val as number)}
                      sx={{
                        color: item.color,
                        height: 8,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          bgcolor: '#ffffff',
                          border: `2px solid ${item.color}`,
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0 0 0 8px ${item.color}25`,
                          },
                        },
                        '& .MuiSlider-rail': {
                          opacity: 0.2,
                        },
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Tối thiểu 5%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Tối đa 60%
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Action Footer */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="flex-end"
        spacing={2}
        sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltIcon />}
          onClick={handleResetDefault}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
          }}
        >
          Khôi phục mặc định InfoHR
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={!isValidTotal || saving}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2,
            px: 3,
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          }}
        >
          {saving ? 'Đang lưu cấu hình...' : 'Lưu cấu hình trọng số'}
        </Button>
      </Stack>

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toastSeverity}
          onClose={() => setToastMessage(null)}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyEvaluationWeightsCard;

