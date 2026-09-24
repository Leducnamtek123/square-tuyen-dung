'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Avatar,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { interviewService } from '@/services/interviewService';
import { useEmployerVoiceProfiles } from '../hooks/useEmployerQueries';
import { getAppliedResumeJobPostId } from '../appliedResumeUtils';
import toastMessages from '@/utils/toastMessages';
import employerAiSettingService from '@/services/employerAiSettingService';
import type { JobPostActivity } from '@/types/models';

interface QuickScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  candidate: JobPostActivity | null;
  onScheduleSuccess?: () => void;
}

export const QuickScheduleInterviewModal: React.FC<QuickScheduleInterviewModalProps> = ({
  open,
  onClose,
  candidate,
  onScheduleSuccess,
}) => {
  const { t, i18n } = useTranslation(['employer', 'interview', 'common']);
  const { push } = useRouter();
  const queryClient = useQueryClient();
  const { data: voiceProfilesData } = useEmployerVoiceProfiles();
  const aiSettings = employerAiSettingService.getSettings();

  const [interviewFormat, setInterviewFormat] = useState<'ai' | 'live'>('ai');
  const [scheduledAt, setScheduledAt] = useState<string>(() =>
    dayjs().add(1, 'day').hour(9).minute(0).format('YYYY-MM-DDTHH:mm')
  );
  const [interviewType, setInterviewType] = useState<'mixed' | 'technical' | 'behavioral'>('mixed');
  const [selectedVoiceProfileId, setSelectedVoiceProfileId] = useState<string | number>('auto');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setScheduledAt(dayjs().add(1, 'day').hour(9).minute(0).format('YYYY-MM-DDTHH:mm'));
      setNotes(
        interviewFormat === 'ai'
          ? 'Phỏng vấn tự động cùng AI Recruiter. Ứng viên vui lòng sử dụng tai nghe và micro trong không gian yên tĩnh.'
          : 'Phỏng vấn trực tiếp cùng Hội đồng tuyển dụng qua phòng họp trực tuyến.'
      );
    }
  }, [open, interviewFormat]);

  if (!candidate) return null;

  const candidateUserId = candidate.userId ?? (candidate as any).userDict?.id;
  const jobPostId = getAppliedResumeJobPostId(candidate);
  const candidateName = candidate.fullName || 'Ứng viên';
  const candidateEmail = candidate.email || '---';
  const jobTitle = candidate.jobName || candidate.jobPost?.jobName || (candidate as any).jobPostDict?.jobName || 'Vị trí tuyển dụng';

  const fullFormHref =
    candidateUserId && jobPostId
      ? localizeRoutePath(
          `/${ROUTES.EMPLOYER.INTERVIEW_CREATE}?candidate=${candidateUserId}&jobPost=${jobPostId}`,
          i18n.language
        )
      : undefined;

  const handleGoToFullForm = () => {
    if (fullFormHref) {
      onClose();
      push(fullFormHref);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateUserId) {
      setErrorMessage('Không xác định được tài khoản ứng viên để lên lịch phỏng vấn.');
      return;
    }
    if (!jobPostId) {
      setErrorMessage('Không xác định được tin tuyển dụng tương ứng của ứng viên.');
      return;
    }
    if (!scheduledAt) {
      setErrorMessage('Vui lòng chọn thời gian bắt đầu phỏng vấn.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const voiceProfile =
        selectedVoiceProfileId && selectedVoiceProfileId !== 'auto'
          ? Number(selectedVoiceProfileId)
          : null;

      const currentAiSettings = employerAiSettingService.getSettings();
      const resolvedInterviewerName =
        interviewFormat === 'ai'
          ? currentAiSettings.interviewerName || currentAiSettings.interviewer_name || 'Trợ lý AI AILA'
          : 'Hội đồng Tuyển dụng';
      const resolvedAvatarId =
        currentAiSettings.selectedAvatarId || currentAiSettings.selected_avatar_id || 'aila_recruiter';
      const resolvedBackdrop =
        currentAiSettings.selectedBackgroundId || currentAiSettings.selected_background_id || 'modern_office';

      const payload = {
        candidate: Number(candidateUserId),
        job_post: Number(jobPostId),
        scheduled_at: dayjs(scheduledAt).toISOString(),
        type: interviewType,
        voice_profile: voiceProfile,
        notes: notes.trim(),
        session_metadata: {
          interview_format: interviewFormat,
          interviewer_name: resolvedInterviewerName,
          ai_avatar_id: resolvedAvatarId,
          avatar_backdrop: resolvedBackdrop,
          avatar_background_url: employerAiSettingService.resolveActiveBackgroundUrl(currentAiSettings),
          avatar_url: employerAiSettingService.resolveActiveAvatarUrl(currentAiSettings),
          character_id: currentAiSettings.activeCharacterId || 'ng_c_linh',
        },
      };

      await interviewService.scheduleSession(payload);
      toastMessages.success(
        t('interview:interviewCreateCard.messages.scheduleSuccess', {
          defaultValue: 'Lên lịch phỏng vấn và gửi thư mời thành công!',
        })
      );

      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
      queryClient.invalidateQueries({ queryKey: ['employerDashboardStats'] });

      onScheduleSuccess?.();
      onClose();
    } catch (error: any) {
      const detailMsg =
        error?.response?.data?.errors?.detail?.[0] ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Không thể lên lịch phỏng vấn. Vui lòng kiểm tra lại thời gian hoặc thiết lập phòng.';
      setErrorMessage(detailMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const voiceProfiles = voiceProfilesData?.results || [];

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, px: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'primary.extralight',
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <EventIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Lên lịch phỏng vấn nhanh
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Thiết lập lịch phỏng vấn và tự động gửi thư mời kèm đường dẫn tham gia
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 2, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Candidate & Job Summary Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 46,
                  height: 46,
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                {candidateName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {candidateName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500 }}
                  noWrap
                >
                  {candidateEmail}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.825rem', mt: 0.25 }}
                  noWrap
                >
                  {jobTitle}
                </Typography>
              </Box>
            </Box>

            {errorMessage && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Format Selection: AI vs Live */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                Hình thức phỏng vấn
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Box
                  onClick={() => setInterviewFormat('ai')}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: interviewFormat === 'ai' ? 'primary.main' : '#E2E8F0',
                    bgcolor: interviewFormat === 'ai' ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <SmartToyOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Phỏng vấn AI (AILA)
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3 }}>
                    Trợ lý AI tự động hỏi đáp, ghi hình, chấm điểm và báo cáo chi tiết
                  </Typography>
                </Box>

                <Box
                  onClick={() => setInterviewFormat('live')}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: interviewFormat === 'live' ? 'primary.main' : '#E2E8F0',
                    bgcolor: interviewFormat === 'live' ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.light' },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <VideoCameraFrontOutlinedIcon sx={{ color: '#10B981', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Phỏng vấn trực tiếp
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3 }}>
                    Phòng họp video trực tiếp giữa Nhà tuyển dụng / HR và Ứng viên
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Date & Time Picker */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Thời gian phỏng vấn <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                type="datetime-local"
                fullWidth
                size="small"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FFFFFF',
                  },
                }}
              />
            </Box>

            {/* AI Specific Options */}
            {interviewFormat === 'ai' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Loại phỏng vấn
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as any)}
                    disabled={isSubmitting}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                      },
                    }}
                  >
                    <MenuItem value="mixed">Tổng hợp (Chuyên môn & Hành vi)</MenuItem>
                    <MenuItem value="technical">Thiên về Chuyên môn & Kỹ thuật</MenuItem>
                    <MenuItem value="behavioral">Thiên về Kỹ năng mềm & Thái độ</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Giọng nói AI
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={selectedVoiceProfileId}
                    onChange={(e) => setSelectedVoiceProfileId(e.target.value)}
                    disabled={isSubmitting}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                      },
                    }}
                  >
                    <MenuItem value="auto">
                      Mặc định ({aiSettings.interviewerName || 'Trợ lý AI AILA'} - {aiSettings.ttsVoice || 'Chuẩn'})
                    </MenuItem>
                    {voiceProfiles.map((vp) => (
                      <MenuItem key={vp.id} value={vp.id}>
                        {vp.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Stack>
            )}

            {/* Notes / Message to Candidate */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Ghi chú & Hướng dẫn gửi ứng viên
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2.5}
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú hoặc lời nhắc nhở cho ứng viên..."
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FFFFFF',
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2, pt: 1, justifyContent: 'space-between' }}>
          {fullFormHref ? (
            <Button
              size="small"
              color="inherit"
              onClick={handleGoToFullForm}
              disabled={isSubmitting}
              startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748B',
                fontSize: '0.8rem',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Mở trang thiết lập chi tiết
            </Button>
          ) : (
            <Box />
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                borderColor: '#CBD5E1',
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || !candidateUserId || !jobPostId}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                },
              }}
            >
              {isSubmitting ? 'Đang lên lịch...' : 'Lên lịch & Gửi lời mời ngay'}
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuickScheduleInterviewModal;
