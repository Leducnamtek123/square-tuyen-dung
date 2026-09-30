'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid2 as Grid,
  Stack,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from '@/utils/gsapHelpers';

// MUI Icons
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import PartnerLogoCarousel from '@/components/Features/PartnerLogoCarousel';
import CandidateScorecardMockup from './components/CandidateScorecardMockup';

registerGsapPlugins();

export default function EmployerHomePage() {
  const { t, i18n } = useTranslation('employer');
  TabTitle(
    t('home.tabTitle', {
      appName: APP_NAME,
      defaultValue: `Cổng Nhà Tuyển Dụng — Nền Tảng Tuyển Dụng Kỹ Thuật & Voice AI AILA | ${APP_NAME}`,
    })
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const has = (selector: string): boolean => {
        return Boolean(containerRef.current?.querySelector(selector));
      };

      const mm = gsap.matchMedia();

      // Desktop Animations
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        if (has('.gsap-hero-left') && has('.gsap-hero-right')) {
          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          heroTl
            .fromTo(
              '.gsap-hero-badge',
              { y: -15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }
            )
            .fromTo(
              '.gsap-hero-title',
              { y: 25, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' },
              '-=0.2'
            )
            .fromTo(
              '.gsap-hero-desc',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
              '-=0.3'
            )
            .fromTo(
              '.gsap-hero-actions',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
              '-=0.25'
            )
            .fromTo(
              '.gsap-hero-metrics',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
              '-=0.2'
            )
            .fromTo(
              '.gsap-hero-right',
              { x: 30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.7, clearProps: 'all' },
              '-=0.6'
            );
        }

        if (has('.gsap-contrast-card')) {
          gsap.fromTo(
            '.gsap-contrast-card',
            { y: 35, opacity: 0 },
            {
              scrollTrigger: has('.gsap-contrast-grid')
                ? {
                    trigger: '.gsap-contrast-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }

        if (has('.gsap-industry-card')) {
          gsap.fromTo(
            '.gsap-industry-card',
            { y: 30, opacity: 0 },
            {
              scrollTrigger: has('.gsap-industry-grid')
                ? {
                    trigger: '.gsap-industry-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.1,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }

        if (has('.gsap-process-step')) {
          gsap.fromTo(
            '.gsap-process-step',
            { y: 30, opacity: 0 },
            {
              scrollTrigger: has('.gsap-process-grid')
                ? {
                    trigger: '.gsap-process-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }

        if (has('.gsap-cta-banner')) {
          gsap.fromTo(
            '.gsap-cta-banner',
            { y: 25, opacity: 0 },
            {
              scrollTrigger: {
                trigger: '.gsap-cta-banner',
                start: 'top 88%',
                once: true,
              },
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power3.out',
              clearProps: 'all',
            }
          );
        }
      });

      // Mobile Animations (Subtle & Lightweight)
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        if (has('.gsap-hero-title')) {
          gsap.fromTo(
            '.gsap-hero-title',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' }
          );
        }
        if (has('.gsap-hero-right')) {
          gsap.fromTo(
            '.gsap-hero-right',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, delay: 0.2, clearProps: 'all' }
          );
        }
      });

      // Reduced Motion
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        gsap.set(
          [
            '.gsap-hero-badge',
            '.gsap-hero-title',
            '.gsap-hero-desc',
            '.gsap-hero-actions',
            '.gsap-hero-metrics',
            '.gsap-hero-right',
            '.gsap-contrast-card',
            '.gsap-industry-card',
            '.gsap-process-step',
            '.gsap-cta-banner',
          ],
          { opacity: 1, y: 0, x: 0, clearProps: 'all' }
        );
      });
    },
    { scope: containerRef }
  );

  // Link đích
  const registerUrl = localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language);
  const pricingUrl = localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language);

  // Tab chuyển đổi Hero preview giữa Scorecard và 3D BIM Complex
  const [heroTab, setHeroTab] = useState<'scorecard' | 'bim'>('scorecard');

  // 4 Khối ngành kỹ thuật trọng điểm kèm visual hình ảnh chuyên ngành
  const industries = [
    {
      id: 'construction',
      title: 'Khối Xây Dựng & Hạ Tầng',
      image: '/images/employer/industry_construction.jpg',
      tag: 'Thi Công & Hiện Trường',
      icon: EngineeringRoundedIcon,
      accentColor: '#2563EB',
      roles: [
        'Chỉ huy trưởng công trình',
        'Kỹ sư giám sát hiện trường',
        'Kỹ sư QS bóc tách khối lượng & dự toán',
        'Kỹ sư Quản lý An toàn HSE',
      ],
      standards: 'Chứng chỉ Giám sát/Thi công Hạng I-II • Hồ sơ nghiệm thu & hoàn công • TCVN, FIDIC',
    },
    {
      id: 'real-estate',
      title: 'Khối Bất Động Sản & Dự Án',
      image: '/images/employer/industry_realestate.jpg',
      tag: 'Phát Triển & Đầu Tư',
      icon: ApartmentRoundedIcon,
      accentColor: '#1E3A8A',
      roles: [
        'Giám đốc Quản lý dự án (Project Manager)',
        'Chuyên viên Phát triển quỹ đất & Pháp lý 1/500',
        'Chuyên viên Thẩm định & Phân tích đầu tư BĐS',
        'Trưởng phòng Kinh doanh BĐS công nghiệp & cao cấp',
      ],
      standards: 'Kinh nghiệm pháp lý dự án • Báo cáo nghiên cứu khả thi (FS) • Giấy phép xây dựng',
    },
    {
      id: 'architecture',
      title: 'Khối Kiến Trúc & Nội Thất',
      image: '/images/employer/industry_architecture.jpg',
      tag: 'Thiết Kế & Mô Hình BIM',
      icon: ArchitectureRoundedIcon,
      accentColor: '#0F172A',
      roles: [
        'Kiến trúc sư chủ trì hồ sơ thi công',
        'KTS Quy hoạch đô thị & cảnh quan',
        'Kỹ sư kết cấu triển khai Revit Structure / BIM',
        'Chuyên viên Diễn họa 3D Visualizer & Thiết kế nội thất',
      ],
      standards: 'Portfolio dự án đã bàn giao • Revit Architecture, BIM, SketchUp, Lumion • Am hiểu vật liệu',
    },
    {
      id: 'mep',
      title: 'Khối Kỹ Thuật & Cơ Điện (MEP)',
      image: '/images/employer/industry_mep.jpg',
      tag: 'Hệ Thống Cơ Điện & HVAC',
      icon: BoltRoundedIcon,
      accentColor: '#DC2626',
      roles: [
        'Kỹ sư Trưởng MEP công trình',
        'Kỹ sư HVAC điều hòa thông gió',
        'Kỹ sư Phòng cháy chữa cháy (PCCC)',
        'Kỹ sư Điện động lực & Trạm biến áp',
      ],
      standards: 'Chứng chỉ Giám sát Cơ điện Hạng I-II • Xử lý xung đột Clash Detection Navisworks • QCVN 06',
    },
  ];

  // 4 Nỗi đau đối chiếu trong The Contrast Grid
  const contrastPairs = [
    {
      category: 'Nguồn Hồ Sơ & Đúng Chuyên Ngành',
      traditional:
        'Tràn ngập CV trái ngành, sinh viên mới ra trường nộp rải rác. Doanh nghiệp mất hàng tuần lọc hồ sơ không đạt yêu cầu chuyên môn cơ bản.',
      infohr:
        '100% hồ sơ chuyên ngành Xây dựng, BĐS, Kiến trúc, Cơ điện MEP. Bắt buộc có thông tin dự án thực tế và chứng chỉ hành nghề được thẩm định.',
    },
    {
      category: 'Năng Lực Phỏng Vấn Sơ Loại Kỹ Thuật',
      traditional:
        'Chuyên viên HR thiếu nghiệp vụ kỹ thuật chuyên sâu, không thể kiểm tra khả năng đọc bản vẽ, quy chuẩn thi công hay xử lý xung đột Revit/Navisworks.',
      infohr:
        'Trợ lý Voice AI AILA phỏng vấn kỹ thuật 24/7 theo câu hỏi tình huống công trường chuẩn hóa, thẩm định kiến thức TCVN và tư duy xử lý sự cố.',
    },
    {
      category: 'Thời Gian Của Lãnh Đạo Dự Án',
      traditional:
        'Chỉ huy trưởng và Giám đốc Dự án mất nhiều giờ phỏng vấn trực tiếp mới phát hiện ứng viên "vẽ" hồ sơ, nói lý thuyết nhưng không biết làm hiện trường.',
      infohr:
        'Lãnh đạo nhận Candidate Scorecard chi tiết kèm file audio ghi âm trả lời tình huống thực tế của ứng viên. Duyệt chuẩn xác chỉ trong 2 phút.',
    },
    {
      category: 'Chi Phí Tuyển Dụng & Rủi Ro Dữ Liệu',
      traditional:
        'Mua gói lọc CV tốn tiền triệu nhưng gặp số điện thoại rác, ứng viên không còn nhu cầu; hoặc phải trả 1.5 - 2 tháng lương cho đơn vị Headhunter.',
      infohr:
        'Cam kết bảo lưu & hoàn điểm nếu không liên lạc được ứng viên. Tiết kiệm 70% ngân sách tuyển dụng so với Headhunter truyền thống.',
    },
  ];

  return (
    <Box
      ref={containerRef}
      component="main"
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        overflow: 'hidden',
      }}
    >
      {/* =========================================================================
          SECTION 1: HERO SPLIT 50/50
          ========================================================================= */}
      <Box
        component="section"
        aria-label="Giới thiệu giải pháp tuyển dụng chuyên ngành"
        sx={{
          pt: { xs: 4, sm: 6, md: 8 },
          pb: { xs: 6, sm: 8, md: 10 },
          bgcolor: '#FAFBFC',
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(37, 99, 235, 0.08), transparent 70%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(220, 38, 38, 0.04), transparent 60%)',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 4, lg: 5 }} alignItems="center">
            {/* Left Column: B2B Copy & CTAs */}
            <Grid size={{ xs: 12, lg: 6 }} className="gsap-hero-left">
              <Box sx={{ maxWidth: 640 }}>
                {/* Tagline Badge */}
                <Box className="gsap-hero-badge" sx={{ mb: 2 }}>
                  <Chip
                    icon={
                      <AutoAwesomeRoundedIcon
                        sx={{ fontSize: '15px !important', color: '#DC2626 !important' }}
                      />
                    }
                    label="TUYỂN DỤNG NHÂN SỰ KỸ THUẬT & CHUYÊN MÔN"
                    sx={{
                      height: 32,
                      px: 1.5,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.04em',
                      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                      color: '#1D4ED8',
                      borderRadius: '100px',
                      border: '1px solid #BFDBFE',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
                    }}
                  />
                </Box>

                {/* H1 Main Heading */}
                <Typography
                  component="h1"
                  className="gsap-hero-title"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.875rem', sm: '2.375rem', md: '2.875rem' },
                    lineHeight: 1.18,
                    letterSpacing: '-0.02em',
                    color: '#0F172A',
                    mb: 2.5,
                  }}
                >
                  Đừng để bộ phận HR mất hàng tuần sàng lọc hàng trăm CV không đúng chuyên ngành.
                </Typography>

                {/* Description */}
                <Typography
                  variant="body1"
                  className="gsap-hero-desc"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.6,
                    color: '#475569',
                    mb: 4,
                  }}
                >
                  Nền tảng tuyển dụng chuyên sâu cho 4 khối ngành{' '}
                  <strong style={{ color: '#0F172A' }}>
                    Xây dựng • Bất động sản • Kiến trúc nội thất • Kỹ thuật MEP
                  </strong>
                  . Tích hợp Trợ lý Voice AI{' '}
                  <strong style={{ color: '#DC2626' }}>AILA</strong> tự động phỏng vấn sơ loại
                  năng lực kỹ thuật và xử lý tình huống công trường trước khi chuyển tới Ban Giám
                  đốc Dự án.
                </Typography>

                {/* Action CTAs */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  className="gsap-hero-actions"
                  sx={{ mb: 4 }}
                >
                  <Button
                    component={Link}
                    href={registerUrl}
                    variant="contained"
                    size="large"
                    sx={{
                      py: 1.5,
                      pl: 3.5,
                      pr: 2,
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <span>Đăng Ký Đăng Tuyển</span>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Button>

                  <Button
                    component={Link}
                    href={pricingUrl}
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 3,
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#0F172A',
                      borderColor: '#CBD5E1',
                      bgcolor: '#FFFFFF',
                      textTransform: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#2563EB',
                        bgcolor: '#F8FAFC',
                        color: '#2563EB',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Xem Bảng Giá Dịch Vụ
                  </Button>
                </Stack>

                {/* Operational Proof Metrics */}
                <Box
                  className="gsap-hero-metrics"
                  sx={{
                    pt: 3.5,
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                          height: '100%',
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <TimerOutlinedIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', lineHeight: 1.3 }}
                            >
                              Tiết kiệm 15-20 giờ
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, fontSize: '0.75rem' }}>
                              Phỏng vấn sơ loại kỹ thuật cho mỗi vị trí
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                          height: '100%',
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              bgcolor: '#ECFDF5',
                              color: '#16A34A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', lineHeight: 1.3 }}
                            >
                              100% hồ sơ chuyên ngành
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, fontSize: '0.75rem' }}>
                              Có thông tin dự án thực tế & chứng chỉ
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                          height: '100%',
                        }}
                      >
                        <Stack direction="row" spacing={1.2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              bgcolor: '#FEF2F2',
                              color: '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <FlashOnOutlinedIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', lineHeight: 1.3 }}
                            >
                              Nhận Scorecard trong 3 phút
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, fontSize: '0.75rem' }}>
                              Ngay sau khi ứng viên hoàn thành phỏng vấn
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Interactive Hero Preview */}
            <Grid size={{ xs: 12, lg: 6 }} className="gsap-hero-right">
              <Box sx={{ width: '100%', maxWidth: 580, mx: 'auto' }}>
                {/* Preview Mode Switcher */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mb: 1.5,
                    p: 0.5,
                    bgcolor: '#F1F5F9',
                    borderRadius: '100px',
                    width: 'fit-content',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Button
                    size="small"
                    onClick={() => setHeroTab('scorecard')}
                    startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: '15px !important' }} />}
                    sx={{
                      borderRadius: '100px',
                      px: 2,
                      py: 0.5,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: heroTab === 'scorecard' ? '#FFFFFF' : 'transparent',
                      color: heroTab === 'scorecard' ? '#0F172A' : '#64748B',
                      boxShadow: heroTab === 'scorecard' ? '0 2px 6px rgba(15,23,42,0.08)' : 'none',
                      '&:hover': {
                        bgcolor: heroTab === 'scorecard' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    AILA Candidate Scorecard
                  </Button>

                  <Button
                    size="small"
                    onClick={() => setHeroTab('bim')}
                    startIcon={<ViewInArRoundedIcon sx={{ fontSize: '15px !important' }} />}
                    sx={{
                      borderRadius: '100px',
                      px: 2,
                      py: 0.5,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: heroTab === 'bim' ? '#FFFFFF' : 'transparent',
                      color: heroTab === 'bim' ? '#0F172A' : '#64748B',
                      boxShadow: heroTab === 'bim' ? '0 2px 6px rgba(15,23,42,0.08)' : 'none',
                      '&:hover': {
                        bgcolor: heroTab === 'bim' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    Mô Hình Dự Án 3D & BIM
                  </Button>
                </Stack>

                {/* Tab Content 1: Candidate Scorecard */}
                <Box sx={{ display: heroTab === 'scorecard' ? 'block' : 'none' }}>
                  <CandidateScorecardMockup />
                </Box>

                {/* Tab Content 2: 3D BIM Complex Visual Showcase */}
                {heroTab === 'bim' && (
                  <Box
                    sx={{
                      p: '5px',
                      background:
                        'linear-gradient(145deg, rgba(37,99,235,0.2) 0%, rgba(226,232,240,0.6) 45%, rgba(15,23,42,0.15) 100%)',
                      borderRadius: '20px',
                      border: '1px solid rgba(59, 130, 246, 0.28)',
                      boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        bgcolor: '#0F172A',
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/employer/hero_tech_complex.jpg"
                        alt="Mô hình tổ hợp kỹ thuật BIM 3D"
                        sx={{
                          width: '100%',
                          height: { xs: 340, sm: 420 },
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.3) 50%, transparent 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 3,
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                          <Chip
                            size="small"
                            label="BIM LOD 400"
                            sx={{
                              bgcolor: '#2563EB',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              borderRadius: '100px',
                            }}
                          />
                          <Chip
                            size="small"
                            label="Revit • Navisworks"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              borderRadius: '100px',
                              backdropFilter: 'blur(4px)',
                            }}
                          />
                          <Chip
                            size="small"
                            label="Chứng chỉ BXD"
                            sx={{
                              bgcolor: 'rgba(22,163,74,0.3)',
                              color: '#86EFAC',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              borderRadius: '100px',
                              border: '1px solid rgba(22,163,74,0.5)',
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="h6"
                          sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }}
                        >
                          Tổ Hợp Kỹ Thuật Đô Thị & Công Trình Cấp I
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#94A3B8', fontSize: '0.78rem' }}
                        >
                          Hồ sơ kỹ sư InfoHR được đối chiếu trực tiếp theo năng lực thực chiến và
                          công trình thực tế đã nghiệm thu.
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          SECTION 2: MARQUEE ĐỐI TÁC DOANH NGHIỆP
          ========================================================================= */}
      <Box
        component="section"
        aria-label="Đối tác doanh nghiệp đồng hành"
        sx={{
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <PartnerLogoCarousel label="ĐỒNG HÀNH CÙNG CÁC TẬP ĐOÀN & DOANH NGHIỆP TIÊN PHONG" />
      </Box>

      {/* =========================================================================
          SECTION 3: THE CONTRAST GRID (SÀN ĐẠI TRÀ VS INFOHR + AILA AI)
          ========================================================================= */}
      <Box
        component="section"
        aria-label="So sánh sự khác biệt tuyển dụng"
        sx={{
          py: { xs: 7, sm: 9, md: 11 },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Section Header */}
          <Box sx={{ maxWidth: 760, mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.78rem',
                display: 'block',
                mb: 1,
              }}
            >
              GIẢI QUYẾT TRIỆT ĐỂ NỖI ĐAU TUYỂN DỤNG KỸ THUẬT
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                letterSpacing: '-0.02em',
                color: '#0F172A',
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Sự Khác Biệt Giữa Sàn Việc Làm Đại Trà & InfoHR Kỹ Thuật
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.0625rem' },
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              Tại sao các tổng thầu xây dựng, chủ đầu tư bất động sản và công ty cơ điện hàng đầu
              chuyển dịch từ đăng tin đại trà sang InfoHR & Trợ lý Voice AI AILA?
            </Typography>
          </Box>

          {/* Contrast Cards Grid */}
          <Grid container spacing={3} className="gsap-contrast-grid">
            {contrastPairs.map((pair, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={`contrast-${index}`} className="gsap-contrast-card">
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderRadius: '12px',
                    borderColor: '#E2E8F0',
                    bgcolor: '#FFFFFF',
                    p: { xs: 2.5, sm: 3 },
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.05)',
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: '#0F172A',
                      fontSize: '1rem',
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    {pair.category}
                  </Typography>

                  <Stack spacing={2}>
                    {/* Tuyển dụng truyền thống (Nhược điểm) */}
                    <Box
                      sx={{
                        p: 1.75,
                        bgcolor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                        <CancelRoundedIcon sx={{ fontSize: 18, color: '#94A3B8', mt: 0.2 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: '#64748B',
                            textTransform: 'uppercase',
                            fontSize: '0.72rem',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Sàn Tuyển Dụng Đại Trà Truyền Thống
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          pl: 3.25,
                        }}
                      >
                        {pair.traditional}
                      </Typography>
                    </Box>

                    {/* InfoHR & AILA AI (Ưu điểm vượt trội) */}
                    <Box
                      sx={{
                        p: 1.75,
                        bgcolor: 'rgba(37, 99, 235, 0.04)',
                        borderRadius: '8px',
                        border: '1px solid #BFDBFE',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#2563EB', mt: 0.2 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: '#1D4ED8',
                            textTransform: 'uppercase',
                            fontSize: '0.72rem',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Giải Pháp InfoHR & Voice AI AILA
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#0F172A',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          lineHeight: 1.5,
                          pl: 3.25,
                        }}
                      >
                        {pair.infohr}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          SECTION 4: 4 KHỐI NGÀNH KỸ THUẬT TRỌNG ĐIỂM
          ========================================================================= */}
      <Box
        component="section"
        aria-label="4 Khối ngành kỹ thuật trọng điểm"
        sx={{
          py: { xs: 7, sm: 9, md: 11 },
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ maxWidth: 760, mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.78rem',
                display: 'block',
                mb: 1,
              }}
            >
              HỆ SINH THÁI NHÂN SỰ CHUYÊN BIỆT
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                letterSpacing: '-0.02em',
                color: '#0F172A',
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Tập Trung Chuyên Sâu 4 Khối Ngành Kỹ Thuật Trọng Điểm
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.0625rem' },
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              Không dàn trải đại trà. Chúng tôi xây dựng cơ sở dữ liệu chuyên sâu và bộ kịch bản
              phỏng vấn kỹ thuật riêng biệt cho từng khối ngành để đảm bảo ứng viên có năng lực thực
              chiến ngay khi nhận việc.
            </Typography>
          </Box>

          {/* Industry Cards Grid */}
          <Grid container spacing={3} className="gsap-industry-grid">
            {industries.map((industry) => {
              const IconComp = industry.icon;
              return (
                <Grid
                  size={{ xs: 12, sm: 6, lg: 3 }}
                  key={industry.id}
                  className="gsap-industry-card"
                >
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      borderColor: '#E2E8F0',
                      bgcolor: '#FFFFFF',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.05)',
                      transition: 'all 0.35s cubic-bezier(0.32,0.72,0,1)',
                      '&:hover': {
                        borderColor: industry.accentColor,
                        boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.12)',
                        transform: 'translateY(-4px)',
                        '& .industry-card-img': {
                          transform: 'scale(1.08)',
                        },
                      },
                    }}
                  >
                    {/* Industry Image Banner */}
                    <Box
                      sx={{
                        height: 160,
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: '#0F172A',
                      }}
                    >
                      <Box
                        component="img"
                        src={industry.image}
                        alt={industry.title}
                        className="industry-card-img"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          p: 2,
                        }}
                      >
                        <Chip
                          size="small"
                          label={industry.tag}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: '#0F172A',
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '100px',
                          }}
                        />
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            bgcolor: industry.accentColor,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          }}
                        >
                          <IconComp sx={{ fontSize: 20 }} />
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Body */}
                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.0625rem',
                          color: '#0F172A',
                          mb: 2,
                        }}
                      >
                        {industry.title}
                      </Typography>

                    {/* Key Roles */}
                    <Box sx={{ mb: 2.5, flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: '#64748B',
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          letterSpacing: '0.04em',
                          display: 'block',
                          mb: 1,
                        }}
                      >
                        Vị Trí Tuyển Dụng Then Chốt:
                      </Typography>
                      <Stack spacing={0.75}>
                        {industry.roles.map((role, rIdx) => (
                          <Stack
                            key={rIdx}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: industry.accentColor,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8125rem',
                                color: '#1E293B',
                                fontWeight: 500,
                              }}
                            >
                              {role}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: '#F1F5F9' }} />

                    {/* Standards & Software */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: '#64748B',
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          letterSpacing: '0.04em',
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        Tiêu Chuẩn Thẩm Định:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.75rem',
                          color: '#475569',
                          lineHeight: 1.45,
                          display: 'block',
                        }}
                      >
                        {industry.standards}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          SECTION 5: QUY TRÌNH 3 BƯỚC TINH GỌN
          ========================================================================= */}
      <Box
        component="section"
        aria-label="Quy trình tuyển dụng tinh gọn"
        sx={{
          py: { xs: 7, sm: 9, md: 11 },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ maxWidth: 760, mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.78rem',
                display: 'block',
                mb: 1,
              }}
            >
              VẬN HÀNH TINH GỌN & TỐI ƯU THỜI GIAN
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                letterSpacing: '-0.02em',
                color: '#0F172A',
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Quy Trình 3 Bước Tiếp Nhận Ứng Viên Đã Qua Sơ Loại Kỹ Thuật
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.0625rem' },
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              Từ lúc đăng tin tuyển dụng đến khi Ban Giám đốc Dự án duyệt Scorecard ứng viên chỉ trong
              vòng 48 giờ làm việc.
            </Typography>
          </Box>

          {/* 3 Step Cards Grid */}
          <Grid container spacing={3} className="gsap-process-grid">
            {/* Step 1 */}
            <Grid size={{ xs: 12, md: 4 }} className="gsap-process-step">
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: '12px',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  p: { xs: 3, sm: 3.5 },
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.05)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      bgcolor: '#F1F5F9',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PostAddOutlinedIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#CBD5E1',
                      fontSize: '1.75rem',
                      lineHeight: 1,
                    }}
                  >
                    01
                  </Typography>
                </Stack>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#0F172A',
                    mb: 1.5,
                  }}
                >
                  Đăng Tin & Cấu Hình Tiêu Chuẩn Kỹ Thuật
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  Doanh nghiệp thiết lập yêu cầu: Bằng cấp, chứng chỉ hành nghề bắt buộc (Bộ Xây dựng),
                  kỹ năng phần mềm chuyên môn (Revit, AutoCAD, Navisworks) và chọn bộ kịch bản câu hỏi
                  tình huống kỹ thuật chuẩn hóa cho Trợ lý AILA.
                </Typography>
              </Card>
            </Grid>

            {/* Step 2 */}
            <Grid size={{ xs: 12, md: 4 }} className="gsap-process-step">
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: '12px',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  p: { xs: 3, sm: 3.5 },
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.05)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      bgcolor: 'rgba(220, 38, 38, 0.1)',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RecordVoiceOverOutlinedIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#CBD5E1',
                      fontSize: '1.75rem',
                      lineHeight: 1,
                    }}
                  >
                    02
                  </Typography>
                </Stack>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#0F172A',
                    mb: 1.5,
                  }}
                >
                  AILA Voice AI Phỏng Vấn Sơ Loại 24/7
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  Ứng viên nộp hồ sơ được Trợ lý AILA tự động liên hệ thực hiện cuộc gọi Voice AI tương
                  tác thực tế. AILA đối đáp câu hỏi kỹ thuật, thẩm định xử lý xung đột bản vẽ và tình
                  huống thực chiến hiện trường hoàn toàn khách quan.
                </Typography>
              </Card>
            </Grid>

            {/* Step 3 */}
            <Grid size={{ xs: 12, md: 4 }} className="gsap-process-step">
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: '12px',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  p: { xs: 3, sm: 3.5 },
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.05)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      bgcolor: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FactCheckOutlinedIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#CBD5E1',
                      fontSize: '1.75rem',
                      lineHeight: 1,
                    }}
                  >
                    03
                  </Typography>
                </Stack>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: '#0F172A',
                    mb: 1.5,
                  }}
                >
                  Lãnh Đạo Nhận Scorecard & Duyệt Trong 2 Phút
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  }}
                >
                  HR và Chỉ huy trưởng/Giám đốc Dự án nhận Candidate Scorecard chi tiết (Match Score,
                  Checklist chứng chỉ, file ghi âm giọng nói ứng viên). Lãnh đạo chỉ mất 2 phút nghe và
                  duyệt trước khi mời gặp trực tiếp vòng 2.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================================================
          SECTION 6: BANNER CTA CHUYỂN ĐỔI B2B CUỐI TRANG
          ========================================================================= */}
      <Box
        component="section"
        aria-label="Đăng ký tài khoản nhà tuyển dụng"
        sx={{
          py: { xs: 7, sm: 9, md: 11 },
          bgcolor: '#FFFFFF',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box
            className="gsap-cta-banner"
            sx={{
              background:
                'linear-gradient(135deg, rgba(11, 17, 32, 0.94) 0%, rgba(15, 23, 42, 0.88) 100%), url("/images/employer/cta_cyber_backdrop.jpg") center/cover no-repeat',
              color: '#FFFFFF',
              borderRadius: '24px',
              p: { xs: 4, sm: 6, md: 8 },
              border: '1px solid rgba(59, 130, 246, 0.35)',
              boxShadow:
                '0 25px 60px -15px rgba(15, 23, 42, 0.6), 0 0 40px rgba(37, 99, 235, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle background glow effect */}
            <Box
              sx={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: 450,
                height: 450,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Chip
                  label="ƯU ĐÃI TRẢI NGHIỆM DOANH NGHIỆP MỚI"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: 'rgba(37, 99, 235, 0.25)',
                    color: '#93C5FD',
                    borderRadius: '100px',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    mb: 2,
                  }}
                />

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                    lineHeight: 1.25,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    mb: 2,
                  }}
                >
                  Sẵn sàng nâng cấp quy trình tuyển dụng kỹ thuật cho doanh nghiệp?
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.0625rem' },
                    color: '#94A3B8',
                    lineHeight: 1.6,
                    maxWidth: 680,
                  }}
                >
                  Tiết kiệm 15-20 giờ phỏng vấn sơ loại cho mỗi vị trí và tiếp cận ngay nguồn kỹ sư,
                  quản lý có chứng chỉ hành nghề thực tế. Đăng ký ngay hôm nay để nhận{' '}
                  <strong style={{ color: '#FFFFFF' }}>01 tin đăng tuyển chuyên ngành</strong> &{' '}
                  <strong style={{ color: '#60A5FA' }}>10 lượt phỏng vấn Voice AI AILA</strong> miễn phí.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={2} sx={{ width: '100%', maxWidth: { lg: 320 }, ml: { lg: 'auto' } }}>
                  <Button
                    component={Link}
                    href={registerUrl}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      py: 1.75,
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.45)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                        boxShadow: '0 6px 22px rgba(37, 99, 235, 0.55)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Đăng Ký Tài Khoản NTD
                  </Button>

                  <Button
                    component={Link}
                    href={pricingUrl}
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.75,
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#F8FAFC',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(8px)',
                      textTransform: 'none',
                      borderRadius: '12px',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#60A5FA',
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Xem Bảng Giá & Dịch Vụ
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Hotline B2B Footer */}
            <Divider sx={{ my: 3.5, borderColor: '#1E293B' }} />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <HeadsetMicOutlinedIcon sx={{ fontSize: 18, color: '#60A5FA' }} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                  Hỗ trợ thiết lập kịch bản tuyển dụng kỹ thuật: (028) 7300 8842 • support@infohr.vn
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                Áp dụng cho mọi doanh nghiệp Xây dựng, BĐS, Kiến trúc và Cơ điện MEP
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
