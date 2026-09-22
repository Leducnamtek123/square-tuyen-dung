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
import { useTranslation } from 'react-i18next';

// Icons
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from '@/utils/gsapHelpers';

import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';

registerGsapPlugins();

export default function IntroducePage() {
  const { t, i18n } = useTranslation('employer');
  TabTitle(t('introduce.tabTitle', { appName: APP_NAME, defaultValue: `Giới thiệu & Dịch vụ Tuyển dụng - ${APP_NAME}` }));

  // 4 Nhóm ngành trọng điểm
  const focusIndustries = [
    { label: t('introduce.industries.construction', { defaultValue: 'Xây dựng' }), icon: EngineeringIcon },
    { label: t('introduce.industries.realEstate', { defaultValue: 'Bất động sản' }), icon: ApartmentIcon },
    { label: t('introduce.industries.architecture', { defaultValue: 'Kiến trúc / Thiết kế nội thất' }), icon: ArchitectureIcon },
    { label: t('introduce.industries.mep', { defaultValue: 'Kỹ thuật & Cơ điện (MEP)' }), icon: BoltIcon },
  ];

  // 4 Thước đo hiệu quả tuyển dụng
  const stats = [
    { num: '80%', label: t('introduce.stats.screeningTime', { defaultValue: 'Rút ngắn thời gian sơ tuyển' }), desc: t('introduce.stats.screeningTimeDesc', { defaultValue: 'Sàng lọc CV & phỏng vấn AI' }) },
    { num: '3.5x', label: t('introduce.stats.hiringSuccess', { defaultValue: 'Tăng tỷ lệ tuyển thành công' }), desc: t('introduce.stats.hiringSuccessDesc', { defaultValue: 'So khớp đúng năng lực thực tế' }) },
    { num: '95%', label: t('introduce.stats.matchAccuracy', { defaultValue: 'Độ chính xác AI Match Score' }), desc: t('introduce.stats.matchAccuracyDesc', { defaultValue: 'Chuẩn hóa tiêu chí đánh giá' }) },
    { num: '1.200+', label: t('introduce.stats.trustedCompanies', { defaultValue: 'Doanh nghiệp tin cậy' }), desc: t('introduce.stats.trustedCompaniesDesc', { defaultValue: 'Tập đoàn & công ty đồng hành' }) },
  ];

  // 4 Bento Cards - Vì sao chọn InfoHR
  const valueProps = [
    {
      title: t('introduce.valueProps.poolTitle', { defaultValue: 'Kho Ứng Viên 4 Khối Ngành Trọng Điểm' }),
      desc: t('introduce.valueProps.poolDesc', { defaultValue: 'Tập trung chuyên sâu dữ liệu ứng viên Xây dựng, Bất động sản, Thiết kế kiến trúc và Kỹ thuật MEP với hồ sơ xác thực chuẩn mực.' }),
      icon: HubOutlinedIcon,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#DBEAFE',
    },
    {
      title: t('introduce.valueProps.aiMatchingTitle', { defaultValue: 'AI So Khớp & Phỏng Vấn Tự Động' }),
      desc: t('introduce.valueProps.aiMatchingDesc', { defaultValue: 'AILA AI tự động phân tích CV, tính điểm Match Score và thực hiện phỏng vấn sơ loại Voice AI 24/7 loại bỏ hoàn toàn định kiến.' }),
      icon: PsychologyOutlinedIcon,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
    },
    {
      title: t('introduce.valueProps.pipelineTitle', { defaultValue: 'Quản Lý Đường Ống Tuyển Dụng CRM' }),
      desc: t('introduce.valueProps.pipelineDesc', { defaultValue: 'Theo dõi toàn bộ vòng đời hồ sơ ứng viên từ tiếp nhận, xếp lịch phỏng vấn đến tiếp nhận onboarding trên một màn hình trực quan.' }),
      icon: TrackChangesOutlinedIcon,
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
    },
    {
      title: t('introduce.valueProps.guaranteeTitle', { defaultValue: 'Đồng Hành & Bảo Hành Tuyển Dụng' }),
      desc: t('introduce.valueProps.guaranteeDesc', { defaultValue: 'Đội ngũ chuyên viên tư vấn hỗ trợ 24/7, tối ưu tin đăng việc làm và chính sách đồng hành bảo đảm sự thành công của doanh nghiệp.' }),
      icon: VerifiedOutlinedIcon,
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
    },
  ];

  // 4 Bước Quy trình tuyển dụng
  const steps = [
    {
      step: '01',
      title: t('introduce.steps.step1Title', { defaultValue: 'Khởi Tạo & Xác Thực Doanh Nghiệp' }),
      desc: t('introduce.steps.step1Desc', { defaultValue: 'Đăng ký tài khoản nhà tuyển dụng nhanh chóng và nhận huy hiệu Doanh nghiệp uy tín đã xác thực.' }),
      icon: BadgeOutlinedIcon,
    },
    {
      step: '02',
      title: t('introduce.steps.step2Title', { defaultValue: 'Đăng Tin Tuyển Dụng Thông Minh' }),
      desc: t('introduce.steps.step2Desc', { defaultValue: 'Tạo tin tuyển dụng chuẩn SEO nhanh chóng với gợi ý JD chuyên nghiệp từ AI.' }),
      icon: PostAddOutlinedIcon,
    },
    {
      step: '03',
      title: t('introduce.steps.step3Title', { defaultValue: 'AI Sàng Lọc & Phỏng Vấn Tự Động' }),
      desc: t('introduce.steps.step3Desc', { defaultValue: 'Tự động phân loại hồ sơ, chấm điểm Match Score và xếp lịch phỏng vấn AI tức thì.' }),
      icon: SmartToyOutlinedIcon,
    },
    {
      step: '04',
      title: t('introduce.steps.step4Title', { defaultValue: 'Tiếp Nhận & Tối Ưu Nhân Sự' }),
      desc: t('introduce.steps.step4Desc', { defaultValue: 'Duyệt ứng viên trúng tuyển, ký hợp đồng và quản lý toàn diện quy trình Onboarding.' }),
      icon: AssignmentIndOutlinedIcon,
    },
  ];

  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // -- Desktop Breakpoint (≥769px) ---------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        heroTl
          .fromTo(
            '.gsap-hero-badge',
            { y: -15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: "all" }
          )
          .fromTo(
            '.gsap-hero-title',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, clearProps: "all" },
            '-=0.3'
          )
          .fromTo(
            '.gsap-hero-desc',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: "all" },
            '-=0.4'
          )
          .fromTo(
            '.gsap-hero-actions',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: "all" },
            '-=0.3'
          );

        gsap.fromTo(
          '.gsap-highlight-card',
          { y: 35, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-highlights-grid',
              start: 'top 85%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.12,
            ease: 'power2.out',
            clearProps: "all",
          }
        );

        gsap.fromTo(
          '.gsap-services-box',
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-services-box',
              start: 'top 85%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            clearProps: "all",
          }
        );

        gsap.fromTo(
          '.gsap-service-card',
          { y: 25, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-services-grid',
              start: 'top 85%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: "all",
          }
        );

        gsap.fromTo(
          '.gsap-step-card',
          { y: 25, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-steps-grid',
              start: 'top 85%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.12,
            ease: 'power2.out',
            clearProps: "all",
          }
        );
      });

      // -- Mobile Breakpoint (≤768px) ----------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        heroTl
          .fromTo(
            '.gsap-hero-badge',
            { y: -10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, clearProps: "all" }
          )
          .fromTo(
            '.gsap-hero-title',
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: "all" },
            '-=0.2'
          )
          .fromTo(
            '.gsap-hero-desc',
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: "all" },
            '-=0.25'
          )
          .fromTo(
            '.gsap-hero-actions',
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, clearProps: "all" },
            '-=0.2'
          );

        gsap.fromTo(
          '.gsap-highlight-card',
          { y: 16, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-highlights-grid',
              start: 'top 92%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: "all",
          }
        );

        gsap.fromTo(
          '.gsap-services-box',
          { y: 14, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-services-box',
              start: 'top 92%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: 'power2.out',
            clearProps: "all",
          }
        );

        gsap.fromTo(
          '.gsap-service-card',
          { y: 14, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-services-grid',
              start: 'top 92%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: "all",
          }
        );

        gsap.fromTo(
          '.gsap-step-card',
          { y: 14, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.gsap-steps-grid',
              start: 'top 92%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: "all",
          }
        );
      });

      // -- Reduced Motion -----------------------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        gsap.set(
          '.gsap-hero-badge, .gsap-hero-title, .gsap-hero-desc, .gsap-hero-actions, .gsap-highlight-card, .gsap-services-box, .gsap-service-card, .gsap-step-card',
          { opacity: 1, y: 0, clearProps: "all" }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <Box ref={containerRef} sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: { xs: 8, md: 12 } }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 1: HERO BANNER & RECRUITER COMMAND CENTER 3D */}
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
              icon={<BoltIcon sx={{ color: '#2563EB !important', fontSize: 18 }} />}
              label="GIẢI PHÁP TUYỂN DỤNG & AI MATCHING DOANH NGHIỆP"
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
              Bứt Phá Hiệu Quả Tuyển Dụng Nhân Tài Cùng InfoHR
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                maxWidth: 720,
                mx: 'auto',
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                lineHeight: 1.7,
              }}
            >
              Hệ sinh thái tuyển dụng thông minh giúp doanh nghiệp xây dựng thương hiệu tuyển dụng, tiếp cận kho hồ sơ ứng viên chất lượng cao trong <strong>4 ngành nghề trọng điểm</strong> và tự động hóa phỏng vấn sơ tuyển bằng công nghệ <strong>AILA AI</strong>.
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
                href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
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
                Đăng Ký Tuyển Dụng Ngay
              </Button>

              <Button
                variant="outlined"
                component={Link}
                href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: '#2563EB',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  bgcolor: '#FFFFFF',
                  '&:hover': {
                    bgcolor: '#EFF6FF',
                    borderColor: '#1D4ED8',
                    color: '#1D4ED8',
                  },
                }}
              >
                Xem Bảng Giá Dịch Vụ
              </Button>
            </Stack>
          </Stack>

          {/* 3D Recruiter Command Center Showcase Board */}
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
                src="/images/employer/employer_hero_showcase.webp"
                alt="Trung tâm điều hành tuyển dụng số hóa 3D InfoHR"
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
                  Trung Tâm Điều Hành Tuyển Dụng Doanh Nghiệp
                </Typography>
              </Box>
            </Box>

            {/* 4 Mini Feature Anchors underneath Hero Image */}
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 40, height: 40, borderRadius: '10px' }}>
                      <CampaignOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        Đăng Tuyển Đa Kênh
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Tối ưu hiển thị Top 1 ngành nghề
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 40, height: 40, borderRadius: '10px' }}>
                      <TrackChangesOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        AI Match Score %
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        So khớp tự động theo tiêu chuẩn
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
                        AILA Voice AI
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Phỏng vấn sơ tuyển tự động 24/7
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#FEF3C7', color: '#D97706', width: 40, height: 40, borderRadius: '10px' }}>
                      <VerifiedOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                        Xác Thực Doanh Nghiệp
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Tăng 300% độ uy tín tuyển dụng
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
      {/* PHÂN TẦNG 2: THƯỚC ĐO HIỆU QUẢ TUYỂN DỤNG (KEY METRICS) */}
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
      {/* PHÂN TẦNG 3: HAI TRỤ CỘT DỊCH VỤ TRỌNG TÂM (TÍCH HỢP ẢNH 3D) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mb: { xs: 7, md: 11 } }}>
        <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Chip
            label="DỊCH VỤ TRỌNG TÂM"
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
            Bộ Giải Pháp Tuyển Dụng Doanh Nghiệp Toàn Diện
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 750, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Kết hợp cổng đăng tuyển trực tiếp và trợ lý phỏng vấn AI thông minh giúp tối đa hóa tỷ lệ tuyển dụng thành công.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* TRỤ CỘT 1: CỔNG ĐĂNG TIN & SÀNG LỌC ỨNG VIÊN */}
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
              <Box sx={{ position: 'relative', width: '100%', height: { xs: 200, sm: 260 } }}>
                <Image
                  src="/images/employer/employer_service_portal.webp"
                  alt="Cổng đăng tin tuyển dụng & tìm kiếm ứng viên InfoHR"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{ objectFit: 'cover' }}
                />
                <Chip
                  label="INFOHR RECRUITMENT SUITE"
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

              <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 46, height: 46, borderRadius: '12px' }}>
                    <CampaignOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.4rem' } }}>
                      1. Đăng Tuyển & Tìm Kiếm Ứng Viên
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Cổng Đăng Tin Chuẩn Hóa & Bộ Lọc Nâng Cao
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Xây dựng tin tuyển dụng chuẩn mực, tối ưu SEO để tiếp cận hàng ngàn ứng viên đúng chuyên môn trong 4 ngành trọng điểm. Chủ động tìm kiếm và liên hệ ứng viên từ kho CV xác thực.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 'auto', pt: 1 }}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Đăng tin việc làm hiển thị ưu tiên Top 1 chuyên mục
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Lọc ứng viên thông minh theo kỹ năng, kinh nghiệm & địa bàn
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#16A34A', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Hồ sơ ứng viên được xác thực giấy phép và bằng cấp chuyên môn
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  variant="contained"
                  component={Link}
                  href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
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
                  Xem Bảng Giá Gói Dịch Vụ Đăng Tin
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
              <Box sx={{ position: 'relative', width: '100%', height: { xs: 200, sm: 260 } }}>
                <Image
                  src="/images/employer/employer_service_aila.webp"
                  alt="AILA AI - Phỏng vấn thông minh & Đánh giá năng lực tự động"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{ objectFit: 'cover' }}
                />
                <Chip
                  label="AILA AI RECRUITING SUITE"
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

              <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4 }, flexGrow: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: '#FEF2F2', color: '#DC2626', width: 46, height: 46, borderRadius: '12px' }}>
                    <SmartToyOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.4rem' } }}>
                      2. AILA AI - Phỏng Vấn Tự Động
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Voice & Video AI Phỏng Vấn Tự Động 24/7
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Tự động hóa hoàn toàn quy trình phỏng vấn sơ loại: AI đặt câu hỏi chuyên môn bằng giọng nói tự nhiên, phân tích biểu cảm video và xuất báo cáo Skill Gap Analysis đa chiều.
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
                      Thuật toán Match Score & Xuất báo cáo năng lực khách quan
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <CheckCircleOutlinedIcon sx={{ color: '#DC2626', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                      Cắt giảm 90% thời gian gọi điện sơ loại thủ công của HR
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
                  Trải Nghiệm Tại aila.infohr.vn
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHÂN TẦNG 4: VÌ SAO DOANH NGHIỆP CHỌN INFOHR? (BENTO GRID) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', mb: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
            <Chip
              label="LỢI THẾ VƯỢT TRỘI"
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
              Vì Sao Doanh Nghiệp Chọn InfoHR?
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 750, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              Những giá trị thực tiễn giúp doanh nghiệp tiết kiệm chi phí và xây dựng đội ngũ nhân sự vững mạnh.
            </Typography>
          </Stack>

          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {valueProps.map((item) => {
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
      {/* PHÂN TẦNG 5: QUY TRÌNH TUYỂN DỤNG 4 BƯỚC TINH GỌN */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
        <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Chip
            label="QUY TRÌNH TUYỂN DỤNG"
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
            Quy Trình Tuyển Dụng Đơn Giản & Hiệu Quả
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 750, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Khép kín từ khâu đăng tin, tự động hóa phỏng vấn AI đến chốt ứng viên phù hợp nhất.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {steps.map((stepItem) => {
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
      {/* PHÂN TẦNG 6: BANNER CTA ĐÁY TRANG 3D CHUYÊN NGHIỆP */}
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
            src="/images/employer/employer_cta_banner.webp"
            alt="Lãnh đạo và chuyên gia nhân sự hợp tác cùng InfoHR"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            style={{ objectFit: 'cover', objectPosition: 'center right' }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: {
                xs: 'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 58, 138, 0.9) 100%)',
                md: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.9) 45%, rgba(37, 99, 235, 0.35) 80%, rgba(37, 99, 235, 0) 100%)',
              },
            }}
          />

          {/* CTA Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              p: { xs: 3.5, sm: 5, md: 6 },
              maxWidth: { xs: '100%', md: 660 },
            }}
          >
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '15px !important', color: '#FFFFFF !important' }} />}
              label="BẮT ĐẦU TUYỂN DỤNG CÙNG INFOHR"
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
              Sẵn Sàng Tiếp Cận Nhân Tài Đột Phá Cho Doanh Nghiệp?
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
              Gia nhập cùng hơn 1.200+ doanh nghiệp hàng đầu đang xây dựng đội ngũ nhân sự tinh nhuệ trên nền tảng InfoHR & AILA AI.
            </Typography>

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 3.5 }}
            >
              <Button
                variant="contained"
                component={Link}
                href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
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
                Đăng Ký Tuyển Dụng Ngay
              </Button>

              <Button
                variant="outlined"
                component={Link}
                href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
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
                Xem Bảng Giá Dịch Vụ
              </Button>
            </Stack>

            {/* 3 Trust Signals */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              sx={{ pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedOutlinedIcon sx={{ color: '#93C5FD', fontSize: 18 }} />
                <Typography sx={{ color: '#E0E7FF', fontSize: '0.85rem', fontWeight: 600 }}>
                  Tặng tin đăng trải nghiệm
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
