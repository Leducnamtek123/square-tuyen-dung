import React from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Stack,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type { NativeEmployeeOnboardingProcess, OnboardingStage } from '@/services/hrmService';
import pc from '@/utils/muiColors';

interface KanbanColumnConfig {
  key: string;
  stageMatch: OnboardingStage[];
  title: string;
  subtitle: string;
  headerBg: string;
  headerColor: string;
  borderColor: string;
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    key: 'DOCS',
    stageMatch: ['OFFER_ACCEPTED', 'PREBOARDING_DOCS'],
    title: 'Hồ sơ số & Pre-boarding',
    subtitle: 'Nộp CCCD, bằng cấp, STK',
    headerBg: '#fffbeb',
    headerColor: '#b45309',
    borderColor: '#fde68a',
  },
  {
    key: 'INTERNAL',
    stageMatch: ['INTERNAL_PREP'],
    title: 'Chuẩn bị Nội bộ',
    subtitle: 'Email, máy tính, mã chấm công',
    headerBg: '#f5f3ff',
    headerColor: '#6d28d9',
    borderColor: '#ddd6fe',
  },
  {
    key: 'DAY_ONE',
    stageMatch: ['DAY_ONE_WELCOME'],
    title: 'Ngày đầu Nhận việc',
    subtitle: 'Welcome, điểm danh & ký HĐ',
    headerBg: '#ecfeff',
    headerColor: '#0e7490',
    borderColor: '#a5f3fc',
  },
  {
    key: 'PROBATION',
    stageMatch: ['PROBATION_EVALUATION'],
    title: 'Đang Thử việc',
    subtitle: 'Đánh giá 30 - 60 ngày',
    headerBg: '#fefce8',
    headerColor: '#a16207',
    borderColor: '#fef08a',
  },
  {
    key: 'DONE',
    stageMatch: ['COMPLETED'],
    title: 'Đã Hoàn tất',
    subtitle: 'Nhân viên chính thức',
    headerBg: '#f0fdf4',
    headerColor: '#15803d',
    borderColor: '#bbf7d0',
  },
];

interface Props {
  processes: NativeEmployeeOnboardingProcess[];
  loading?: boolean;
  onSelectProcess: (process: NativeEmployeeOnboardingProcess) => void;
}

export const OnboardingKanbanView: React.FC<Props> = ({
  processes,
  loading = false,
  onSelectProcess,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
          Đang tải Kanban Board...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', pb: 2 }}>
      <Grid
        container
        spacing={2}
        sx={{
          minWidth: 1200,
          flexWrap: 'nowrap',
          alignItems: 'flex-start',
        }}
      >
        {KANBAN_COLUMNS.map((col) => {
          const colProcesses = processes.filter((p) => col.stageMatch.includes(p.stage));

          return (
            <Grid key={col.key} size={{ xs: 2.4 }} sx={{ minWidth: 260, flexShrink: 0 }}>
              {/* Column Header */}
              <Box
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: col.headerBg,
                  border: '1px solid',
                  borderColor: col.borderColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: col.headerColor, lineHeight: 1.2 }}>
                    {col.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    {col.subtitle}
                  </Typography>
                </Box>
                <Chip
                  label={colProcesses.length}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    bgcolor: '#ffffff',
                    color: col.headerColor,
                    height: 22,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                />
              </Box>

              {/* Column Cards */}
              <Stack spacing={1.5}>
                {colProcesses.length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2.5,
                      border: '1.5px dashed',
                      borderColor: pc.divider(0.8),
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Chưa có nhân sự
                    </Typography>
                  </Box>
                ) : (
                  colProcesses.map((proc) => {
                    const emp = proc.employee_detail;
                    const completedTasks = proc.tasks?.filter((t) => t.is_completed || t.isCompleted)?.length ?? 0;
                    const totalTasks = proc.tasks?.length ?? 0;
                    const progress = proc.progress_percent ?? proc.progressPercent ?? 0;
                    const startDate = proc.actual_start_date || proc.actualStartDate || proc.target_start_date || proc.targetStartDate;

                    // Check if has rejection note in any task
                    const hasRejectedDocs = proc.tasks?.some((t) => Boolean(t.rejection_note || t.rejectionNote));

                    return (
                      <Card
                        key={proc.id}
                        onClick={() => onSelectProcess(proc)}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          bgcolor: '#ffffff',
                          border: '1px solid',
                          borderColor: pc.divider(0.85),
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                            borderColor: pc.primary(0.4),
                          },
                        }}
                      >
                        {/* Header: Avatar, Name, Code */}
                        <Stack direction="row" spacing={1.2} alignItems="center" mb={1.2}>
                          <Avatar
                            src={emp?.avatar}
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: 800,
                              fontSize: '0.8125rem',
                              border: '1px solid #dbeafe',
                            }}
                          >
                            {(emp?.full_name || emp?.fullName)?.charAt(0)?.toUpperCase() || 'E'}
                          </Avatar>
                          <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 800,
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {emp?.full_name || emp?.fullName || 'Nhân viên mới'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#64748b',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                fontSize: '0.725rem',
                              }}
                            >
                              {emp?.employee_code || emp?.employeeCode || `ID #${proc.employee}`}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Position & Department */}
                        <Box sx={{ mb: 1.2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: '#1e293b',
                              fontSize: '0.8125rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {emp?.designation_title || emp?.designationTitle || 'Chưa gán chức danh'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: '#64748b', fontSize: '0.75rem' }}
                          >
                            {emp?.department_name || emp?.departmentName || 'Chưa phân phòng'}
                          </Typography>
                        </Box>

                        {/* Warning if rejected docs */}
                        {hasRejectedDocs && (
                          <Box
                            sx={{
                              mb: 1.2,
                              p: 0.8,
                              borderRadius: 1.5,
                              bgcolor: '#fef2f2',
                              border: '1px solid #fecaca',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                            }}
                          >
                            <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                            <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.7rem' }}>
                              Có hồ sơ bị từ chối
                            </Typography>
                          </Box>
                        )}

                        {/* Progress */}
                        <Box sx={{ mb: 1.2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.4}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                              Tiến độ
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.7rem' }}>
                              {progress}% ({completedTasks}/{totalTasks})
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 5,
                              borderRadius: 2.5,
                              bgcolor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 2.5,
                                bgcolor:
                                  progress === 100
                                    ? '#16a34a'
                                    : progress >= 60
                                    ? '#2563eb'
                                    : '#f59e0b',
                              },
                            }}
                          />
                        </Box>

                        {/* Footer: Date & Checklist Icon */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            pt: 1,
                            borderTop: '1px solid #f1f5f9',
                            color: 'text.secondary',
                            fontSize: '0.725rem',
                          }}
                        >
                          <Stack direction="row" spacing={0.6} alignItems="center">
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: '#64748b' }} />
                            <Typography variant="caption" sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem' }}>
                              {startDate || 'Chưa hẹn'}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={0.4} alignItems="center">
                            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', fontSize: '0.725rem' }}>
                              {completedTasks}/{totalTasks}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
