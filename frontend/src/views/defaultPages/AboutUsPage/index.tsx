'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Button,
  Card,
  Container,
  Grid2 as Grid,
  Stack,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';

// Icons
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import EngineeringIcon from '@mui/icons-material/Engineering';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';

import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME } from '@/configs/constants';
import { useTranslation } from 'react-i18next';

export default function AboutUsPage() {
  const { t } = useTranslation('about');
  TabTitle(t('aboutUsPage.tabTitle', { appName: APP_NAME, defaultValue: `Về chúng tôi - Hệ sinh thái Tuyển dụng & Quản trị Nhân sự ${APP_NAME}` }));

  // 4 Nhóm ngành trọng điểm
  const focusIndustries = [
    { label: t('aboutUsPage.industries.construction', { defaultValue: 'Xây dựng' }), icon: EngineeringIcon },
    { label: t('aboutUsPage.industries.realEstate', { defaultValue: 'Bất động sản' }), icon: ApartmentIcon },
    { label: t('aboutUsPage.industries.architecture', { defaultValue: 'Kiến trúc / Thiết kế nội thất' }), icon: ArchitectureIcon },
    { label: t('aboutUsPage.industries.mep', { defaultValue: 'Kỹ thuật & Cơ điện (MEP)' }), icon: BoltIcon },
  ];

  // 4 Thước đo số liệu bảo chứng
  const stats = [
    { num: '50.000+', label: t('aboutUsPage.stats.candidates', { defaultValue: 'Ứng viên tài năng kết nối' }), desc: t('aboutUsPage.stats.candidatesDesc', { defaultValue: 'Hồ sơ chuyên môn cao' }) },
    { num: '1.200+', label: t('aboutUsPage.stats.companies', { defaultValue: 'Doanh nghiệp đồng hành' }), desc: t('aboutUsPage.stats.companiesDesc', { defaultValue: 'Tập đoàn & đối tác uy tín' }) },
    { num: '98%', label: t('aboutUsPage.stats.satisfaction', { defaultValue: 'Độ hài lòng tuyển dụng' }), desc: t('aboutUsPage.stats.satisfactionDesc', { defaultValue: 'Đánh giá tích cực từ đối tác' }) },
    { num: '24/7', label: t('aboutUsPage.stats.aiOperating', { defaultValue: 'Vận hành & Phỏng vấn AI' }), desc: t('aboutUsPage.stats.aiOperatingDesc', { defaultValue: 'Không giới hạn thời gian' }) },
  ];

  // 4 Bento Cards - Giá trị cốt lõi
  const coreValues = [
    {
      title: t('aboutUsPage.coreValues.aiTechTitle', { defaultValue: 'Tiên Phong Công Nghệ AI' }),
      desc: t('aboutUsPage.coreValues.aiTechDesc', { defaultValue: 'Ứng dụng mô hình Voice AI và thuật toán phân tích năng lực khách quan, xóa bỏ rào cản thời gian và định kiến tuyển dụng.' }),
      icon: PsychologyOutlinedIcon,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#DBEAFE',
    },
    {
      title: t('aboutUsPage.coreValues.speedCostTitle', { defaultValue: 'Tối Ưu Tốc Độ & Chi Phí' }),
      desc: t('aboutUsPage.coreValues.speedCostDesc', { defaultValue: 'Cắt giảm đến 80% thời gian sơ loại hồ sơ và sàng lọc ứng viên, tối ưu hóa ngân sách nhân sự cho mọi quy mô doanh nghiệp.' }),
      icon: SpeedIcon,
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
    },
    {
      title: t('aboutUsPage.coreValues.fourIndustriesTitle', { defaultValue: 'Chuyên Sâu 4 Khối Ngành' }),
      desc: t('aboutUsPage.coreValues.fourIndustriesDesc', { defaultValue: 'Thấu hiểu đặc thù tiêu chuẩn nghề nghiệp của Xây dựng, Bất động sản, Thiết kế kiến trúc và Kỹ thuật Cơ điện.' }),
      icon: HubOutlinedIcon,
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
    },
    {
      title: t('aboutUsPage.coreValues.securityTitle', { defaultValue: 'Bảo Mật Chuẩn Doanh Nghiệp' }),
      desc: t('aboutUsPage.coreValues.securityDesc', { defaultValue: 'Hệ thống bảo vệ dữ liệu hồ sơ và thông tin nhân sự tuân thủ nghiêm ngặt các tiêu chuẩn mã hóa an toàn thông tin.' }),
      icon: SecurityOutlinedIcon,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
    },
  ];

  // 4 Bước Chuyển đổi số tuyển dụng & HRM
  const digitalSteps = [
    {
      step: '01',
      title: t('aboutUsPage.steps.step1Title', { defaultValue: 'Đăng Tin & Thu Hút Ứng Viên' }),
      desc: t('aboutUsPage.steps.step1Desc', { defaultValue: 'Doanh nghiệp đăng tin tuyển dụng thông minh, tối ưu SEO việc làm và tiếp cận hàng ngàn ứng viên đúng chuyên môn.' }),
      icon: PostAddOutlinedIcon,
    },
    {
      step: '02',
      title: t('aboutUsPage.steps.step2Title', { defaultValue: 'AI Sàng Lọc & Phỏng Vấn Voice' }),
      desc: t('aboutUsPage.steps.step2Desc', { defaultValue: 'AILA AI tự động phân tích CV, tính toán Match Score và thực hiện phỏng vấn sơ tuyển bằng giọng nói tự nhiên 24/7.' }),
      icon: SmartToyOutlinedIcon,
    },
    {
      step: '03',
      title: t('aboutUsPage.steps.step3Title', { defaultValue: 'Đánh Giá Năng Lực Chuẩn STAR' }),
      desc: t('aboutUsPage.steps.step3Desc', { defaultValue: 'Hội đồng tuyển dụng nhận báo cáo phân tích kỹ năng, khoảng trống năng lực và video/transcript phỏng vấn để ra quyết định.' }),
      icon: AssignmentIndOutlinedIcon,
    },
    {
      step: '04',
      title: t('aboutUsPage.steps.step4Title', { defaultValue: 'Tiếp Nhận & Quản Trị HRM' }),
      desc: t('aboutUsPage.steps.step4Desc', { defaultValue: 'Đồng bộ hồ sơ trúng tuyển vào hệ thống InfoHR HRM: ký hợp đồng số, cập nhật sơ đồ tổ chức và quản lý nhân sự liền mạch.' }),
      icon: BadgeOutlinedIcon,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: { xs: 8, md: 12 } }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 1: HERO BANNER & HỆ SINH THÁI 3D SHOWCASE */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          pt: { xs: 5, sm: 7, md: 9 },
          pb: { xs: 6, md: 10 },
          background: 'radial-gradient(ellipse at top, #EFF6FF 0%, #F8FAFC 70%)',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          {/* Header Texts */}
          <Stack spacing={2.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: '#2563EB !important', fontSize: 18 }} />}
              label={t('aboutUsPage.heroBadge', { defaultValue: 'HỆ SINH THÁI TUYỂN DỤNG & QUẢN TRỊ NHÂN SỰ INFOHR' })}
              sx={{
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                px: 1.5,
                py: 0.75,
                border: '1px solid #BFDBFE',
                borderRadius: '100px',
                maxWidth: '92vw',
                '& .MuiChip-label': {
                  whiteSpace: 'normal',
                  textAlign: 'center',
                },
              }}
            />

            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.3rem' },
                lineHeight: { xs: 1.25, md: 1.2 },
                maxWidth: 950,
                letterSpacing: '-0.02em',
              }}
            >
              Kiến Tạo Tương Lai Tuyển Dụng & Quản Trị Nhân Sự Việt Nam
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                maxWidth: 860,
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                lineHeight: 1.7,
              }}
            >
              InfoHR mang đến nền tảng toàn diện kết nối tài năng, quản trị hồ sơ và số hóa quy trình nhân sự doanh nghiệp - hỗ trợ chuyên sâu <strong>4 khối ngành kinh tế trọng điểm</strong>. Đồng thời tích hợp trực tiếp với nền tảng phỏng vấn AI thông minh <strong>AILA AI</strong>.
            </Typography>

            {/* 4 Nhóm ngành Trọng Điểm Chips */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              gap={1}
              sx={{ pt: 1, pb: 2 }}
            >
              {focusIndustries.map((item) => {
                const Icon = item.icon;
                return (
                  <Chip
                    key={item.label}
                    icon={<Icon fontSize="small" sx={{ color: '#2563EB !important' }} />}
                    label={item.label}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#1E293B',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: '1px solid #CBD5E1',
                      py: 2,
                      px: 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      '&:hover': {
                        bgcolor: '#EFF6FF',
                        borderColor: '#93C5FD',
                        color: '#1D4ED8',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Stack>

            {/* Action CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}
            >
              <Button
                variant="contained"
                component={Link}
                href="/jobs"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Khám Phá Việc Làm InfoHR
              </Button>

              <Button
                variant="outlined"
                component="a"
                href="https://aila.infohr.vn/"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  bgcolor: '#FFFFFF',
                  '&:hover': {
                    bgcolor: '#FEF2F2',
                    borderColor: '#B91C1C',
                    color: '#B91C1C',
                  },
                }}
              >
                Trải Nghiệm AILA AI Platform
              </Button>
            </Stack>
          </Stack>

          {/* 3D Ecosystem Showcase Hero Board */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: '16px', md: '24px' },
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
              mt: { xs: 3, md: 5 },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 260, sm: 400, md: 540 },
              }}
            >
              <Image
                src="/images/about/about_hero_ecosystem.jpg"
                alt="Mô hình 3D Hệ sinh thái Tuyển dụng & Quản trị Nhân sự InfoHR"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                style={{ objectFit: 'cover' }}
              />

              {/* Floating Badge on Top Left */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 12, md: 20 },
                  left: { xs: 12, md: 20 },
                  bgcolor: 'rgba(15, 23, 42, 0.78)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  borderRadius: '100px',
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 0.6, md: 0.8 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <AutoAwesomeIcon sx={{ color: '#60A5FA', fontSize: { xs: 16, md: 18 } }} />
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.85rem' }, color: '#FFFFFF' }}>
                  Hệ Sinh Thái Tuyển Dụng & HRM Toàn Diện
                </Typography>
              </Box>
            </Box>

            {/* 4 Mini Feature Anchors underneath Hero Image */}
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 40, height: 40, borderRadius: '10px' }}>
                      <PeopleAltOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        Cổng Tuyển Dụng
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Kết nối 1.200+ doanh nghiệp
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 40, height: 40, borderRadius: '10px' }}>
                      <BadgeOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        Quản Trị InfoHR HRM
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Hồ sơ, hợp đồng & chấm công
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#FEF2F2', color: '#DC2626', width: 40, height: 40, borderRadius: '10px' }}>
                      <SmartToyOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        AILA AI Phỏng Vấn
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Voice & Video AI tự động 24/7
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#FEF3C7', color: '#D97706', width: 40, height: 40, borderRadius: '10px' }}>
                      <HubOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        4 Ngành Trọng Điểm
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Xây dựng, BĐS, Thiết kế, MEP
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 2: THƯỚC ĐO QUY MÔ & SỐ LIỆU BẢO CHỨNG */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 8 }, mb: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {stats.map((stat, idx) => (
            <Grid key={idx} size={{ xs: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  textAlign: 'center',
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 25px rgba(37, 99, 235, 0.08)',
                    borderColor: '#BFDBFE',
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: idx % 2 === 0 ? '#2563EB' : '#DC2626',
                    fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.6rem' },
                    lineHeight: 1.1,
                    mb: 0.75,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {stat.num}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25 }}>
                  {stat.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 3: HAI TRỤ CỘT CHIẾN LƯỢC (TÍCH HỢP ẢNH 3D ĐỘC QUYỀN) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mb: { xs: 7, md: 11 } }}>
        <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Chip
            label="HAI TRỤ CỘT CÔNG NGHỆ"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: '1px solid #DBEAFE',
              borderRadius: '100px',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
            Giải Pháp Toàn Diện: Tuyển Dụng & AI Phỏng Vấn
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 750, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Sự kết hợp đồng bộ giữa nền tảng tuyển dụng chuyên sâu InfoHR và công nghệ trí tuệ nhân tạo đột phá AILA AI.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* TRỤ CỘT 1: INFOHR & QUẢN TRỊ HRM */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                border: '1.5px solid #2563EB',
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 35px -5px rgba(37, 99, 235, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 20px 45px -5px rgba(37, 99, 235, 0.16)',
                },
              }}
            >
              {/* Image Frame */}
              <Box sx={{ position: 'relative', width: '100%', height: { xs: 200, sm: 260 } }}>
                <Image
                  src="/images/about/about_pillar_infohr.jpg"
                  alt="Trụ cột InfoHR Tuyển dụng & Quản trị HRM"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{ objectFit: 'cover' }}
                />
                <Chip
                  label="INFOHR PLATFORM"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(37, 99, 235, 0.9)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '100px',
                  }}
                />
              </Box>

              {/* Content */}
              <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 46, height: 46, borderRadius: '12px' }}>
                    <BusinessOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.4rem' } }}>
                      1. InfoHR & Phân Hệ HRM
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Nền Tảng Tuyển Dụng & Vận Hành Doanh Nghiệp
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Tập trung phát triển giải pháp số hóa toàn diện quy trình nhân sự: Cổng đăng tin tuyển dụng thông minh, kho dữ liệu ứng viên 4 khối ngành trọng điểm và bộ máy quản trị nhân sự HRM tinh gọn.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 'auto', pt: 1 }}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Cổng tuyển dụng & Tìm kiếm hồ sơ ứng viên chuẩn hóa
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Phân hệ HRM: Quản lý nhân viên, sơ đồ tổ chức & hợp đồng số
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Đồng bộ dữ liệu chấm công và quy trình tiếp nhận onboarding
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  component={Link}
                  href="/jobs"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 2,
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: '12px',
                    py: 1.4,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': { backgroundColor: '#1D4ED8' },
                  }}
                >
                  Khám Phá Việc Làm & Doanh Nghiệp InfoHR
                </Button>
              </Stack>
            </Card>
          </Grid>

          {/* TRỤ CỘT 2: AILA AI PHỎNG VẤN THÔNG MINH */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                border: '1.5px solid #DC2626',
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 35px -5px rgba(220, 38, 38, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 20px 45px -5px rgba(220, 38, 38, 0.16)',
                },
              }}
            >
              {/* Image Frame */}
              <Box sx={{ position: 'relative', width: '100%', height: { xs: 200, sm: 260 } }}>
                <Image
                  src="/images/about/about_pillar_aila.jpg"
                  alt="Trụ cột AILA AI Phỏng vấn tự động & Đánh giá năng lực"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{ objectFit: 'cover' }}
                />
                <Chip
                  label="AILA AI PLATFORM"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(220, 38, 38, 0.9)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '100px',
                  }}
                />
              </Box>

              {/* Content */}
              <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FEF2F2', color: '#DC2626', width: 46, height: 46, borderRadius: '12px' }}>
                    <SmartToyOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.4rem' } }}>
                      2. AILA AI - Phỏng Vấn Thông Minh
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Nền Tảng Phỏng Vấn AI Toàn Diện (aila.infohr.vn)
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Chuyên biệt cho phỏng vấn sơ loại tự động bằng AI: Voice AI đa ngôn ngữ với giọng nói tự nhiên, phân tích biểu cảm video, thuật toán Match Score % và báo cáo Skill Gap Analysis chuẩn STAR.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 'auto', pt: 1 }}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#DC2626', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Phỏng vấn Voice & Video AI tự động không giới hạn 24/7
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#DC2626', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Thuật toán AI Match Score & Xuất báo cáo năng lực khách quan
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#DC2626', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Trải nghiệm trực tiếp tại Cổng thông tin aila.infohr.vn
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  component="a"
                  href="https://aila.infohr.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon />}
                  sx={{
                    mt: 2,
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: '12px',
                    py: 1.4,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                    '&:hover': { backgroundColor: '#B91C1C' },
                  }}
                >
                  Mở Trang Platform AILA AI (aila.infohr.vn)
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 4: GIÁ TRỊ CỐT LÕI & SỨ MỆNH (BENTO GRID 4 THẺ) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', mb: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
            <Chip
              label="GIÁ TRỊ CỐT LÕI"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: '1px solid #CBD5E1',
                borderRadius: '100px',
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
              Cam Kết Vững Bền Cùng Doanh Nghiệp & Ứng Viên
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 750, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Những nguyên tắc nền tảng định hình sự phát triển và giá trị phụng sự của hệ sinh thái InfoHR.
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {coreValues.map((item) => {
              const IconComp = item.icon;
              return (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 3.5 },
                      height: '100%',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 25px rgba(0,0,0,0.06)',
                        borderColor: item.color,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: item.bgColor,
                        color: item.color,
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        mb: 2.5,
                        border: `1px solid ${item.borderColor}`,
                      }}
                    >
                      <IconComp fontSize="medium" />
                    </Avatar>

                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.1rem', mb: 1.5 }}>
                      {item.title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.65, fontSize: '0.9rem' }}>
                      {item.desc}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 5: QUY TRÌNH CHUYỂN ĐỔI SỐ TUYỂN DỤNG & HRM (4 BƯỚC) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
        <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Chip
            label="QUY TRÌNH VẬN HÀNH"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.8rem',
              border: '1px solid #DBEAFE',
              borderRadius: '100px',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
            Quy Trình Tuyển Dụng & Quản Trị Nhân Sự Liền Mạch
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 750, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Khép kín từ khâu tiếp cận ứng viên, phỏng vấn AI thông minh đến tiếp nhận và quản trị hợp đồng số.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {digitalSteps.map((stepItem) => {
            const StepIcon = stepItem.icon;
            return (
              <Grid key={stepItem.step} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    height: '100%',
                    borderRadius: '20px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(37, 99, 235, 0.08)',
                      borderColor: '#BFDBFE',
                    },
                  }}
                >
                  {/* Step Number Badge */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 16,
                      fontWeight: 900,
                      fontSize: '2.5rem',
                      lineHeight: 1,
                      color: '#F1F5F9',
                      userSelect: 'none',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {stepItem.step}
                  </Typography>

                  <Avatar
                    sx={{
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      mb: 2,
                    }}
                  >
                    <StepIcon />
                  </Avatar>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem', mb: 1.25 }}>
                    {stepItem.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.65, fontSize: '0.9rem' }}>
                    {stepItem.desc}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 6: BANNER CTA ĐÁY TRANG VỚI HÌNH ẢNH 3D NGHỆ THUẬT */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: '20px', md: '28px' },
            overflow: 'hidden',
            minHeight: { xs: 440, md: 380 },
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 20px 45px -10px rgba(37, 99, 235, 0.25)',
          }}
        >
          {/* Background Image */}
          <Image
            src="/images/about/about_cta_banner.jpg"
            alt="Đội ngũ nhân sự chuyên nghiệp cùng hệ thống InfoHR"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            style={{ objectFit: 'cover', objectPosition: 'center right' }}
          />

          {/* Gradient Overlay: Deep rich royal blue over text area */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: {
                xs: 'linear-gradient(180deg, rgba(30, 58, 138, 0.92) 0%, rgba(37, 99, 235, 0.88) 100%)',
                md: 'linear-gradient(90deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 58, 138, 0.9) 45%, rgba(37, 99, 235, 0.35) 80%, rgba(37, 99, 235, 0) 100%)',
              },
            }}
          />

          {/* CTA Content Container */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              p: { xs: 3.5, sm: 5, md: 6 },
              maxWidth: { xs: '100%', md: 660 },
            }}
          >
            <Chip
              label="✨ BẮT ĐẦU CHUYỂN ĐỔI SỐ CÙNG INFOHR"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                border: '1px solid rgba(255, 255, 255, 0.35)',
                mb: 2,
                borderRadius: '100px',
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.4rem' },
                lineHeight: 1.25,
                mb: 1.5,
              }}
            >
              Sẵn Sàng Bứt Phá Quy Trình Tuyển Dụng & Quản Trị Nhân Sự?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#E0E7FF',
                fontSize: { xs: '0.9rem', sm: '1.05rem' },
                lineHeight: 1.65,
                mb: 3.5,
              }}
            >
              Tham gia cùng hơn 1.200+ doanh nghiệp hàng đầu và 50.000+ ứng viên đang tối ưu hóa hiệu quả nhân sự mỗi ngày trên nền tảng InfoHR & AILA AI.
            </Typography>

            {/* Dual CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 3.5 }}
            >
              <Button
                variant="contained"
                component={Link}
                href="/jobs"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#1D4ED8',
                  fontWeight: 800,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#EFF6FF',
                    color: '#1E40AF',
                  },
                }}
              >
                Tìm Việc Làm Ngay
              </Button>

              <Button
                variant="outlined"
                component={Link}
                href="/employer/job-posts/create"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                Đăng Tin Tuyển Dụng
              </Button>
            </Stack>

            {/* 3 Trust Signals */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedIcon sx={{ color: '#93C5FD', fontSize: 18 }} />
                <Typography sx={{ color: '#E0E7FF', fontSize: '0.85rem', fontWeight: 600 }}>
                  Miễn phí khởi tạo
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityOutlinedIcon sx={{ color: '#93C5FD', fontSize: 18 }} />
                <Typography sx={{ color: '#E0E7FF', fontSize: '0.85rem', fontWeight: 600 }}>
                  Bảo mật chuẩn Quốc tế
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <HandshakeOutlinedIcon sx={{ color: '#93C5FD', fontSize: 18 }} />
                <Typography sx={{ color: '#E0E7FF', fontSize: '0.85rem', fontWeight: 600 }}>
                  Hỗ trợ chuyên môn 24/7
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
