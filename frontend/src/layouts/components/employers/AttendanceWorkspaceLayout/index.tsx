'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';
import ScheduleSendOutlinedIcon from '@mui/icons-material/ScheduleSendOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';

interface AttendanceWorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function AttendanceWorkspaceLayout({ children }: AttendanceWorkspaceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Dropdown states
  const [anchorElChamCong, setAnchorElChamCong] = useState<null | HTMLElement>(null);
  const [anchorElCaLamViec, setAnchorElCaLamViec] = useState<null | HTMLElement>(null);
  const [anchorElDonTu, setAnchorElDonTu] = useState<null | HTMLElement>(null);

  const isChamCongActive =
    pathname.includes('/attendances/timesheets') ||
    pathname.includes('/attendances/monthly-summary') ||
    pathname.includes('/attendances/biometric-logs');

  const isCaLamViecActive =
    pathname.includes('/attendances/shift-assignments') ||
    pathname.includes('/attendances/shifts');

  const isDonTuActive = pathname.includes('/attendances/requests');

  const isTongQuanActive =
    pathname === '/employer/hrm/attendances' ||
    pathname === '/employer/hrm/attendances/';

  const isBaoCaoActive = pathname.includes('/attendances/reports');
  const isThietLapActive = pathname.includes('/attendances/settings');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      {/* Top Breadcrumb & Title Bar */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pt: 2.5,
          pb: 1.5,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.8125rem', mb: 1 }}>
          <MuiLink
            underline="hover"
            color="inherit"
            href="/employer/hrm/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/employer/hrm/dashboard');
            }}
            sx={{ cursor: 'pointer', color: '#64748B', '&:hover': { color: '#0F172A' } }}
          >
            Quản lý nhân sự
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
            Chấm công
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarMonthOutlinedIcon fontSize="medium" />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.25rem' }}>
                  Chấm công & Ca làm việc
                </Typography>
                <Chip
                  label="Chuẩn MISA AMIS"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                Tổng quan dữ liệu chấm công, quản lý ca, bảng tổng hợp tháng và phê duyệt đơn từ 2 cấp
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* MISA AMIS Styled Persistent Sub-Navbar */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: { xs: 1.5, md: 3 },
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: 2 },
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ py: 0.5 }}>
          {/* 1. Tổng quan */}
          <Button
            startIcon={<DashboardOutlinedIcon sx={{ fontSize: '1.125rem !important' }} />}
            onClick={() => router.push('/employer/hrm/attendances')}
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: isTongQuanActive ? 600 : 500,
              color: isTongQuanActive ? '#2563EB' : '#475569',
              backgroundColor: isTongQuanActive ? '#EFF6FF' : 'transparent',
              '&:hover': { backgroundColor: isTongQuanActive ? '#EFF6FF' : '#F8FAFC', color: '#1E293B' },
            }}
          >
            Tổng quan
          </Button>

          {/* 2. Chấm công ▾ */}
          <Button
            startIcon={<AccessTimeOutlinedIcon sx={{ fontSize: '1.125rem !important' }} />}
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1.125rem !important' }} />}
            onClick={(e) => setAnchorElChamCong(e.currentTarget)}
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: isChamCongActive ? 600 : 500,
              color: isChamCongActive ? '#2563EB' : '#475569',
              backgroundColor: isChamCongActive ? '#EFF6FF' : 'transparent',
              '&:hover': { backgroundColor: isChamCongActive ? '#EFF6FF' : '#F8FAFC', color: '#1E293B' },
            }}
          >
            Chấm công
          </Button>
          <Menu
            anchorEl={anchorElChamCong}
            open={Boolean(anchorElChamCong)}
            onClose={() => setAnchorElChamCong(null)}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, minWidth: 230, mt: 0.5, border: '1px solid #E2E8F0' },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorElChamCong(null);
                router.push('/employer/hrm/attendances/timesheets');
              }}
              selected={pathname.includes('/attendances/timesheets')}
            >
              <ListItemIcon>
                <TableChartOutlinedIcon fontSize="small" sx={{ color: '#2563EB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Bảng chấm công chi tiết"
                secondary="Chi tiết quẹt thẻ & công ngày 1-31"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElChamCong(null);
                router.push('/employer/hrm/attendances/monthly-summary');
              }}
              selected={pathname.includes('/attendances/monthly-summary')}
            >
              <ListItemIcon>
                <SummarizeOutlinedIcon fontSize="small" sx={{ color: '#059669' }} />
              </ListItemIcon>
              <ListItemText
                primary="Bảng chấm công tổng hợp"
                secondary="Khóa công & Chuyển tính lương"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                setAnchorElChamCong(null);
                router.push('/employer/hrm/attendances/biometric-logs');
              }}
              selected={pathname.includes('/attendances/biometric-logs')}
            >
              <ListItemIcon>
                <FingerprintOutlinedIcon fontSize="small" sx={{ color: '#D97706' }} />
              </ListItemIcon>
              <ListItemText
                primary="Dữ liệu máy chấm công"
                secondary="Log ZKTeco & Import Excel"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          </Menu>

          {/* 3. Ca làm việc ▾ */}
          <Button
            startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: '1.125rem !important' }} />}
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1.125rem !important' }} />}
            onClick={(e) => setAnchorElCaLamViec(e.currentTarget)}
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: isCaLamViecActive ? 600 : 500,
              color: isCaLamViecActive ? '#2563EB' : '#475569',
              backgroundColor: isCaLamViecActive ? '#EFF6FF' : 'transparent',
              '&:hover': { backgroundColor: isCaLamViecActive ? '#EFF6FF' : '#F8FAFC', color: '#1E293B' },
            }}
          >
            Ca làm việc
          </Button>
          <Menu
            anchorEl={anchorElCaLamViec}
            open={Boolean(anchorElCaLamViec)}
            onClose={() => setAnchorElCaLamViec(null)}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, minWidth: 230, mt: 0.5, border: '1px solid #E2E8F0' },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorElCaLamViec(null);
                router.push('/employer/hrm/attendances/shift-assignments');
              }}
              selected={pathname.includes('/attendances/shift-assignments')}
            >
              <ListItemIcon>
                <GridViewOutlinedIcon fontSize="small" sx={{ color: '#2563EB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Bảng phân ca tổng hợp"
                secondary="Phân ca nhân viên theo lịch tháng"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElCaLamViec(null);
                router.push('/employer/hrm/attendances/shifts');
              }}
              selected={pathname.includes('/attendances/shifts')}
            >
              <ListItemIcon>
                <ListAltOutlinedIcon fontSize="small" sx={{ color: '#059669' }} />
              </ListItemIcon>
              <ListItemText
                primary="Danh sách ca làm việc"
                secondary="Thiết lập khung giờ & dung sai"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          </Menu>

          {/* 4. Quản lý đơn ▾ */}
          <Button
            startIcon={<DescriptionOutlinedIcon sx={{ fontSize: '1.125rem !important' }} />}
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '1.125rem !important' }} />}
            onClick={(e) => setAnchorElDonTu(e.currentTarget)}
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: isDonTuActive ? 600 : 500,
              color: isDonTuActive ? '#2563EB' : '#475569',
              backgroundColor: isDonTuActive ? '#EFF6FF' : 'transparent',
              '&:hover': { backgroundColor: isDonTuActive ? '#EFF6FF' : '#F8FAFC', color: '#1E293B' },
            }}
          >
            Quản lý đơn
          </Button>
          <Menu
            anchorEl={anchorElDonTu}
            open={Boolean(anchorElDonTu)}
            onClose={() => setAnchorElDonTu(null)}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, minWidth: 260, mt: 0.5, border: '1px solid #E2E8F0' },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorElDonTu(null);
                router.push('/employer/hrm/attendances/requests');
              }}
              selected={pathname === '/employer/hrm/attendances/requests'}
            >
              <ListItemIcon>
                <DescriptionOutlinedIcon fontSize="small" sx={{ color: '#2563EB' }} />
              </ListItemIcon>
              <ListItemText
                primary="Tất cả đơn từ"
                secondary="Quy trình duyệt 2 cấp Quản lý và Nhân sự"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                setAnchorElDonTu(null);
                router.push('/employer/hrm/attendances/requests?type=LEAVE');
              }}
            >
              <ListItemIcon>
                <EventBusyOutlinedIcon fontSize="small" sx={{ color: '#DC2626' }} />
              </ListItemIcon>
              <ListItemText primary="Đơn xin nghỉ" primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElDonTu(null);
                router.push('/employer/hrm/attendances/requests?type=REGULARISATION');
              }}
            >
              <ListItemIcon>
                <AddTaskOutlinedIcon fontSize="small" sx={{ color: '#2563EB' }} />
              </ListItemIcon>
              <ListItemText primary="Đề nghị cập nhật công" primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElDonTu(null);
                router.push('/employer/hrm/attendances/requests?type=BUSINESS_TRIP');
              }}
            >
              <ListItemIcon>
                <FlightTakeoffOutlinedIcon fontSize="small" sx={{ color: '#059669' }} />
              </ListItemIcon>
              <ListItemText primary="Đề nghị đi công tác" primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElDonTu(null);
                router.push('/employer/hrm/attendances/requests?type=OVERTIME');
              }}
            >
              <ListItemIcon>
                <MoreTimeOutlinedIcon fontSize="small" sx={{ color: '#7C3AED' }} />
              </ListItemIcon>
              <ListItemText primary="Đơn làm thêm giờ" primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorElDonTu(null);
                router.push('/employer/hrm/attendances/requests?type=LATE_EARLY');
              }}
            >
              <ListItemIcon>
                <ScheduleSendOutlinedIcon fontSize="small" sx={{ color: '#D97706' }} />
              </ListItemIcon>
              <ListItemText primary="Đơn đi muộn, về sớm" primaryTypographyProps={{ fontSize: '0.875rem' }} />
            </MenuItem>
          </Menu>

          {/* 5. Báo cáo */}
          <Button
            startIcon={<AssessmentOutlinedIcon sx={{ fontSize: '1.125rem !important' }} />}
            onClick={() => router.push('/employer/hrm/attendances/reports')}
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: isBaoCaoActive ? 600 : 500,
              color: isBaoCaoActive ? '#2563EB' : '#475569',
              backgroundColor: isBaoCaoActive ? '#EFF6FF' : 'transparent',
              '&:hover': { backgroundColor: isBaoCaoActive ? '#EFF6FF' : '#F8FAFC', color: '#1E293B' },
            }}
          >
            Báo cáo
          </Button>

          {/* 6. Thiết lập */}
          <Button
            startIcon={<SettingsOutlinedIcon sx={{ fontSize: '1.125rem !important' }} />}
            onClick={() => router.push('/employer/hrm/attendances/settings')}
            sx={{
              px: 1.75,
              py: 1,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: isThietLapActive ? 600 : 500,
              color: isThietLapActive ? '#2563EB' : '#475569',
              backgroundColor: isThietLapActive ? '#EFF6FF' : 'transparent',
              '&:hover': { backgroundColor: isThietLapActive ? '#EFF6FF' : '#F8FAFC', color: '#1E293B' },
            }}
          >
            Thiết lập
          </Button>
        </Stack>
      </Paper>

      {/* Main Page Workspace Content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, backgroundColor: '#F8FAFC' }}>
        {children}
      </Box>
    </Box>
  );
}
