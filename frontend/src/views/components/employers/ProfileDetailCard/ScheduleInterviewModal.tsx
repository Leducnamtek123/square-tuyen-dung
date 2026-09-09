'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import dayjs from '@/configs/dayjs-config';
import interviewService from '@/services/interviewService';
import jobService from '@/services/jobService';
import questionGroupService from '@/services/questionGroupService';
import toastMessages from '@/utils/toastMessages';
import type { JobPost, QuestionGroup } from '@/types/models';

interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  candidateId?: number;
  candidateName: string;
  onScheduled?: () => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  open,
  onClose,
  candidateId,
  candidateName,
  onScheduled,
}) => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedJobPost, setSelectedJobPost] = useState<number | ''>('');
  const [interviewType, setInterviewType] = useState<'mixed' | 'technical' | 'behavioral'>('mixed');
  const [selectedQuestionGroup, setSelectedQuestionGroup] = useState<number | ''>('');
  const [scheduledAt, setScheduledAt] = useState(
    dayjs().add(1, 'day').hour(9).minute(0).format('YYYY-MM-DDTHH:mm')
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    setLoadingOptions(true);
    setErrorMessage(null);

    Promise.all([
      jobService.getEmployerJobPost({ pageSize: 50 }),
      questionGroupService.getQuestionGroups({ pageSize: 50 }),
    ])
      .then(([jobsRes, groupsRes]) => {
        if (!active) return;
        const posts = jobsRes?.results || [];
        setJobPosts(posts);
        if (posts.length > 0) {
          setSelectedJobPost(posts[0].id);
        }

        const groups = groupsRes?.results || [];
        setQuestionGroups(groups);
        if (groups.length > 0) {
          setSelectedQuestionGroup(groups[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error fetching interview schedule options:', err);
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedJobPost) {
      setErrorMessage('Vui lòng chọn tin tuyển dụng để phỏng vấn.');
      return;
    }

    if (!scheduledAt) {
      setErrorMessage('Vui lòng chọn ngày và giờ phỏng vấn.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        candidate: candidateId ? Number(candidateId) : undefined,
        job_post: Number(selectedJobPost),
        type: interviewType,
        scheduled_at: dayjs(scheduledAt).toISOString(),
        question_group: selectedQuestionGroup ? Number(selectedQuestionGroup) : undefined,
        notes: notes.trim() || undefined,
      };

      await interviewService.scheduleSession(payload);
      toastMessages.success(`Đã lên lịch phỏng vấn thành công cho ${candidateName}`);
      onClose();
      if (onScheduled) {
        onScheduled();
      }
    } catch (err: any) {
      console.error('Failed to schedule interview:', err);
      const detail =
        err?.response?.data?.errors?.detail?.[0] ||
        err?.response?.data?.message ||
        'Không thể tạo lịch phỏng vấn. Vui lòng thử lại sau.';
      setErrorMessage(detail);
      toastMessages.error(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0.5,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
              Lên lịch phỏng vấn
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Ứng viên: <strong>{candidateName}</strong>
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {loadingOptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {/* 1. Tin tuyển dụng */}
            <TextField
              select
              label="Tin tuyển dụng áp dụng *"
              size="small"
              fullWidth
              value={selectedJobPost}
              onChange={(e) => setSelectedJobPost(Number(e.target.value))}
              helperText="Chọn vị trí tuyển dụng mà công ty muốn phỏng vấn ứng viên này"
            >
              {jobPosts.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.jobName}
                </MenuItem>
              ))}
              {jobPosts.length === 0 && (
                <MenuItem value="" disabled>
                  Chưa có tin tuyển dụng nào đang mở
                </MenuItem>
              )}
            </TextField>

            {/* 2. Hình thức phỏng vấn */}
            <TextField
              select
              label="Hình thức phỏng vấn *"
              size="small"
              fullWidth
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as any)}
            >
              <MenuItem value="mixed">
                🤖 Phỏng vấn AI Voice Bot (Hỗn hợp: Chuyên môn & Kỹ năng mềm)
              </MenuItem>
              <MenuItem value="technical">
                💼 Phỏng vấn Chuyên môn Kỹ thuật (Technical Focus)
              </MenuItem>
              <MenuItem value="behavioral">
                💬 Phỏng vấn Hành vi & Tính cách (Behavioral Focus)
              </MenuItem>
            </TextField>

            {/* 3. Bộ câu hỏi */}
            <TextField
              select
              label="Bộ câu hỏi phỏng vấn (Tùy chọn)"
              size="small"
              fullWidth
              value={selectedQuestionGroup}
              onChange={(e) => setSelectedQuestionGroup(e.target.value ? Number(e.target.value) : '')}
              helperText="Hệ thống sẽ lấy danh mục câu hỏi này để AI Agent hoặc HR phỏng vấn"
            >
              <MenuItem value="">
                <em>Mặc định theo ngành nghề</em>
              </MenuItem>
              {questionGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>

            {/* 4. Thời gian phỏng vấn */}
            <TextField
              label="Thời gian bắt đầu phỏng vấn *"
              type="datetime-local"
              size="small"
              fullWidth
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* 5. Ghi chú */}
            <TextField
              label="Ghi chú nội bộ cho buổi phỏng vấn"
              size="small"
              fullWidth
              multiline
              rows={3}
              placeholder="VD: Chú trọng kiểm tra kinh nghiệm giám sát công trình và tiếng Anh giao tiếp..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 2.5 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isSubmitting}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || loadingOptions || jobPosts.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SmartToyOutlinedIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            px: 2.5,
          }}
        >
          {isSubmitting ? 'Đang tạo lịch...' : 'Xác nhận tạo lịch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleInterviewModal;
