import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessIcon from '@mui/icons-material/Business';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import type { TFunction } from 'i18next';
import type { JobPostActivity } from '@/types/models';
import hrmService, {
  type NativeDepartment,
  type NativeDesignation,
  type OnboardCandidatePayload,
} from '@/services/hrmService';
import {
  buildEmployeeFromApplicationPayload,
  type EmployeeFromApplicationFormState,
} from './employeeFromApplicationDialogState';

type Props = {
  open: boolean;
  activity: JobPostActivity | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: OnboardCandidatePayload) => void;
  t: TFunction;
};

const getTodayString = () => new Date().toISOString().slice(0, 10);
const getTwoMonthsLaterString = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d.toISOString().slice(0, 10);
};

const EmployeeFromApplicationDialog = ({
  open,
  activity,
  loading,
  onClose,
  onSubmit,
  t,
}: Props) => {
  const theme = useTheme();
  const [departments, setDepartments] = useState<NativeDepartment[]>([]);
  const [designations, setDesignations] = useState<NativeDesignation[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(false);

  const [form, setForm] = useState<EmployeeFromApplicationFormState>({
    departmentId: '',
    designationId: '',
    reportsToId: '',
    joinDate: getTodayString(),
    probationEndDate: getTwoMonthsLaterString(),
    baseSalary: '',
    allowance: '',
    employmentType: 'FULL_TIME',
    status: 'PROBATION',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setLoadingMetadata(true);

    Promise.all([hrmService.getDepartments(), hrmService.getDesignations()])
      .then(([depts, desigs]) => {
        if (isMounted) {
          setDepartments(depts || []);
          setDesignations(desigs || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching HRM metadata for onboarding:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingMetadata(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!activity) return;
    setForm({
      departmentId: '',
      designationId: '',
      reportsToId: '',
      joinDate: getTodayString(),
      probationEndDate: getTwoMonthsLaterString(),
      baseSalary: '',
      allowance: '',
      employmentType: 'FULL_TIME',
      status: 'PROBATION',
      notes: '',
    });
  }, [activity]);

  if (!activity) return null;

  const candidateName = activity.fullName || 'Ứng viên';
  const candidateEmail = activity.email || '';
  const candidatePhone = activity.phone || '';
  const appliedPosition = activity.jobName || activity.jobPost?.jobName || 'Vị trí tuyển dụng';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const payload = buildEmployeeFromApplicationPayload(activity.id, form);
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'primary.50',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PersonAddAlt1Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Tiếp nhận Nhân sự từ Ứng viên Trúng tuyển
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chuyển đổi hồ sơ ứng tuyển vào phân hệ Nhân sự nội bộ (Native HRM)
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        {/* Candidate Read-only Summary Card */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', fontWeight: 700 }}>
            Thông tin Ứng viên (Kế thừa từ Tuyển dụng)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    fontWeight: 700,
                  }}
                >
                  {candidateName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {candidateName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    <WorkOutlineIcon sx={{ fontSize: 14 }} />
                    <span>{appliedPosition}</span>
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  <EmailOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>{candidateEmail || 'Chưa cập nhật email'}</span>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>{candidatePhone || 'Chưa cập nhật SĐT'}</span>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Employment Configuration Form */}
        <Box component="form" id="onboard-candidate-form" onSubmit={handleSubmit}>
          <Typography variant="subtitle2" color="primary.main" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ fontSize: 16 }} /> Thiết lập Vị trí & Hợp đồng Nhận việc
          </Typography>

          {loadingMetadata ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="onboard-dept-label">Phòng ban làm việc</InputLabel>
                  <Select
                    labelId="onboard-dept-label"
                    label="Phòng ban làm việc"
                    value={form.departmentId}
                    onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value as number | '' }))}
                  >
                    <MenuItem value="">
                      <em>-- Chưa phân bổ phòng ban --</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code || 'N/A'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="onboard-desig-label">Chức danh / Vị trí</InputLabel>
                  <Select
                    labelId="onboard-desig-label"
                    label="Chức danh / Vị trí"
                    value={form.designationId}
                    onChange={(e) => setForm((prev) => ({ ...prev, designationId: e.target.value as number | '' }))}
                  >
                    <MenuItem value="">
                      <em>-- Chưa chọn chức danh --</em>
                    </MenuItem>
                    {designations.map((desig) => (
                      <MenuItem key={desig.id} value={desig.id}>
                        {desig.title} ({desig.code || 'N/A'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="onboard-type-label">Loại hình làm việc</InputLabel>
                  <Select
                    labelId="onboard-type-label"
                    label="Loại hình làm việc"
                    value={form.employmentType}
                    onChange={(e) => setForm((prev) => ({ ...prev, employmentType: e.target.value }))}
                  >
                    <MenuItem value="FULL_TIME">Toàn thời gian (Full-time)</MenuItem>
                    <MenuItem value="PART_TIME">Bán thời gian (Part-time)</MenuItem>
                    <MenuItem value="CONTRACT">Hợp đồng ngắn hạn (Contract)</MenuItem>
                    <MenuItem value="INTERN">Thực tập sinh (Intern)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="onboard-status-label">Trạng thái tiếp nhận</InputLabel>
                  <Select
                    labelId="onboard-status-label"
                    label="Trạng thái tiếp nhận"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="PROBATION">Thử việc (Probation)</MenuItem>
                    <MenuItem value="ACTIVE">Chính thức (Active)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Ngày bắt đầu nhận việc"
                  value={form.joinDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, joinDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Hạn kết thúc thử việc (nếu có)"
                  value={form.probationEndDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, probationEndDate: e.target.value }))}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Lương cơ bản khởi điểm (VNĐ/tháng)"
                  value={form.baseSalary}
                  onChange={(e) => setForm((prev) => ({ ...prev, baseSalary: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="Ví dụ: 15000000"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Phụ cấp hàng tháng (VNĐ)"
                  value={form.allowance}
                  onChange={(e) => setForm((prev) => ({ ...prev, allowance: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="Ví dụ: 1000000"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Ghi chú tiếp nhận / Bàn giao"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú về thiết bị bàn giao, mentor hướng dẫn hoặc thỏa thuận riêng..."
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {t('employer:employees.dialog.cancel', { defaultValue: 'Hủy bỏ' })}
        </Button>
        <Button
          type="submit"
          form="onboard-candidate-form"
          variant="contained"
          disabled={loading || loadingMetadata}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddAlt1Icon sx={{ fontSize: 18 }} />}
          sx={{ px: 3, fontWeight: 700 }}
        >
          {loading ? 'Đang tiếp nhận...' : 'Chuyển sang tiếp nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeFromApplicationDialog;
