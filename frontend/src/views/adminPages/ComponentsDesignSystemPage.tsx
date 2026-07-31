'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid2 as Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SendIcon from '@mui/icons-material/Send';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

import Image from 'next/image';
import { CHATBOT_ICONS } from '@/configs/images';

// Components
import NoDataCard from '@/components/Common/NoDataCard';
import EmptyCard from '@/components/Common/EmptyCard';
import JobPostLarge from '@/components/Features/JobPostLarge';
import NotFoundPage from '@/views/errorsPage/NotFoundPage';
import ForbiddenPage from '@/views/errorsPage/ForbiddenPage';
import NumberCard from '@/components/Common/NumberCard';
import { ExportModal } from '@/components/Common/ExportModal/ExportModal';

export default function ComponentsDesignSystemPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [errorPreview, setErrorPreview] = useState<'404' | '403'>('404');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const svgVariants = [
    { key: 'ImageSvg3', title: 'Không tìm thấy việc làm phù hợp với tiêu chí của bạn', desc: 'Dùng cho tìm kiếm việc làm rỗng (emptyStreet.svg)' },
    { key: 'ImageSvg1', title: 'Hiện chưa tìm thấy công ty phù hợp với tiêu chí của bạn', desc: 'Dùng cho danh sách công ty rỗng (emptyData.svg)' },
    { key: 'ImageSvg11', title: 'Chưa tìm thấy ứng viên phù hợp nhu cầu tuyển dụng', desc: 'Dùng cho tìm kiếm ứng viên rỗng (profileData.svg)' },
    { key: 'ImageSvg12', title: 'Chưa có dữ liệu hợp đồng & văn bản', desc: 'Dùng cho quản lý hợp đồng/văn bản rỗng (myDocuments.svg)' },
    { key: 'ImageSvg10', title: 'Chưa có thông báo hoặc lịch hẹn phong vấn', desc: 'Dùng cho thông báo rỗng (noteListSvg.svg)' },
    { key: 'ImageSvg6', title: 'Chưa có dữ liệu làm việc từ xa', desc: 'Dùng cho quản lý công việc (workingRemotely.svg)' },
    { key: 'ImageSvg15', title: 'Không tìm thấy dữ liệu yêu cầu', desc: 'Dùng cho kết quả tìm kiếm rỗng tổng quát (sad.svg)' },
  ];

  const dummyExportData = [
    { id: 101, name: 'Nguyễn Văn An', position: 'Kỹ sư Kiến trúc', email: 'an.nguyen@gmail.com' },
    { id: 102, name: 'Trần Thị Bình', position: 'HR Manager', email: 'binh.tran@gmail.com' },
  ];

  return (
    <Box sx={{ pb: 8, pt: 3, px: { xs: 2, md: 4 }, minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Container maxWidth="xl">
        {/* Header Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.25)',
          }}
        >
          <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                icon={<WidgetsOutlinedIcon sx={{ color: '#60A5FA !important', fontSize: 18 }} />}
                label="InfoHR Design System 2026 — Comprehensive Gallery"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#93C5FD',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  backdropFilter: 'blur(8px)',
                  px: 1,
                }}
              />
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2.2rem' }, color: '#FFFFFF' }}>
              Thư viện Giao diện & System Components Toàn Diện
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 800, fontSize: '0.95rem' }}>
              Thống kê và kiểm thử 100% tất cả các component giao diện trên hệ thống InfoHR: Thẻ State Data Rỗng (`NoDataCard`), Thẻ Nét Đứt (`EmptyCard`), KPI Cards, Kanban Pipeline, Bộ Nút bấm (Thêm/Sửa/Xóa/Upload/Export), Chat AILA AI và Màn hình Lỗi hệ thống.
            </Typography>
          </Stack>
        </Paper>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.92rem',
                minHeight: 48,
                mr: 2,
                color: '#64748B',
                '&.Mui-selected': {
                  color: '#2563EB',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563EB',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab label="1. Thẻ State Data Rỗng (NoDataCard Variants)" />
            <Tab label="2. Thẻ Nét Đứt & Action (EmptyCard)" />
            <Tab label="3. Thẻ Việc Làm, Ứng Viên & Công Ty (Feature Cards)" />
            <Tab label="4. Bộ Nút Bấm Chuẩn (Button System)" />
            <Tab label="5. Thẻ Thống Kê KPI & Kanban Pipeline" />
            <Tab label="6. Giao Diện Chat AILA AI & Modal Export" />
            <Tab label="7. Bảng Dữ Liệu & Status Chips" />
            <Tab label="8. Màn Hình Lỗi (404 & 403)" />
          </Tabs>
        </Box>

        {/* TAB 1: NO DATA CARD VARIANTS */}
        {activeTab === 0 && (
          <Stack spacing={4}>
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Mẫu Nổi Bật: Không tìm thấy việc làm phù hợp với tiêu chí của bạn
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Được sử dụng tại trang Tìm kiếm việc làm khi người dùng lọc không có kết quả phù hợp (`svgKey="ImageSvg3"`).
              </Typography>
              <NoDataCard
                title="Không tìm thấy việc làm phù hợp với tiêu chí của bạn"
                content="Hãy thử điều chỉnh lại bộ lọc địa điểm, ngành nghề hoặc xóa từ khóa tìm kiếm để khám phá thêm nhiều cơ hội công việc khác."
                buttonText="Xóa bộ lọc & Thử lại"
                svgKey="ImageSvg3"
                onClick={() => {}}
              />
            </Card>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mt: 2 }}>
              Tất cả 7 Mẫu Minh Họa SVG Trạng Thái Rỗng (Empty State Variants)
            </Typography>
            <Grid container spacing={3}>
              {svgVariants.map((item) => (
                <Grid size={{ xs: 12, md: 6 }} key={item.key}>
                  <Card sx={{ p: 2, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none', height: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563EB', display: 'block', mb: 1 }}>
                      {item.key} — {item.desc}
                    </Typography>
                    <NoDataCard
                      title={item.title}
                      content="Dữ liệu hiển thị trực quan theo tiêu chuẩn thiết kế SaaS 2026."
                      buttonText="Tải lại dữ liệu"
                      svgKey={item.key}
                      onClick={() => {}}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}

        {/* TAB 2: EMPTY CARD (DASHED) */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', mb: 1.5 }}>
                Thẻ Thêm Kinh Nghiệm Làm Việc
              </Typography>
              <EmptyCard content="Chưa có thông tin kinh nghiệm làm việc" labelButton="Thêm kinh nghiệm" onClick={() => {}} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', mb: 1.5 }}>
                Thẻ Thêm Trình Độ Học Vấn
              </Typography>
              <EmptyCard content="Chưa cập nhật quá trình học vấn" labelButton="Thêm học vấn" onClick={() => {}} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748B', mb: 1.5 }}>
                Thẻ Thêm Chứng Chỉ & Kỹ Năng
              </Typography>
              <EmptyCard content="Chưa bổ sung chứng chỉ chuyên môn" labelButton="Thêm chứng chỉ" onClick={() => {}} />
            </Grid>
          </Grid>
        )}

        {/* TAB 3: FEATURE CARDS (JOB, CANDIDATE, COMPANY) */}
        {activeTab === 2 && (
          <Stack spacing={4}>
            {/* Job Cards */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                1. Thẻ Bài Tuyển Dụng (`JobPostLarge`)
              </Typography>
              <Stack spacing={2}>
                <JobPostLarge
                  id={101}
                  slug="ki-su-thiet-ke-noi-that-senior"
                  companyName="Square Group Studio"
                  jobName="Kỹ Sư Thiết Kế Nội Thất Senior (Senior Interior Designer)"
                  cityId={1}
                  salaryMin={20000000}
                  salaryMax={35000000}
                  deadline="2026-08-30"
                  isHot={true}
                  isUrgent={true}
                />
              </Stack>
            </Card>

            {/* Candidate Card Preview */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                2. Thẻ Hồ Sơ Ứng Viên (`Candidate Card` + Badge Phù hợp)
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  '&:hover': { boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08)' },
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 56, height: 56, bgcolor: '#2563EB', fontWeight: 700, fontSize: '1.2rem' }}>
                      NV
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                          Nguyễn Văn An
                        </Typography>
                        <Chip
                          icon={<CheckCircleOutlinedIcon sx={{ color: '#059669 !important', fontSize: 16 }} />}
                          label="🎯 Phù hợp nhu cầu tuyển dụng"
                          sx={{
                            backgroundColor: '#ECFDF5',
                            color: '#047857',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            border: '1px solid #A7F3D0',
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                        Architect / Kỹ sư Thiết kế Kiến trúc • 5 năm kinh nghiệm
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1, color: '#64748B', fontSize: '0.825rem' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">TP. Hồ Chí Minh</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">Toàn thời gian</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      borderRadius: '10px',
                      px: 2.5,
                      py: 0.9,
                      textTransform: 'none',
                    }}
                  >
                    Xem Hồ Sơ Ứng Viên
                  </Button>
                </Stack>
              </Paper>
            </Card>
          </Stack>
        )}

        {/* TAB 4: BUTTON SYSTEM */}
        {activeTab === 3 && (
          <Stack spacing={4}>
            {/* Primary & Action Buttons */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Nút Thêm mới (Add Buttons)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Sử dụng cho hành động tạo mới dữ liệu, đăng tin, thêm học vấn/kinh nghiệm.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderRadius: '10px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
                    '&:hover': { backgroundColor: '#1D4ED8', transform: 'translateY(-1px)' },
                  }}
                >
                  Thêm tin tuyển dụng
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderRadius: '8px',
                    px: 2,
                    py: 0.7,
                    textTransform: 'none',
                  }}
                >
                  Thêm ứng viên
                </Button>
              </Stack>
            </Card>

            {/* Delete & Danger Buttons */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#DC2626', mb: 1 }}>
                Nút Xóa & Cảnh Báo (Delete & Danger Buttons)
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
                <Button
                  variant="contained"
                  startIcon={<DeleteOutlineIcon />}
                  sx={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.9,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                    '&:hover': { backgroundColor: '#B91C1C' },
                  }}
                >
                  Xóa dữ liệu
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  sx={{
                    borderColor: '#FCA5A5',
                    color: '#DC2626',
                    backgroundColor: '#FEF2F2',
                    fontWeight: 600,
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.9,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
                  }}
                >
                  Hủy kích hoạt
                </Button>
              </Stack>
            </Card>
          </Stack>
        )}

        {/* TAB 5: KPI STAT CARDS & KANBAN PIPELINE */}
        {activeTab === 4 && (
          <Stack spacing={4}>
            {/* KPI Metric Cards */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Tổng Việc Làm
                    </Typography>
                    <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 38, height: 38 }}>
                      <WorkOutlineOutlinedIcon fontSize="small" />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    142
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, color: '#059669' }}>
                    <TrendingUpOutlinedIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>+12.4% so với tháng trước</Typography>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Ứng Viên Ứng Tuyển
                    </Typography>
                    <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 38, height: 38 }}>
                      <PeopleAltOutlinedIcon fontSize="small" />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    1,890
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, color: '#059669' }}>
                    <TrendingUpOutlinedIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>+18.2% hồ sơ mới</Typography>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Lịch Phỏng Vấn AI
                    </Typography>
                    <Avatar sx={{ bgcolor: '#FEF3C7', color: '#D97706', width: 38, height: 38 }}>
                      <AssignmentTurnedInOutlinedIcon fontSize="small" />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    64
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', mt: 1, display: 'block' }}>
                    Đã hoàn thành 52 buổi
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                      Tỉ Lệ Đạt Yêu Cầu
                    </Typography>
                    <Avatar sx={{ bgcolor: '#F3E8FF', color: '#9333EA', width: 38, height: 38 }}>
                      <AssessmentOutlinedIcon fontSize="small" />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    84.5%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', mt: 1, display: 'block' }}>
                    Dựa trên thuật toán Matching AI
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Kanban Pipeline Preview */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 3 }}>
                Quy Trình Tuyển Dụng Kanban Pipeline (Recruitment Columns)
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
                        1. Sơ tuyển hồ sơ (3)
                      </Typography>
                      <Chip label="Mới" size="small" color="primary" />
                    </Stack>
                    <Stack spacing={1.5}>
                      <Card sx={{ p: 2, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Nguyễn Văn An</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>Senior Architect • 5 năm</Typography>
                      </Card>
                      <Card sx={{ p: 2, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Trần Thị Bình</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>Interior Designer • 3 năm</Typography>
                      </Card>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E' }}>
                        2. Phỏng vấn AI Live (2)
                      </Typography>
                      <Chip label="Đang phỏng vấn" size="small" sx={{ bgcolor: '#F59E0B', color: '#FFF' }} />
                    </Stack>
                    <Stack spacing={1.5}>
                      <Card sx={{ p: 2, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Phạm Hoàng Nam</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>Lịch: 14:00 - Hôm nay</Typography>
                      </Card>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#ECFDF5', border: '1px solid #6EE7B7' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065F46' }}>
                        3. Trúng tuyển & Onboarding (4)
                      </Typography>
                      <Chip label="Hoàn tất" size="small" color="success" />
                    </Stack>
                    <Stack spacing={1.5}>
                      <Card sx={{ p: 2, borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Lê Minh Khoa</Typography>
                        <Typography variant="caption" sx={{ color: '#059669' }}>Đã ký hợp đồng lao động</Typography>
                      </Card>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        )}

        {/* TAB 6: CHATBOT & EXPORT DIALOG PREVIEW */}
        {activeTab === 5 && (
          <Stack spacing={4}>
            {/* AILA AI Chat Bubble Preview */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                Giao Diện Khung Chat AI AILA (`ChatBot Widget & MessageResponse`)
              </Typography>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', maxWidth: 650 }}>
                <Stack spacing={2}>
                  {/* User message */}
                  <Stack direction="row" justifyContent="flex-end">
                    <Box sx={{ p: 1.8, px: 2.2, borderRadius: '16px 16px 2px 16px', bgcolor: '#2563EB', color: '#FFF', fontWeight: 500, fontSize: '0.9rem' }}>
                      Hãy phân tích cho tôi các ứng viên kiến trúc sư phù hợp nhất tuần này.
                    </Box>
                  </Stack>
                  {/* AI Agent message */}
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #DBEAFE', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <Image src={CHATBOT_ICONS.EMPLOYER} alt="AILA AI" width={32} height={32} style={{ objectFit: 'contain' }} />
                    </Box>
                    <Box sx={{ p: 2, borderRadius: '16px 16px 16px 2px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                        Trợ lý AI AILA
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                        Dựa trên dữ liệu nhu cầu tuyển dụng của doanh nghiệp, tôi tìm thấy <strong>3 ứng viên hàng đầu</strong> đạt điểm tương thích trên 85%:
                        <br />
                        • <strong>Nguyễn Văn An</strong> (92% Match Score - Kỹ sư Senior)
                        <br />
                        • <strong>Trần Thị Bình</strong> (88% Match Score - Interior Designer)
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Card>

            {/* Export Dialog Preview Button */}
            <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Hộp Thoại Xuất Báo Cáo Dữ Liệu (`ExportModal Dialog`)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Hộp thoại xem trước trực tiếp quy trình xuất file Excel / PDF báo cáo ứng viên.
              </Typography>
              <Button
                variant="contained"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={() => setIsExportModalOpen(true)}
                sx={{ backgroundColor: '#2563EB', color: '#FFF', fontWeight: 600, borderRadius: '10px', px: 3, py: 1 }}
              >
                Mở Hộp Thoại Export Preview
              </Button>

              <ExportModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                defaultFileName="danh-sach-ung-vien"
                title="Xuất Báo Cáo Danh Sách Ứng Viên"
                columns={[
                  { id: 'name', label: 'Họ và tên', checked: true },
                  { id: 'position', label: 'Vị trí', checked: true },
                  { id: 'email', label: 'Email', checked: true },
                ]}
                fetchData={async () => dummyExportData}
              />
            </Card>
          </Stack>
        )}

        {/* TAB 7: TABLES & BADGES */}
        {activeTab === 6 && (
          <Card sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
              Bảng Dữ Liệu & Nhãn Trạng Thái (Table & Status Badges)
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Mã bài đăng</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tên vị trí tuyển dụng</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Doanh nghiệp</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#JOB-8821</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2563EB' }}>Kỹ Sư Kiến Trúc Senior</TableCell>
                    <TableCell>Square Studio VN</TableCell>
                    <TableCell>
                      <Chip label="Đã duyệt" size="small" sx={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" sx={{ color: '#2563EB' }}><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#DC2626' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#JOB-8822</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2563EB' }}>Chuyên Viên Nhân Sự HRM</TableCell>
                    <TableCell>InfoHR Tech</TableCell>
                    <TableCell>
                      <Chip label="Chờ duyệt" size="small" sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" sx={{ color: '#2563EB' }}><EditOutlinedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#DC2626' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* TAB 8: ERROR PAGES PREVIEW */}
        {activeTab === 7 && (
          <Card sx={{ p: 3, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant={errorPreview === '404' ? 'contained' : 'outlined'}
                onClick={() => setErrorPreview('404')}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Xem trang Lỗi 404 (Not Found)
              </Button>
              <Button
                variant={errorPreview === '403' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setErrorPreview('403')}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Xem trang Lỗi 403 (Forbidden)
              </Button>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ border: '1px dashed #CBD5E1', borderRadius: '16px', py: 4 }}>
              {errorPreview === '404' ? <NotFoundPage /> : <ForbiddenPage />}
            </Box>
          </Card>
        )}
      </Container>
    </Box>
  );
}
