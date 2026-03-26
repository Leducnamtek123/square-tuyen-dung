import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  LinearProgress,
  CircularProgress,
  Button,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';

import { ScoreGauge } from './ScoreGauge';
import { SkillChipList } from './SkillChipList';
import { SectionCard } from './SectionCard';

interface AIAnalysisDrawerProps {
  open: boolean;
  onClose: () => void;
  activityId: string | number | null;
  initialData?: any;
}

const DRAWER_WIDTH = 520;

const AIAnalysisDrawer: React.FC<AIAnalysisDrawerProps> = ({
  open,
  onClose,
  activityId,
  initialData,
}) => {
  const { t } = useTranslation('employer');
  const [data, setData] = React.useState<any>(initialData || null);
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);

  // Fetch full detail when drawer opens
  React.useEffect(() => {
    if (!open || !activityId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        setData((res as any)?.data || null);
      } catch {
        // use initial data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, activityId]);

  // Poll while processing
  React.useEffect(() => {
    if (!open || !activityId || data?.aiAnalysisStatus !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await jobPostActivityService.getJobPostActivityDetail(activityId);
        const newData = (res as any)?.data;
        if (newData && newData.aiAnalysisStatus !== 'processing') {
          setData(newData);
          setAnalyzing(false);
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 8000);

    return () => clearInterval(interval);
  }, [open, activityId, data?.aiAnalysisStatus]);

  const handleAnalyze = async () => {
    if (!activityId) return;
    try {
      setAnalyzing(true);
      setData((prev: any) => ({ ...prev, aiAnalysisStatus: 'processing' }));
      await jobPostActivityService.analyzeResume(activityId);
      toastMessages.success(t('appliedResume.ai.analysisStarted'));
    } catch (err: any) {
      errorHandling(err);
      setAnalyzing(false);
      setData((prev: any) => ({ ...prev, aiAnalysisStatus: 'failed' }));
    }
  };

  const status = data?.aiAnalysisStatus;
  const isCompleted = status === 'completed';
  const isProcessing = status === 'processing';
  const isFailed = status === 'failed';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: DRAWER_WIDTH },
          bgcolor: '#fafbfc',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PsychologyIcon sx={{ color: '#6366f1', fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              Phân tích AI
            </Typography>
            {data?.fullName && (
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {data.fullName} — {data.jobName}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>

          {/* CV Preview Section */}
          {data?.resumeFileUrl && (
            <SectionCard title="Hồ sơ ứng viên" icon={<DescriptionIcon fontSize="small" />} iconColor="#8b5cf6">
              <Box
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  height: 350,
                  bgcolor: '#f8fafc',
                }}
              >
                <iframe
                  src={data.resumeFileUrl}
                  title="CV Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </Box>
              <Button
                href={data.resumeFileUrl}
                target="_blank"
                variant="text"
                size="small"
                sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem' }}
              >
                Mở file CV trong tab mới ↗
              </Button>
            </SectionCard>
          )}

          {/* AI Analysis Section */}
          {isProcessing && (
            <Paper elevation={0} sx={{ p: 3, mb: 1.5, border: '1px solid #dbeafe', borderRadius: 2, bgcolor: '#eff6ff', textAlign: 'center' }}>
              <CircularProgress size={36} sx={{ color: '#3b82f6', mb: 1.5 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e40af' }}>
                AI đang phân tích hồ sơ...
              </Typography>
              <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                Quá trình này có thể mất 30-60 giây
              </Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
            </Paper>
          )}

          {isFailed && (
            <Paper elevation={0} sx={{ p: 3, mb: 1.5, border: '1px solid #fecaca', borderRadius: 2, bgcolor: '#fef2f2', textAlign: 'center' }}>
              <CancelIcon sx={{ fontSize: 36, color: '#ef4444', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#991b1b' }}>
                Phân tích thất bại
              </Typography>
              {data?.aiAnalysisSummary && (
                <Typography variant="body2" sx={{ color: '#b91c1c', mt: 0.5, fontSize: '0.8rem' }}>
                  {data.aiAnalysisSummary}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                Thử lại
              </Button>
            </Paper>
          )}

          {!isCompleted && !isProcessing && !isFailed && (
            <Paper elevation={0} sx={{ p: 3, mb: 1.5, border: '1px dashed #cbd5e1', borderRadius: 2, textAlign: 'center' }}>
              <AutoFixHighIcon sx={{ fontSize: 40, color: '#a5b4fc', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mb: 0.5 }}>
                Chưa phân tích AI
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                Bấm nút bên dưới để bắt đầu phân tích CV với AI
              </Typography>
              <Button
                variant="contained"
                startIcon={<AutoFixHighIcon />}
                onClick={handleAnalyze}
                disabled={analyzing}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                }}
              >
                Bắt đầu phân tích
              </Button>
            </Paper>
          )}

          {isCompleted && (
            <>
              {/* Score Gauge */}
              <Paper elevation={0} sx={{ mb: 1.5, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <ScoreGauge score={data?.aiAnalysisScore || 0} />
              </Paper>

              {/* Summary */}
              <SectionCard title="Tổng quan đánh giá" icon={<PsychologyIcon fontSize="small" />} iconColor="#6366f1">
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7 }}>
                  {data?.aiAnalysisSummary || 'Chưa có đánh giá'}
                </Typography>
              </SectionCard>

              {/* Pros */}
              <SectionCard title="Điểm mạnh" icon={<ThumbUpAltIcon fontSize="small" />} iconColor="#22c55e">
                <SkillChipList skills={data?.aiAnalysisPros} color="success" />
              </SectionCard>

              {/* Cons */}
              <SectionCard title="Điểm yếu / Cần lưu ý" icon={<ThumbDownAltIcon fontSize="small" />} iconColor="#ef4444">
                <SkillChipList skills={data?.aiAnalysisCons} color="error" />
              </SectionCard>

              {/* Matching Skills */}
              <SectionCard title="Kỹ năng phù hợp với JD" icon={<CheckCircleIcon fontSize="small" />} iconColor="#22c55e">
                <SkillChipList skills={data?.aiAnalysisMatchingSkills} color="success" icon={<CheckCircleIcon />} />
              </SectionCard>

              {/* Missing Skills */}
              <SectionCard title="Kỹ năng còn thiếu" icon={<CancelIcon fontSize="small" />} iconColor="#f97316">
                <SkillChipList skills={data?.aiAnalysisMissingSkills} color="error" icon={<CancelIcon />} />
              </SectionCard>

              {/* All Skills */}
              <SectionCard title="Tất cả kỹ năng" icon={<AutoFixHighIcon fontSize="small" />} iconColor="#3b82f6">
                <SkillChipList skills={data?.aiAnalysisSkills} color="primary" />
              </SectionCard>

              {/* Re-analyze Button */}
              <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  sx={{ textTransform: 'none' }}
                >
                  Phân tích lại
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default AIAnalysisDrawer;
