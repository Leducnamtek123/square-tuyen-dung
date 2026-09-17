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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useJobPostOptions } from '@/views/components/employers/hooks/useEmployerQueries';
import jobPostActivityService from '@/services/jobPostActivityService';
import toastMessages from '@/utils/toastMessages';
import type { Resume } from '@/types/models';

interface InviteCandidateToJobModalProps {
  open: boolean;
  onClose: () => void;
  resume: Resume | null;
  candidateName?: string;
  candidateTitle?: string;
}

export const InviteCandidateToJobModal: React.FC<InviteCandidateToJobModalProps> = ({
  open,
  onClose,
  resume,
  candidateName,
  candidateTitle,
}) => {
  const { t } = useTranslation(['employer', 'common']);
  const queryClient = useQueryClient();
  const { data: jobPosts = [], isLoading: isLoadingJobPosts } = useJobPostOptions();

  const [selectedJobPostId, setSelectedJobPostId] = useState<string | number>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setNote(
        'Chào bạn, chúng tôi rất ấn tượng với hồ sơ và kinh nghiệm của bạn. Trân trọng mời bạn tham gia ứng tuyển cho vị trí này tại công ty chúng tôi!'
      );
      if (jobPosts.length > 0 && !selectedJobPostId) {
        setSelectedJobPostId(jobPosts[0].id);
      }
    }
  }, [open, jobPosts, selectedJobPostId]);

  if (!resume) return null;

  const displayName =
    candidateName ||
    (resume as any).user?.fullName ||
    (resume as any).userDict?.fullName ||
    resume.title ||
    'Ứng viên';

  const displayTitle = candidateTitle || resume.title || 'Hồ sơ ứng viên';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobPostId) {
      setErrorMessage('Vui lòng chọn một tin tuyển dụng để mời ứng viên.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await jobPostActivityService.inviteCandidate({
        jobPostId: selectedJobPostId,
        resumeSlug: resume.slug,
        resumeId: resume.id,
        note: note.trim(),
      });

      toastMessages.success(response?.message || 'Đã gửi lời mời ứng tuyển thành công!');
      queryClient.invalidateQueries({ queryKey: ['appliedResumes'] });
      queryClient.invalidateQueries({ queryKey: ['employerJobPosts'] });
      onClose();
    } catch (error: any) {
      const detailMsg =
        error?.response?.data?.errors?.detail?.[0] ||
        error?.response?.data?.errors?.jobPostId?.[0] ||
        error?.response?.data?.errors?.resume?.[0] ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Không thể gửi lời mời ứng tuyển. Vui lòng thử lại sau.';
      setErrorMessage(detailMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
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
              <WorkOutlineIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Mời ứng viên vào tin tuyển dụng
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Hồ sơ sẽ được thêm vào Pipeline ứng tuyển của tin tương ứng
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
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {displayName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.825rem' }}
                  noWrap
                >
                  {displayTitle}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip
                    label="Ứng viên tiềm năng"
                    size="small"
                    sx={{ height: 20, fontSize: '0.675rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }}
                  />
                </Stack>
              </Box>
            </Box>

            {errorMessage && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Chọn tin tuyển dụng <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedJobPostId}
                onChange={(e) => setSelectedJobPostId(e.target.value)}
                disabled={isSubmitting || isLoadingJobPosts}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FFFFFF',
                  },
                }}
              >
                {isLoadingJobPosts ? (
                  <MenuItem disabled>Đang tải danh sách tin tuyển dụng...</MenuItem>
                ) : jobPosts.length === 0 ? (
                  <MenuItem disabled>Công ty chưa có tin tuyển dụng nào đang hoạt động</MenuItem>
                ) : (
                  jobPosts.map((jp) => (
                    <MenuItem key={jp.id} value={jp.id}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {jp.jobName}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Lời nhắn gửi đến ứng viên (Tùy chọn)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lời nhắn gửi đến ứng viên..."
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

        <DialogActions sx={{ px: 2, pb: 2, pt: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              borderColor: '#CBD5E1',
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || jobPosts.length === 0}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              },
            }}
          >
            {isSubmitting ? 'Đang gửi lời mời...' : 'Gửi lời mời ứng tuyển'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteCandidateToJobModal;
