import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Card,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WavingHandOutlinedIcon from '@mui/icons-material/WavingHandOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  useHrmOnboardingDetail,
  useHrmMutations,
} from '../../hooks/useHrmQueries';
import type {
  NativeOnboardingTaskItem,
} from '@/services/hrmService';
import { ONBOARDING_STAGE_CONFIG } from './OnboardingFilters';
import { DocumentLightboxModal } from './DocumentLightboxModal';
import { ProbationEvaluationModal } from './ProbationEvaluationModal';
import pc from '@/utils/muiColors';

interface Props {
  open: boolean;
  onClose: () => void;
  processId: number | null;
}

export const OnboardingDetailDrawer: React.FC<Props> = ({
  open,
  onClose,
  processId,
}) => {
  const { data: process, isLoading: loading } = useHrmOnboardingDetail(processId || 0);

  const {
    approveTaskDocument,
    rejectTaskDocument,
    completeTaskItem,
    confirmDayOne,
    evaluateProbation,
    cancelOnboarding,
  } = useHrmMutations();

  const [currentTab, setCurrentTab] = useState(0);

  // Lightbox preview state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Document rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTask, setRejectingTask] = useState<NativeOnboardingTaskItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Probation evaluation modal
  const [evalModalOpen, setEvalModalOpen] = useState(false);

  // Cancel Onboarding dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');

  if (!processId) return null;

  const emp = process?.employee_detail;
  const offer = process?.offer_detail;
  const stage = process?.stage || 'OFFER_ACCEPTED';
  const stageCfg = ONBOARDING_STAGE_CONFIG[stage] || {
    label: process?.stage_label || stage,
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
  };
  const tasks = process?.tasks || [];
  const completedTasks = tasks.filter((t) => t.is_completed || t.isCompleted);
  const progress = process?.progress_percent ?? process?.progressPercent ?? 0;

  // Group tasks by category/stage
  const docTasks = tasks.filter((t) => t.stage === 'PREBOARDING_DOCS' || t.stage === 'OFFER_ACCEPTED');
  const internalTasks = tasks.filter((t) => t.stage === 'INTERNAL_PREP');
  const dayOneTasks = tasks.filter((t) => t.stage === 'DAY_ONE_WELCOME');
  const probationTasks = tasks.filter((t) => t.stage === 'PROBATION_EVALUATION' || t.stage === 'COMPLETED');

  const handleOpenLightbox = (title: string, url?: string | null) => {
    setLightboxTitle(title);
    setLightboxUrl(url || null);
    setLightboxOpen(true);
  };

  const handleApproveDoc = (task: NativeOnboardingTaskItem) => {
    if (!process) return;
    approveTaskDocument.mutate({
      processId: process.id,
      taskId: task.id,
      payload: {
        file_url: task.document_url || task.documentUrl || '',
        name: task.title,
        document_type: task.code === 'TASK_SUBMIT_DEGREE' ? 'DEGREE' : 'ID_CARD',
      },
    });
  };

  const handleOpenRejectDoc = (task: NativeOnboardingTaskItem) => {
    setRejectingTask(task);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmRejectDoc = () => {
    if (!process || !rejectingTask || !rejectionReason.trim()) return;
    rejectTaskDocument.mutate(
      {
        processId: process.id,
        taskId: rejectingTask.id,
        reason: rejectionReason.trim(),
      },
      {
        onSuccess: () => {
          setRejectModalOpen(false);
          setRejectingTask(null);
        },
      }
    );
  };

  const handleToggleTaskComplete = (task: NativeOnboardingTaskItem) => {
    if (!process) return;
    completeTaskItem.mutate({
      processId: process.id,
      taskId: task.id,
    });
  };

  const handleConfirmDayOne = () => {
    if (!process) return;
    confirmDayOne.mutate(process.id);
  };

  const handleSubmitEvaluation = (payload: {
    result: 'PASSED' | 'EXTENDED' | 'FAILED';
    notes?: string;
    extension_days?: number;
  }) => {
    if (!process) return;
    evaluateProbation.mutate(
      {
        processId: process.id,
        payload,
      },
      {
        onSuccess: () => setEvalModalOpen(false),
      }
    );
  };

  const handleConfirmCancel = () => {
    if (!process || !cancelReasonText.trim()) return;
    cancelOnboarding.mutate(
      {
        processId: process.id,
        reason: cancelReasonText.trim(),
      },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          onClose();
        },
      }
    );
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 640, md: 740 },
              bgcolor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {loading || !process ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <>
            {/* Drawer Header */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#ffffff',
                borderBottom: '1px solid',
                borderColor: pc.divider(0.85),
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={emp?.avatar}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: '2px solid #dbeafe',
                    }}
                  >
                    {(emp?.full_name || emp?.fullName)?.charAt(0)?.toUpperCase() || 'E'}
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" fontWeight={800} color="#0f172a">
                        {emp?.full_name || emp?.fullName}
                      </Typography>
                      <Chip
                        label={stageCfg.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.725rem',
                          bgcolor: stageCfg.bg,
                          color: stageCfg.text,
                          border: `1px solid ${stageCfg.border}`,
                        }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                      Mã NV:{' '}
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                        {emp?.employee_code || emp?.employeeCode || `ID #${process.employee}`}
                      </span>{' '}
                      • {emp?.designation_title || emp?.designationTitle || 'Vị trí mới'} •{' '}
                      {emp?.department_name || emp?.departmentName || 'Chưa phân phòng'}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>

              {/* Progress Summary */}
              <Box sx={{ bgcolor: pc.bgDefault(0.5), p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                  <Typography variant="caption" fontWeight={700} color="#1e293b">
                    Tiến độ hoàn tất quy trình
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color="#2563eb">
                    {progress}% ({completedTasks.length}/{tasks.length} nhiệm vụ)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 7,
                    borderRadius: 3,
                    bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: progress === 100 ? '#16a34a' : '#2563eb',
                    },
                  }}
                />
              </Box>

              {/* Tabs Navigation */}
              <Tabs
                value={currentTab}
                onChange={(_, val) => setCurrentTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mt: 2,
                  minHeight: 40,
                  '& .MuiTab-root': {
                    minHeight: 40,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    px: 1.5,
                  },
                }}
              >
                <Tab label="1. Thỏa thuận Offer" icon={<DescriptionOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                <Tab
                  label={`2. Hồ sơ số (${docTasks.filter((t) => t.is_completed || t.isCompleted).length}/${docTasks.length})`}
                  icon={<FactCheckOutlinedIcon sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                />
                <Tab
                  label={`3. Nội bộ & IT (${internalTasks.filter((t) => t.is_completed || t.isCompleted).length}/${internalTasks.length})`}
                  icon={<ComputerOutlinedIcon sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                />
                <Tab label="4. Ngày đầu (Day 1)" icon={<WavingHandOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                <Tab label="5. Đánh giá Thử việc" icon={<AssignmentLateOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Drawer Body Tabs */}
            <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>
              {/* TAB 1: OFFER LETTER SUMMARY */}
              {currentTab === 0 && (
                <Stack spacing={2}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={1.5}>
                      Thông tin Thỏa thuận tuyển dụng (Offer Letter)
                    </Typography>

                    {offer ? (
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Vị trí tuyển dụng</Typography>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {offer.position_title || offer.positionTitle || 'Chưa ghi'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Mức lương thỏa thuận</Typography>
                            <Typography variant="body2" fontWeight={800} color="#16a34a">
                              {Number(offer.salary_offered || offer.salaryOffered || 0).toLocaleString()} VND
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Ngày bắt đầu dự kiến</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'var(--font-mono)' }}>
                              {offer.start_date || offer.startDate || 'Chưa xác định'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Thời điểm ứng viên ký số</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'var(--font-mono)' }}>
                              {offer.candidate_signed_at || offer.candidateSignedAt || 'Đã ký trực tuyến'}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                          <Typography variant="caption" color="#16a34a" fontWeight={700}>
                            Ứng viên đã chấp thuận đề nghị tuyển dụng và xác nhận ngày nhận việc.
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Hồ sơ nhân sự này được tiếp nhận trực tiếp từ bảng quản trị nội bộ.
                      </Typography>
                    )}
                  </Card>
                </Stack>
              )}

              {/* TAB 2: PREBOARDING DOCUMENTS */}
              {currentTab === 1 && (
                <Stack spacing={2}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    HR rà soát các giấy tờ do ứng viên cung cấp. Khi bấm <strong>Phê duyệt</strong>, hệ thống tự động lưu vào <strong>Hồ sơ tài liệu nhân sự</strong>.
                  </Alert>

                  {docTasks.map((task) => {
                    const isDone = task.is_completed || task.isCompleted;
                    const hasDoc = Boolean(task.document_url || task.documentUrl);
                    const isRejected = Boolean(task.rejection_note || task.rejectionNote);

                    return (
                      <Card
                        key={task.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: '#ffffff',
                          border: isRejected ? '1.5px solid #fecaca' : isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                              {isDone ? (
                                <CheckCircleIcon sx={{ fontSize: 20, color: '#16a34a' }} />
                              ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                              )}
                              <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                                {task.title}
                              </Typography>
                              {task.is_required && (
                                <Chip label="Bắt buộc" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                              )}
                            </Stack>

                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                              {task.description || 'Hồ sơ pháp lý phục vụ kê khai thuế và BHXH'}
                            </Typography>

                            {isRejected && (
                              <Box sx={{ p: 1, mb: 1, borderRadius: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                                <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                                  Lý do từ chối: {task.rejection_note || task.rejectionNote}
                                </Typography>
                              </Box>
                            )}

                            {isDone && task.completed_at && (
                              <Typography variant="caption" color="#16a34a" fontWeight={600}>
                                ✓ Đã phê duyệt lúc {task.completed_at || task.completedAt}
                              </Typography>
                            )}
                          </Box>

                          <Stack direction="row" spacing={1} alignItems="center">
                            {hasDoc && (
                              <Tooltip title="Xem tài liệu / hình ảnh">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                                  onClick={() => handleOpenLightbox(task.title, task.document_url || task.documentUrl)}
                                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                                >
                                  Xem ảnh
                                </Button>
                              </Tooltip>
                            )}

                            {!isDone && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  disabled={approveTaskDocument.isPending}
                                  onClick={() => handleApproveDoc(task)}
                                  sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', borderRadius: 2 }}
                                >
                                  Phê duyệt
                                </Button>

                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  disabled={rejectTaskDocument.isPending}
                                  onClick={() => handleOpenRejectDoc(task)}
                                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}

              {/* TAB 3: INTERNAL PREP (IT & ADMIN) */}
              {currentTab === 2 && (
                <Stack spacing={2}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Bộ phận Nhân sự & IT tích chọn các hạng mục hậu cần trước ngày ứng viên nhận việc chính thức.
                  </Alert>

                  {internalTasks.map((task) => {
                    const isDone = task.is_completed || task.isCompleted;

                    return (
                      <Card
                        key={task.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: isDone ? '#f0fdf4' : '#ffffff',
                          border: isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => handleToggleTaskComplete(task)}
                              sx={{ color: isDone ? '#16a34a' : '#94a3b8' }}
                            >
                              {isDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            </IconButton>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={isDone ? '#166534' : '#0f172a'}
                                sx={{ textDecoration: isDone ? 'line-through' : 'none' }}
                              >
                                {task.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Phân công: {task.assigned_role || task.assignedRole || 'Nội bộ'} •{' '}
                                {isDone ? `Hoàn tất lúc ${task.completed_at || task.completedAt || ''}` : 'Chưa hoàn thành'}
                              </Typography>
                            </Box>
                          </Stack>

                          <Button
                            size="small"
                            variant={isDone ? 'outlined' : 'contained'}
                            color={isDone ? 'secondary' : 'primary'}
                            onClick={() => handleToggleTaskComplete(task)}
                            disabled={completeTaskItem.isPending}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                          >
                            {isDone ? 'Bỏ chọn' : 'Đánh dấu xong'}
                          </Button>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}

              {/* TAB 4: DAY ONE WELCOME */}
              {currentTab === 3 && (
                <Stack spacing={2.5}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <WavingHandOutlinedIcon sx={{ fontSize: 28, color: '#ffffff' }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="#ffffff">
                          Chào đón Ngày đầu Nhận việc
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                          Ngày nhận việc: {process.actual_start_date || process.actualStartDate || process.target_start_date || process.targetStartDate || 'Hôm nay'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2.5 }}>
                      Khi ứng viên có mặt tại văn phòng, HR bấm nút xác nhận dưới đây để kích hoạt <strong>Hợp đồng Thử việc</strong>, chính thức ghi nhận ngày làm việc đầu tiên và đưa nhân sự vào chu kỳ thử việc.
                    </Typography>

                    {process.actual_start_date || process.actualStartDate ? (
                      <Alert severity="success" sx={{ bgcolor: 'rgba(22, 163, 74, 0.2)', color: '#4ade80', borderRadius: 2 }}>
                        ✓ Đã xác nhận có mặt vào ngày {process.actual_start_date || process.actualStartDate}. Hợp đồng lao động thử việc đã có hiệu lực.
                      </Alert>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<DoneAllIcon />}
                        disabled={confirmDayOne.isPending}
                        onClick={handleConfirmDayOne}
                        sx={{
                          bgcolor: '#16a34a',
                          fontWeight: 800,
                          py: 1.2,
                          borderRadius: 2.5,
                          fontSize: '0.925rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                          '&:hover': { bgcolor: '#15803d' },
                        }}
                      >
                        {confirmDayOne.isPending ? 'Đang kích hoạt...' : 'Xác nhận Ứng viên đã đến & Kích hoạt Hợp đồng'}
                      </Button>
                    )}
                  </Card>

                  {/* Day One checklist */}
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                    Checklist Ngày đầu tiên
                  </Typography>

                  {dayOneTasks.map((task) => {
                    const isDone = task.is_completed || task.isCompleted;

                    return (
                      <Card
                        key={task.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: isDone ? '#f0fdf4' : '#ffffff',
                          border: isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => handleToggleTaskComplete(task)}
                              sx={{ color: isDone ? '#16a34a' : '#94a3b8' }}
                            >
                              {isDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            </IconButton>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={isDone ? '#166534' : '#0f172a'}
                                sx={{ textDecoration: isDone ? 'line-through' : 'none' }}
                              >
                                {task.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.description || 'Thực hiện trong ngày làm việc đầu tiên'}
                              </Typography>
                            </Box>
                          </Stack>

                          <Button
                            size="small"
                            variant={isDone ? 'outlined' : 'contained'}
                            color={isDone ? 'secondary' : 'primary'}
                            onClick={() => handleToggleTaskComplete(task)}
                            disabled={completeTaskItem.isPending}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                          >
                            {isDone ? 'Bỏ chọn' : 'Đánh dấu xong'}
                          </Button>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}

              {/* TAB 5: PROBATION EVALUATION */}
              {currentTab === 4 && (
                <Stack spacing={2.5}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#ffffff' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                      <HourglassEmptyOutlinedIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                      <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                        Theo dõi & Đánh giá Thử việc
                      </Typography>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Ngày bắt đầu thử việc</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'var(--font-mono)' }}>
                          {process.actual_start_date || process.actualStartDate || '---'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Hạn kết thúc thử việc</Typography>
                        <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'var(--font-mono)', color: '#d97706' }}>
                          {process.probation_end_date || process.probationEndDate || '---'}
                        </Typography>
                      </Box>
                    </Box>

                    {stage === 'COMPLETED' ? (
                      <Alert severity="success" sx={{ borderRadius: 2 }}>
                        ✓ Nhân sự đã vượt qua thử việc và chính thức trở thành nhân viên công ty.
                      </Alert>
                    ) : (
                      <Button
                        variant="contained"
                        size="medium"
                        fullWidth
                        disabled={evaluateProbation.isPending}
                        onClick={() => setEvalModalOpen(true)}
                        sx={{
                          bgcolor: '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 800,
                          py: 1.2,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                          '&:hover': { bgcolor: '#d97706' },
                        }}
                      >
                        Thực hiện Đánh giá Kết quả Thử việc
                      </Button>
                    )}
                  </Card>

                  {/* Probation tasks */}
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                    Các mốc đánh giá định kỳ
                  </Typography>

                  {probationTasks.map((task) => {
                    const isDone = task.is_completed || task.isCompleted;

                    return (
                      <Card
                        key={task.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: isDone ? '#f0fdf4' : '#ffffff',
                          border: isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => handleToggleTaskComplete(task)}
                              sx={{ color: isDone ? '#16a34a' : '#94a3b8' }}
                            >
                              {isDone ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                            </IconButton>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                color={isDone ? '#166534' : '#0f172a'}
                                sx={{ textDecoration: isDone ? 'line-through' : 'none' }}
                              >
                                {task.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.description || 'Đánh giá năng lực theo mục tiêu công việc'}
                              </Typography>
                            </Box>
                          </Stack>

                          <Button
                            size="small"
                            variant={isDone ? 'outlined' : 'contained'}
                            color={isDone ? 'secondary' : 'primary'}
                            onClick={() => handleToggleTaskComplete(task)}
                            disabled={completeTaskItem.isPending}
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                          >
                            {isDone ? 'Bỏ chọn' : 'Đánh dấu xong'}
                          </Button>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Drawer Footer Actions */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#ffffff',
                borderTop: '1px solid',
                borderColor: pc.divider(0.85),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={() => setCancelDialogOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
              >
                Hủy Onboarding
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: '#475569',
                  borderColor: '#cbd5e1',
                }}
              >
                Đóng
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* Document Lightbox Modal */}
      <DocumentLightboxModal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={lightboxTitle}
        documentUrl={lightboxUrl}
      />

      {/* Reject Document Dialog */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Từ chối / Yêu cầu nộp lại giấy tờ
        </DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Vui lòng nhập lý do từ chối hồ sơ <strong>{rejectingTask?.title}</strong>:
          </Typography>
          <TextField
            multiline
            rows={3}
            placeholder="Ví dụ: Ảnh CCCD bị mờ, không nhìn rõ số định danh cá nhân..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectModalOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim() || rejectTaskDocument.isPending}
            onClick={handleConfirmRejectDoc}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {rejectTaskDocument.isPending ? 'Đang gửi...' : 'Xác nhận Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Probation Evaluation Modal */}
      <ProbationEvaluationModal
        open={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        employeeName={emp?.full_name || emp?.fullName || 'Nhân viên'}
        loading={evaluateProbation.isPending}
        onSubmit={handleSubmitEvaluation}
      />

      {/* Cancel Onboarding Process Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>
          Hủy quy trình Onboarding?
        </DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Thao tác này sẽ hủy quy trình tiếp nhận nhân sự và cập nhật trạng thái hợp đồng tương ứng.
          </Typography>
          <TextField
            multiline
            rows={3}
            label="Lý do hủy tiếp nhận *"
            placeholder="Ví dụ: Ứng viên từ chối nhận việc vào phút chót..."
            value={cancelReasonText}
            onChange={(e) => setCancelReasonText(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Đóng
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!cancelReasonText.trim() || cancelOnboarding.isPending}
            onClick={handleConfirmCancel}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {cancelOnboarding.isPending ? 'Đang xử lý...' : 'Xác nhận Hủy'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
