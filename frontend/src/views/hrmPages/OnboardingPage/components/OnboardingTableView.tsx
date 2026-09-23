import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import type { NativeEmployeeOnboardingProcess } from '@/services/hrmService';
import { ONBOARDING_STAGE_CONFIG } from './OnboardingFilters';
import pc from '@/utils/muiColors';

interface Props {
  processes: NativeEmployeeOnboardingProcess[];
  loading?: boolean;
  onSelectProcess: (process: NativeEmployeeOnboardingProcess) => void;
}

export const OnboardingTableView: React.FC<Props> = ({
  processes,
  loading = false,
  onSelectProcess,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: pc.divider(0.85),
        overflow: 'hidden',
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      <TableContainer sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table size="medium" sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem', py: 1.8 }}>
                Nhân sự tiếp nhận
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>
                Phòng ban & Vị trí
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>
                Quản lý trực tiếp
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>
                Ngày nhận việc
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>
                Chặng hiện tại
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem', minWidth: 160 }}>
                Tiến độ Checklist
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8125rem' }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                    Đang tải danh sách Onboarding...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : processes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                      color: '#94a3b8',
                    }}
                  >
                    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                    Không tìm thấy nhân sự phù hợp
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thử thay đổi bộ lọc tìm kiếm hoặc chặng onboarding
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              processes.map((proc) => {
                const emp = proc.employee_detail;
                const stageCfg = ONBOARDING_STAGE_CONFIG[proc.stage] || {
                  label: proc.stage_label || proc.stage,
                  bg: '#f1f5f9',
                  text: '#475569',
                  border: '#cbd5e1',
                };
                const completedTasks = proc.tasks?.filter((t) => t.is_completed || t.isCompleted)?.length ?? 0;
                const totalTasks = proc.tasks?.length ?? 0;
                const progress = proc.progress_percent ?? proc.progressPercent ?? 0;

                return (
                  <TableRow
                    key={proc.id}
                    hover
                    onClick={() => onSelectProcess(proc)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {/* Candidate / Employee info */}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={emp?.avatar}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            border: '1.5px solid #dbeafe',
                          }}
                        >
                          {(emp?.full_name || emp?.fullName)?.charAt(0)?.toUpperCase() || 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {emp?.full_name || emp?.fullName || 'Nhân viên mới'}
                          </Typography>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#64748b',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                              }}
                            >
                              {emp?.employee_code || emp?.employeeCode || `ID #${proc.employee}`}
                            </Typography>
                            {emp?.email && (
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                • {emp.email}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Department & Designation */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {emp?.designation_title || emp?.designationTitle || 'Chưa gán chức danh'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {emp?.department_name || emp?.departmentName || 'Chưa phân phòng'}
                      </Typography>
                    </TableCell>

                    {/* Manager */}
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                        {emp?.reports_to_name || emp?.reportsToName || '---'}
                      </Typography>
                    </TableCell>

                    {/* Start Date */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#1e293b', fontWeight: 600 }}
                      >
                        {proc.actual_start_date || proc.actualStartDate || proc.target_start_date || proc.targetStartDate || 'Chưa xác định'}
                      </Typography>
                      {proc.probation_end_date || proc.probationEndDate ? (
                        <Tooltip title="Ngày kết thúc thử việc">
                          <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600 }}>
                            Hạn TV: {proc.probation_end_date || proc.probationEndDate}
                          </Typography>
                        </Tooltip>
                      ) : null}
                    </TableCell>

                    {/* Stage Chip */}
                    <TableCell>
                      <Chip
                        label={stageCfg.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          bgcolor: stageCfg.bg,
                          color: stageCfg.text,
                          border: `1px solid ${stageCfg.border}`,
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>

                    {/* Progress Bar & Task Count */}
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="caption" fontWeight={700} color="#1e293b">
                            {progress}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {completedTasks}/{totalTasks} việc
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor:
                                progress === 100
                                  ? '#16a34a'
                                  : progress >= 60
                                  ? '#2563eb'
                                  : progress >= 30
                                  ? '#f59e0b'
                                  : '#64748b',
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Action button */}
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProcess(proc);
                        }}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.775rem',
                          color: '#2563eb',
                          borderColor: '#bfdbfe',
                          bgcolor: '#eff6ff',
                          '&:hover': {
                            bgcolor: '#dbeafe',
                            borderColor: '#93c5fd',
                          },
                        }}
                      >
                        Xử lý
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
