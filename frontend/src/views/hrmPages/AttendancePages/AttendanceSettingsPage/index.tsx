'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Snackbar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';

import { TabTitle } from '@/utils/generalFunction';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.875rem',
    backgroundColor: '#FFFFFF',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
  },
};

interface AttendanceSettingsState {
  // Grace period & punctuality
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  roundingMethod: string;

  // Overtime rules
  minOvertimeMinutes: number;
  weekdayOtRate: number;
  weekendOtRate: number;
  holidayOtRate: number;
  requirePreApprovedOt: boolean;

  // Request approval workflow
  twoStageApproval: boolean;
  maxApprovalHours: number;
  compensationAllowedDays: number;

  // Timesheet lock & payroll
  lockCutoffDay: number;
  autoLockAfterPayrollPush: boolean;
  syncLeaveBalance: boolean;

  // Biometric device integration
  biometricPort: number;
  syncIntervalMinutes: number;
  autoProcessPunches: boolean;
}

const DEFAULT_SETTINGS: AttendanceSettingsState = {
  lateGraceMinutes: 5,
  earlyLeaveGraceMinutes: 5,
  roundingMethod: 'NONE',
  minOvertimeMinutes: 30,
  weekdayOtRate: 150,
  weekendOtRate: 200,
  holidayOtRate: 300,
  requirePreApprovedOt: true,
  twoStageApproval: true,
  maxApprovalHours: 48,
  compensationAllowedDays: 3,
  lockCutoffDay: 25,
  autoLockAfterPayrollPush: true,
  syncLeaveBalance: true,
  biometricPort: 4200,
  syncIntervalMinutes: 15,
  autoProcessPunches: true,
};

const STORAGE_KEY = 'infohr_attendance_settings_v1';

export default function AttendanceSettingsPage() {
  TabTitle('Thiết lập Quy định Chấm công | InfoHR HRM');

  const [settings, setSettings] = useState<AttendanceSettingsState>(DEFAULT_SETTINGS);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setToastMessage('Đã lưu các thiết lập quy định chấm công thành công');
      setShowToast(true);
    } catch {
      setToastMessage('Lưu cài đặt thất bại, vui lòng thử lại');
      setShowToast(true);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      setToastMessage('Đã khôi phục các thiết lập quy định mặc định');
      setShowToast(true);
    } catch {
      // Ignore
    }
  };

  return (
    <Box>
      {/* Header Banner */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SettingsOutlinedIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A' }}>
                Thiết lập Quy định Chấm công
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Quy định dung sai quẹt thẻ, hệ số tính làm thêm giờ, quy trình duyệt đơn từ và kết nối máy chấm công
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<RestoreOutlinedIcon />}
              onClick={handleReset}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#475569',
                fontWeight: 600,
                '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
              }}
            >
              Khôi phục mặc định
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={handleSave}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Lưu thiết lập
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {/* 1. Dung sai thời gian & Đi muộn, về sớm */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccessTimeOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Quy định giờ & Dung sai đi muộn, về sớm
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Dung sai cho phép nhân viên quẹt thẻ trước hoặc sau ca
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Thời gian cho phép đi muộn không tính phạt
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={settings.lateGraceMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, lateGraceMinutes: Number(e.target.value) })
                    }
                    inputProps={{ min: 0, max: 60 }}
                    helperText="Số phút được phép đi muộn tối đa mà không bị ghi nhận vi phạm (ví dụ: 5 phút)"
                    sx={inputSx}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Thời gian cho phép về sớm không tính phạt
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={settings.earlyLeaveGraceMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, earlyLeaveGraceMinutes: Number(e.target.value) })
                    }
                    inputProps={{ min: 0, max: 60 }}
                    helperText="Số phút được phép về sớm tối đa trước khi hết ca làm việc (ví dụ: 5 phút)"
                    sx={inputSx}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Quy tắc làm tròn thời gian quẹt thẻ
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={settings.roundingMethod}
                    onChange={(e) =>
                      setSettings({ ...settings, roundingMethod: e.target.value })
                    }
                    sx={inputSx}
                  >
                    <MenuItem value="NONE">Không làm tròn, ghi nhận chính xác theo từng phút</MenuItem>
                    <MenuItem value="ROUND_5">Làm tròn theo từng mốc 5 phút gần nhất</MenuItem>
                    <MenuItem value="ROUND_15">Làm tròn theo từng mốc 15 phút gần nhất</MenuItem>
                    <MenuItem value="ROUND_30">Làm tròn theo từng mốc 30 phút gần nhất</MenuItem>
                  </TextField>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* 2. Quy định làm thêm giờ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: '#F3E8FF',
                    color: '#7E22CE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MoreTimeOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Quy định tính làm thêm giờ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Thiết lập hệ số công và điều kiện ghi nhận làm thêm
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Thời gian tối thiểu để bắt đầu tính làm thêm
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={settings.minOvertimeMinutes}
                    onChange={(e) =>
                      setSettings({ ...settings, minOvertimeMinutes: Number(e.target.value) })
                    }
                    inputProps={{ min: 15, step: 15, max: 120 }}
                    helperText="Số phút làm thêm sau ca tối thiểu để được ghi nhận vào hệ thống (ví dụ: 30 phút)"
                    sx={inputSx}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', mb: 0.5 }}>
                      Ngày thường
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      value={settings.weekdayOtRate}
                      onChange={(e) =>
                        setSettings({ ...settings, weekdayOtRate: Number(e.target.value) })
                      }
                      helperText="Hệ số % (150%)"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', mb: 0.5 }}>
                      Nghỉ cuối tuần
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      value={settings.weekendOtRate}
                      onChange={(e) =>
                        setSettings({ ...settings, weekendOtRate: Number(e.target.value) })
                      }
                      helperText="Hệ số % (200%)"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', mb: 0.5 }}>
                      Lễ tết
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      value={settings.holidayOtRate}
                      onChange={(e) =>
                        setSettings({ ...settings, holidayOtRate: Number(e.target.value) })
                      }
                      helperText="Hệ số % (300%)"
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ pt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requirePreApprovedOt}
                        onChange={(e) =>
                          setSettings({ ...settings, requirePreApprovedOt: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          Yêu cầu có đơn làm thêm giờ đã duyệt
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Chỉ tính giờ làm thêm khi đơn được Quản lý hoặc Nhân sự chấp thuận trước
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* 3. Quy trình phê duyệt đơn từ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FactCheckOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Quy trình phê duyệt đơn từ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Phân cấp duyệt đơn xin nghỉ, đề nghị cập nhật công và làm thêm giờ
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoStageApproval}
                        onChange={(e) =>
                          setSettings({ ...settings, twoStageApproval: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          Quy trình phê duyệt 2 cấp chuẩn doanh nghiệp
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Cấp 1 do Quản lý trực tiếp duyệt, Cấp 2 do Nhân sự xác nhận và bù công
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Thời hạn xử lý đơn tối đa
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={settings.maxApprovalHours}
                    onChange={(e) =>
                      setSettings({ ...settings, maxApprovalHours: Number(e.target.value) })
                    }
                    sx={inputSx}
                  >
                    <MenuItem value={24}>Trong vòng 24 giờ</MenuItem>
                    <MenuItem value={48}>Trong vòng 48 giờ</MenuItem>
                    <MenuItem value={72}>Trong vòng 72 giờ</MenuItem>
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Thời hạn cho phép gửi đơn cập nhật công
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={settings.compensationAllowedDays}
                    onChange={(e) =>
                      setSettings({ ...settings, compensationAllowedDays: Number(e.target.value) })
                    }
                    inputProps={{ min: 1, max: 15 }}
                    helperText="Số ngày tối đa kể từ ngày bị thiếu quẹt thẻ được phép nộp đơn bù công (ví dụ: 3 ngày)"
                    sx={inputSx}
                  />
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* 4. Khóa bảng công & Đẩy tính lương */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: '#DBEAFE',
                    color: '#1D4ED8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockClockOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Khóa bảng công & Đẩy tính lương
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Quy định chốt số liệu công và liên kết dữ liệu Bảng lương
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2.5 }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    Ngày chốt số liệu công hàng tháng
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    value={settings.lockCutoffDay}
                    onChange={(e) =>
                      setSettings({ ...settings, lockCutoffDay: Number(e.target.value) })
                    }
                    inputProps={{ min: 1, max: 31 }}
                    helperText="Ngày định kỳ hàng tháng thực hiện chốt bảng công (ví dụ: Ngày 25 hàng tháng)"
                    sx={inputSx}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoLockAfterPayrollPush}
                        onChange={(e) =>
                          setSettings({ ...settings, autoLockAfterPayrollPush: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          Tự động khóa bảng công sau khi đẩy lương
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Ngăn chặn việc sửa đổi bảng công sau khi số liệu đã chuyển sang phân hệ Bảng lương
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.syncLeaveBalance}
                        onChange={(e) =>
                          setSettings({ ...settings, syncLeaveBalance: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          Đồng bộ trừ quỹ phép năm tự động
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Cập nhật số ngày nghỉ phép còn lại trong hồ sơ nhân viên ngay khi đơn nghỉ được phê duyệt
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* 5. Cấu hình máy chấm công & Đồng bộ */}
        <Grid size={{ xs: 12 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RouterOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Cấu hình thiết bị máy chấm công & Chu kỳ đồng bộ
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  Kết nối máy chấm công qua mạng nội bộ hoặc giao thức kết nối chuyên dụng
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                  Cổng kết nối máy chấm công
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  value={settings.biometricPort}
                  onChange={(e) =>
                    setSettings({ ...settings, biometricPort: Number(e.target.value) })
                  }
                  helperText="Cổng mạng tiêu chuẩn dành cho thiết bị chấm công (mặc định: 4200)"
                  sx={inputSx}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                  Chu kỳ tự động quét & kéo log
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={settings.syncIntervalMinutes}
                  onChange={(e) =>
                    setSettings({ ...settings, syncIntervalMinutes: Number(e.target.value) })
                  }
                  sx={inputSx}
                >
                  <MenuItem value={5}>Mỗi 5 phút một lần</MenuItem>
                  <MenuItem value={15}>Mỗi 15 phút một lần</MenuItem>
                  <MenuItem value={30}>Mỗi 30 phút một lần</MenuItem>
                  <MenuItem value={60}>Mỗi 60 phút một lần</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ pt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoProcessPunches}
                        onChange={(e) =>
                          setSettings({ ...settings, autoProcessPunches: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          Tự động đối chiếu ca làm việc
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Tính toán công và đi muộn ngay khi log mới được ghi nhận
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Toast Feedback */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setShowToast(false)} sx={{ borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
