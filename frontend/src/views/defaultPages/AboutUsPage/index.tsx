'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid2 as Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { TabTitle } from '../../../utils/generalFunction';
import { APP_NAME } from '../../../configs/constants';

export default function AboutUsPage() {
  TabTitle(`Về chúng tôi — Hệ sinh thái Tuyển dụng & Nhân sự ${APP_NAME}`);

  const infohrFeatures = [
    {
      title: 'Quản Lý Hồ Sơ & Kết Nối Việc Làm',
      desc: 'Nền tảng kết nối ứng viên tài năng với hàng ngàn doanh nghiệp hàng đầu, số hóa sơ yếu lý lịch và quy trình ứng tuyển.',
      icon: PeopleAltOutlinedIcon,
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      title: 'Hệ Thống Quản Trị Nhân Sự InfoHR HRM',
      desc: 'Giải pháp quản lý nhân sự toàn diện: Hợp đồng lao động, sơ đồ tổ chức, quản lý phòng ban, điểm danh và chấm công số.',
      icon: BadgeOutlinedIcon,
      color: '#059669',
      bgColor: '#ECFDF5',
    },
    {
      title: 'Số Hóa Đường Ống Tuyển Dụng (Candidate CRM)',
      desc: 'Tự động hóa quy trình theo dõi hồ sơ ứng viên từ sơ tuyển, xếp lịch phỏng vấn đến tiếp nhận onboarding.',
      icon: AssignmentIndOutlinedIcon,
      color: '#D97706',
      bgColor: '#FEF3C7',
    },
  ];

  return (
    <Box sx={{ py: 6, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* HEADER TITLE */}
        <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: 6 }}>
          <Chip
            icon={<BusinessOutlinedIcon sx={{ color: '#2563EB !important', fontSize: 18 }} />}
            label="Hệ Sinh Thái Tuyển Dụng & Quản Trị Nhân Sự InfoHR"
            sx={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 1.5,
              py: 0.5,
              border: '1px solid #DBEAFE',
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.25 }}>
            Giải Pháp Tuyển Dụng & Quản Trị Nhân Sự Số Hóa
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 850, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>
            InfoHR mang đến hệ sinh thái toàn diện kết nối tài năng, quản trị hồ sơ và số hóa quy trình nhân sự doanh nghiệp — hỗ trợ chuyên sâu <strong>4 ngành nghề trọng điểm</strong> (Xây dựng, Bất động sản, Kiến trúc / Thiết kế nội thất, Kỹ thuật & Cơ điện). Đồng thời tích hợp trực tiếp với nền tảng phỏng vấn AI thông minh <strong>AILA AI</strong>.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" gap={1} sx={{ pt: 1 }}>
            <Chip label="🏗️ Xây dựng" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE' }} />
            <Chip label="🏢 Bất động sản" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE' }} />
            <Chip label="📐 Kiến trúc / Thiết kế nội thất" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE' }} />
            <Chip label="⚡ Kỹ thuật & Cơ điện (MEP)" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE' }} />
          </Stack>
        </Stack>

        {/* 2 PHẦN CHÍNH: INFOHR VS AILA AI */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {/* PHẦN 1: INFOHR ECOSYSTEM */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '20px',
                border: '2px solid #2563EB',
                bgcolor: '#FFFFFF',
                boxShadow: '0 10px 30px -5px rgba(37, 99, 235, 0.08)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 48, height: 48, borderRadius: '12px' }}>
                    <BusinessOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      1. InfoHR & Nền Tảng HRM
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Hệ Thống Quản Trị Nhân Sự Nổi Bật
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.65 }}>
                  Tập trung phát triển giải pháp số hóa toàn diện quy trình nhân sự, hỗ trợ doanh nghiệp đăng tin tuyển dụng, quản lý hồ sơ ứng viên và vận hành bộ máy HRM chuẩn hóa.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 'auto', pt: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Cổng tuyển dụng & Tìm kiếm hồ sơ ứng viên chuẩn mực
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Phân hệ HRM: Quản lý nhân viên, sơ đồ tổ chức & hợp đồng
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Đồng bộ dữ liệu chấm công và quy trình tiếp nhận nhân sự
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  href="/jobs"
                  sx={{
                    mt: 3,
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: '10px',
                    py: 1.2,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#1D4ED8' },
                  }}
                >
                  Khám Phá Việc Làm & Doanh Nghiệp InfoHR
                </Button>
              </Stack>
            </Card>
          </Grid>

          {/* PHẦN 2: AILA AI PLATFORM (TRỎ TRỰC TIẾP TỚI aila.infohr.vn) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '20px',
                border: '2px solid #FC054B',
                background: 'linear-gradient(135deg, #FFF0F4 0%, #FFFFFF 100%)',
                boxShadow: '0 10px 30px -5px rgba(252, 5, 75, 0.12)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FFE4E6', color: '#FC054B', width: 48, height: 48, borderRadius: '12px' }}>
                    <SmartToyOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      2. AILA AI — Phỏng Vấn Thông Minh
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#FC054B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Nền Tảng AI Phỏng Vấn Toàn Diện (aila.infohr.vn)
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.65 }}>
                  Chuyên biệt cho phỏng vấn sơ loại tự động bằng AI: Voice AI đa ngôn ngữ, phân tích biểu cảm video, chấm điểm Match Score % và Skill Gap Analysis.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 'auto', pt: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#FC054B', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Phỏng vấn Voice & Video AI tự động 24/7
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#FC054B', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Thuật toán AI Match Score & Xuất báo cáo năng lực
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#FC054B', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Trải nghiệm trực tiếp tại Cổng thông tin aila.infohr.vn
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  endIcon={<OpenInNewIcon />}
                  href="https://aila.infohr.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    mt: 3,
                    backgroundColor: '#FC054B',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: '10px',
                    py: 1.2,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(252, 5, 75, 0.3)',
                    '&:hover': { backgroundColor: '#D90440' },
                  }}
                >
                  Mở Trang Platform AILA AI (aila.infohr.vn)
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* CHI TIẾT TÍNH NĂNG NỔI BẬT NỀN TẢNG INFOHR */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', textAlign: 'center', mb: 4 }}>
            Tính Năng Trọng Tâm Hệ Sinh Thái InfoHR
          </Typography>
          <Grid container spacing={3}>
            {infohrFeatures.map((item) => {
              const IconComp = item.icon;
              return (
                <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <Stack spacing={2}>
                      <Avatar sx={{ bgcolor: item.bgColor, color: item.color, width: 44, height: 44, borderRadius: '12px' }}>
                        <IconComp />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                        {item.desc}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
