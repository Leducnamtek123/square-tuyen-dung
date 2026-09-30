'use client';

import React, { useRef } from 'react';
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
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import PartnerLogoCarousel from '@/components/Features/PartnerLogoCarousel';

registerGsapPlugins();

export default function IntroducePage() {
  const { t, i18n } = useTranslation('employer');
  TabTitle(
    t('introduce.tabTitle', {
      appName: APP_NAME,
      defaultValue: `Hồ Sơ Năng Lực & Sứ Mệnh Công Nghệ | ${APP_NAME}`,
    })
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll handler for anchor links
  const handleScrollToSection = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const has = (selector: string): boolean => Boolean(el.querySelector(selector));

      const mm = gsap.matchMedia();

      // -- Desktop Animations (>=769px) --------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        if (has('.gsap-hero-title')) {
          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          if (has('.gsap-hero-badge')) {
            heroTl.fromTo(
              '.gsap-hero-badge',
              { y: -15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, clearProps: "all" }
            );
          }
          heroTl.fromTo(
            '.gsap-hero-title',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: "all" },
            '-=0.2'
          );
          if (has('.gsap-hero-desc')) {
            heroTl.fromTo(
              '.gsap-hero-desc',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: "all" },
              '-=0.3'
            );
          }
          if (has('.gsap-hero-actions')) {
            heroTl.fromTo(
              '.gsap-hero-actions',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: "all" },
              '-=0.25'
            );
          }
          if (has('.gsap-hero-highlights')) {
            heroTl.fromTo(
              '.gsap-hero-highlights',
              { y: 25, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.55, clearProps: "all" },
              '-=0.2'
            );
          }
        }

        if (has('.gsap-value-card')) {
          gsap.fromTo(
            '.gsap-value-card',
            { y: 35, opacity: 0 },
            {
              scrollTrigger: has('.gsap-values-grid')
                ? {
                    trigger: '.gsap-values-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-pillar-card')) {
          gsap.fromTo(
            '.gsap-pillar-card',
            { y: 35, opacity: 0 },
            {
              scrollTrigger: has('.gsap-pillars-grid')
                ? {
                    trigger: '.gsap-pillars-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-ethics-card')) {
          gsap.fromTo(
            '.gsap-ethics-card',
            { y: 30, opacity: 0 },
            {
              scrollTrigger: has('.gsap-ethics-grid')
                ? {
                    trigger: '.gsap-ethics-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-guarantee-card')) {
          gsap.fromTo(
            '.gsap-guarantee-card',
            { y: 30, opacity: 0 },
            {
              scrollTrigger: has('.gsap-guarantee-grid')
                ? {
                    trigger: '.gsap-guarantee-grid',
                    start: 'top 85%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.12,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-cta-box')) {
          gsap.fromTo(
            '.gsap-cta-box',
            { y: 25, opacity: 0 },
            {
              scrollTrigger: {
                trigger: '.gsap-cta-box',
                start: 'top 88%',
                once: true,
              },
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power3.out',
              clearProps: "all",
            }
          );
        }
      });

      // -- Mobile Animations (<=768px) ---------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        if (has('.gsap-hero-title')) {
          const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

          if (has('.gsap-hero-badge')) {
            heroTl.fromTo(
              '.gsap-hero-badge',
              { y: -10, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, clearProps: "all" }
            );
          }
          heroTl.fromTo(
            '.gsap-hero-title',
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, clearProps: "all" },
            '-=0.2'
          );
          if (has('.gsap-hero-desc')) {
            heroTl.fromTo(
              '.gsap-hero-desc',
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, clearProps: "all" },
              '-=0.25'
            );
          }
          if (has('.gsap-hero-actions')) {
            heroTl.fromTo(
              '.gsap-hero-actions',
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, clearProps: "all" },
              '-=0.2'
            );
          }
          if (has('.gsap-hero-highlights')) {
            heroTl.fromTo(
              '.gsap-hero-highlights',
              { y: 15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, clearProps: "all" },
              '-=0.2'
            );
          }
        }

        if (has('.gsap-value-card')) {
          gsap.fromTo(
            '.gsap-value-card',
            { y: 16, opacity: 0 },
            {
              scrollTrigger: has('.gsap-values-grid')
                ? {
                    trigger: '.gsap-values-grid',
                    start: 'top 92%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.08,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-pillar-card')) {
          gsap.fromTo(
            '.gsap-pillar-card',
            { y: 16, opacity: 0 },
            {
              scrollTrigger: has('.gsap-pillars-grid')
                ? {
                    trigger: '.gsap-pillars-grid',
                    start: 'top 92%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.08,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-ethics-card')) {
          gsap.fromTo(
            '.gsap-ethics-card',
            { y: 14, opacity: 0 },
            {
              scrollTrigger: has('.gsap-ethics-grid')
                ? {
                    trigger: '.gsap-ethics-grid',
                    start: 'top 92%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-guarantee-card')) {
          gsap.fromTo(
            '.gsap-guarantee-card',
            { y: 14, opacity: 0 },
            {
              scrollTrigger: has('.gsap-guarantee-grid')
                ? {
                    trigger: '.gsap-guarantee-grid',
                    start: 'top 92%',
                    once: true,
                  }
                : undefined,
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.06,
              ease: 'power2.out',
              clearProps: "all",
            }
          );
        }

        if (has('.gsap-cta-box')) {
          gsap.fromTo(
            '.gsap-cta-box',
            { y: 16, opacity: 0 },
            {
              scrollTrigger: {
                trigger: '.gsap-cta-box',
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
        }
      });

      // -- Reduced Motion -----------------------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        const targets = [
          '.gsap-hero-badge',
          '.gsap-hero-title',
          '.gsap-hero-desc',
          '.gsap-hero-actions',
          '.gsap-hero-highlights',
          '.gsap-value-card',
          '.gsap-pillar-card',
          '.gsap-ethics-card',
          '.gsap-guarantee-card',
          '.gsap-cta-box',
        ].filter(has);
        if (targets.length > 0) {
          gsap.set(targets.join(', '), { opacity: 1, y: 0, clearProps: "all" });
        }
      });
    },
    { scope: containerRef }
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        minHeight: '100dvh',
      }}
    >
      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 1: HERO EDITORIAL & MANIFESTO */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          pt: { xs: 6, sm: 8, md: 10 },
          pb: { xs: 7, md: 11 },
          bgcolor: '#FAFBFC',
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(37, 99, 235, 0.08), transparent 70%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(220, 38, 38, 0.04), transparent 60%)',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 960, mx: 'auto' }}>
            {/* Eyebrow */}
            <Chip
              className="gsap-hero-badge"
              icon={<VerifiedUserOutlinedIcon sx={{ color: '#2563EB !important', fontSize: 18 }} />}
              label="HỒ SƠ NĂNG LỰC & SỨ MỆNH CÔNG NGHỆ"
              sx={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                letterSpacing: '0.04em',
                px: 1.5,
                py: 0.6,
                border: '1px solid #BFDBFE',
                borderRadius: '100px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
              }}
            />

            {/* H1 Heading */}
            <Typography
              className="gsap-hero-title"
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.9rem', sm: '2.5rem', md: '3.2rem' },
                lineHeight: { xs: 1.25, md: 1.2 },
                letterSpacing: '-0.02em',
              }}
            >
              Tại Sao InfoHR Ra Đời? — Lời Giải Cho Bài Toán Nhân Lực Kỹ Thuật Việt Nam.
            </Typography>

            {/* Subtitle */}
            <Typography
              className="gsap-hero-desc"
              variant="body1"
              sx={{
                color: '#475569',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                lineHeight: 1.75,
                maxWidth: 860,
              }}
            >
              Thấu hiểu sự trăn trở của các nhà thầu, chủ đầu tư và công ty tư vấn thiết kế khi loay hoay giữa hàng ngàn CV trái ngành, InfoHR được kiến tạo để trở thành nền tảng tuyển dụng & đánh giá năng lực chuyên sâu bằng công nghệ Voice AI thời gian thực.
            </Typography>

            {/* Action Buttons */}
            <Stack
              className="gsap-hero-actions"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1.5 }}
            >
              <Button
                variant="contained"
                onClick={handleScrollToSection('nang-luc-tham-dinh')}
                endIcon={<ArrowDownwardRoundedIcon />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  textTransform: 'none',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Khám Phá Giải Pháp
              </Button>

              <Button
                variant="outlined"
                component={Link}
                href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 1.5,
                  px: 3.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  bgcolor: '#FFFFFF',
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
                Đặt Lịch Tư Vấn
              </Button>
            </Stack>

            {/* Editorial Fact / Credibility Card */}
            <Card
              className="gsap-hero-highlights"
              elevation={0}
              sx={{
                width: '100%',
                mt: { xs: 4, md: 5 },
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                p: { xs: 2.5, sm: 3.5 },
                textAlign: 'left',
              }}
            >
              <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#2563EB',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'block',
                      mb: 0.75,
                    }}
                  >
                    Bối Cảnh & Trăn Trở Ngành
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      fontSize: '0.925rem',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;Một kỹ sư giám sát hay chỉ huy phó không thể được đánh giá trọn vẹn chỉ qua các gạch đầu dòng tự khai. Một sự cố xung đột đường ống cơ điện hay lỗi sai mạch ngừng bê tông tại hiện trường có thể đánh đổi bằng hàng trăm triệu đồng tiến độ dự án. InfoHR ra đời để lượng hóa năng lực chuyên môn bằng công nghệ minh bạch nhất.&rdquo;
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.65rem' }}>
                        100%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mt: 0.25 }}>
                        Hồ sơ kỹ thuật chuẩn hóa
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>
                        Theo Bộ Xây dựng & TCVN
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB', fontSize: '1.65rem' }}>
                        &lt;500ms
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mt: 0.25 }}>
                        Độ trễ Voice AI AILA
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>
                        Hội thoại phản xạ trực tiếp
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#DC2626', fontSize: '1.65rem' }}>
                        0 Giờ
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mt: 0.25 }}>
                        Lãng phí cho CV ảo
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>
                        Sơ loại khách quan 24/7
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PARTNER LOGO MARQUEE */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box sx={{ py: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <PartnerLogoCarousel label="ĐỒNG HÀNH CÙNG CÁC DOANH NGHIỆP & TẬP ĐOÀN TIÊN PHONG" />
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 2: SỨ MỆNH, TẦM NHÌN & TRIẾT LÝ GIÁ TRỊ CỐT LÕI */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 11 },
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 }, maxWidth: 840, mx: 'auto' }}>
            <Chip
              label="GIÁ TRỊ CỐT LÕI & ĐỊNH HƯỚNG CHIẾN LƯỢC"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #DBEAFE',
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.75rem', md: '2.4rem' },
                letterSpacing: '-0.015em',
              }}
            >
              Sứ Mệnh, Tầm Nhìn & Triết Lý Hoạt Động
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              Ba nguyên tắc bất biến định hình nền tảng tuyển dụng chuyên môn cao phục vụ các nhà thầu, chủ đầu tư và doanh nghiệp kỹ thuật hàng đầu.
            </Typography>
          </Stack>

          <Grid container className="gsap-values-grid" spacing={{ xs: 3, md: 4 }}>
            {/* THẺ 1: SỨ MỆNH */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="gsap-value-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  p: { xs: 3, md: 3.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#93C5FD',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.08)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FactCheckOutlinedIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Chip
                      label="SỨ MỆNH"
                      size="small"
                      sx={{
                        bgcolor: '#EFF6FF',
                        color: '#1D4ED8',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.4 }}
                  >
                    Sứ Mệnh Chuẩn Hóa Tiêu Chí Kỹ Thuật
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, flexGrow: 1, mb: 2.5 }}>
                  Chấm dứt kỷ nguyên tuyển dụng theo cảm tính hay từ khóa chung chung. InfoHR xây dựng bộ khung đánh giá năng lực thực chiến chuẩn mực cho 4 ngành Xây dựng, Bất động sản, Kiến trúc nội thất và MEP, giúp nhà tuyển dụng nhìn thấy năng lực thật đằng sau mỗi dòng CV.
                </Typography>

                <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'block' }}>
                    • Xác minh chứng chỉ hành nghề Bộ Xây dựng
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    • Khảo sát mốc dự án thực tế đã nghiệm thu
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    • Đánh giá kỹ năng BIM / Revit / Shop drawing
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* THẺ 2: TẦM NHÌN */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="gsap-value-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  p: { xs: 3, md: 3.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#FECACA',
                    boxShadow: '0 10px 25px rgba(220, 38, 38, 0.08)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: '#FEF2F2',
                        color: '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <RecordVoiceOverOutlinedIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Chip
                      label="TẦM NHÌN"
                      size="small"
                      sx={{
                        bgcolor: '#FEF2F2',
                        color: '#B91C1C',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.4 }}
                  >
                    Tầm Nhìn Dẫn Đầu Công Nghệ Voice AI Tuyển Dụng
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, flexGrow: 1, mb: 2.5 }}>
                  Tiên phong ứng dụng AI hội thoại thời gian thực (Real-time WebRTC Voice AI) vào tuyển dụng chuyên môn. Đưa trợ lý ảo AILA trở thành chuẩn mực sơ loại nhân sự kỹ thuật hàng đầu Đông Nam Á, giúp doanh nghiệp tiết kiệm 80% thời gian phỏng vấn sàng lọc ban đầu.
                </Typography>

                <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600, display: 'block' }}>
                    • Phỏng vấn tình huống phản xạ độ trễ thấp (&lt;500ms)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    • Kịch bản câu hỏi bám sát TCVN / ASTM / QCVN
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    • Phiếu Scorecard khách quan kèm audio ghi âm
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* THẺ 3: TRIẾT LÝ */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="gsap-value-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  p: { xs: 3, md: 3.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                <Box sx={{ mb: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: '#F1F5F9',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HandshakeOutlinedIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Chip
                      label="TRIẾT LÝ"
                      size="small"
                      sx={{
                        bgcolor: '#F1F5F9',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.4 }}
                  >
                    Triết Lý Minh Bạch & Tôn Trọng Thời Gian
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, flexGrow: 1, mb: 2.5 }}>
                  Mỗi phút làm việc của Chỉ huy trưởng, Giám đốc Dự án và Trưởng phòng Kỹ thuật đều quý giá trên công trường. Chúng tôi cam kết dữ liệu minh bạch, hồ sơ có thật, phản ánh đúng năng lực và bảo vệ tối đa nguồn lực tuyển dụng của doanh nghiệp.
                </Typography>

                <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, display: 'block' }}>
                    • Chỉ tính phí khi liên hệ ứng viên có nhu cầu thật
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    • Chính sách bảo hành đổi hồ sơ thử việc 1-on-1
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    • Tuyệt đối không chi phí ẩn, không ép mua gói lớn
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 3: 3 TRỤ CỘT NĂNG LỰC THẨM ĐỊNH CHUYÊN SÂU */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        id="nang-luc-tham-dinh"
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 6, md: 8 }, maxWidth: 880, mx: 'auto' }}>
            <Chip
              label="NĂNG LỰC CỐT LÕI (CORE COMPETENCIES)"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #DBEAFE',
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.8rem', md: '2.4rem' },
                letterSpacing: '-0.015em',
              }}
            >
              3 Trụ Cột Năng Lực Thẩm Định Chuyên Sâu Của InfoHR
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              Phương pháp luận toàn diện kết hợp giữa thẩm định hồ sơ thực chiến, công nghệ phỏng vấn Voice AI thông minh và hệ sinh thái phần mềm quản trị liên thông.
            </Typography>
          </Stack>

          <Grid container className="gsap-pillars-grid" spacing={{ xs: 4, md: 4 }}>
            {/* TRỤ CỘT 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="gsap-pillar-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #2563EB',
                  borderRadius: '18px',
                  p: { xs: 3, sm: 3.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 30px rgba(37, 99, 235, 0.06)',
                }}
              >
                {/* Pillar 1 Image Banner */}
                <Box
                  sx={{
                    width: '100%',
                    height: 140,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    mb: 2,
                    bgcolor: '#0F172A',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/employer/engineering_verify.jpg"
                    alt="Thẩm định chứng chỉ hành nghề Bộ Xây dựng"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, letterSpacing: '0.05em' }}>
                      TRỤ CỘT 01
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                      Thẩm Định Hồ Sơ Chuyên Môn
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', mb: 3, lineHeight: 1.7 }}>
                  Quy trình sàng lọc nghiêm ngặt loại bỏ hoàn toàn các hồ sơ ngụy tạo thành tích hay sai lệch chức danh đảm nhiệm.
                </Typography>

                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      1. Xác minh chứng chỉ hành nghề Bộ Xây dựng
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                      Tra cứu trực tiếp số hiệu chứng chỉ Giám sát thi công xây dựng, Quản lý dự án, Thiết kế kết cấu (Hạng I, Hạng II, Hạng III).
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      2. Khảo sát mốc dự án thực tế đã tham gia
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                      Lượng hóa quy mô công trình thực chiến: GFA sàn xây dựng, cấp công trình (Cấp I/II/Đặc biệt), số tầng hầm sâu và vai trò trực tiếp.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      3. Đánh giá kỹ năng BIM & Shop drawing
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                      Kiểm tra thực tế năng lực triển khai mô hình BIM, Revit Architecture/MEP, AutoCAD, Shop drawing, Tekla và SAP2000.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* TRỤ CỘT 2 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="gsap-pillar-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #DC2626',
                  borderRadius: '18px',
                  p: { xs: 3, sm: 3.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 30px rgba(220, 38, 38, 0.06)',
                }}
              >
                {/* Pillar 2 Image Banner */}
                <Box
                  sx={{
                    width: '100%',
                    height: 140,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    mb: 2,
                    bgcolor: '#0F172A',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/employer/voice_ai_interview.jpg"
                    alt="Trợ lý Voice AI AILA thời gian thực"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#FEF2F2',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SmartToyOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700, letterSpacing: '0.05em' }}>
                      TRỤ CỘT 02
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                      Công Nghệ Voice AI Thời Gian Thực AILA
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', mb: 3, lineHeight: 1.7 }}>
                  Trợ lý phỏng vấn giọng nói hai chiều trực tiếp, phỏng vấn ứng viên theo tình huống công trường chuẩn TCVN.
                </Typography>

                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991B1B', mb: 0.5 }}>
                      1. Kiến trúc WebRTC phản xạ tức thì (&lt;500ms)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7F1D1D', lineHeight: 1.6, display: 'block' }}>
                      Hội thoại giọng nói tự nhiên, không ngắt quãng, tạo trải nghiệm như đang trao đổi cùng chuyên gia kỹ thuật thật.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991B1B', mb: 0.5 }}>
                      2. Kịch bản tình huống theo TCVN / ASTM
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7F1D1D', lineHeight: 1.6, display: 'block' }}>
                      Hỏi xoáy các tình huống: sự cố nứt sàn, mạch ngừng bê tông, xung đột ống gió HVAC với dầm, an toàn hầm sâu và PCCC.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991B1B', mb: 0.5 }}>
                      3. Phiếu Scorecard & Audio ghi âm nguyên bản
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7F1D1D', lineHeight: 1.6, display: 'block' }}>
                      Tự động trích xuất Match Score %, tóm tắt phản ứng kỹ thuật và cung cấp bản ghi âm từng câu hỏi để sếp duyệt trong 2 phút.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* TRỤ CỘT 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                className="gsap-pillar-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid #0F172A',
                  borderRadius: '18px',
                  p: { xs: 3, sm: 3.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
                }}
              >
                {/* Pillar 3 Image Banner */}
                <Box
                  sx={{
                    width: '100%',
                    height: 140,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    mb: 2,
                    bgcolor: '#0F172A',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/employer/hero_tech_complex.jpg"
                    alt="Hệ sinh thái nhân sự liên thông"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#F1F5F9',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <HubOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 700, letterSpacing: '0.05em' }}>
                      TRỤ CỘT 03
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                      Hệ Sinh Thái Nhân Sự Liên Thông
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', mb: 3, lineHeight: 1.7 }}>
                  Mô hình khép kín đồng bộ từ tiếp nhận hồ sơ, đánh giá phỏng vấn đến quản lý nhân sự Onboarding trên công trường.
                </Typography>

                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      1. InfoHR Recruitment Portal
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                      Cổng tuyển dụng chuyên sâu tiếp cận cộng đồng hàng chục ngàn kỹ sư, kiến trúc sư và cán bộ quản lý dự án trên toàn quốc.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      2. InfoHR HRM Quản Trị Nhân Sự
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                      Chuyển tiếp trơn tru ứng viên trúng tuyển sang phân hệ HRM: hợp đồng lao động, phân ca làm việc, chấm công công trường GPS.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      3. AILA AI Interview Center
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                      Trung tâm sát hạch trực tuyến hoạt động 24/7, tổ chức các kỳ đánh giá tay nghề định kỳ và kiểm tra năng lực nhân sự nội bộ.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 4: TIÊU CHUẨN BẢO MẬT THÔNG TIN & ĐẠO ĐỨC AI */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 11 },
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 }, maxWidth: 840, mx: 'auto' }}>
            <Chip
              label="AN TOÀN DỮ LIỆU & ĐẠO ĐỨC CÔNG NGHỆ"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #DBEAFE',
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.75rem', md: '2.4rem' },
                letterSpacing: '-0.015em',
              }}
            >
              Tiêu Chuẩn Bảo Mật Thông Tin & Đạo Đức AI
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              Cam kết bảo vệ tuyệt đối danh mục dự án, hồ sơ đấu thầu của doanh nghiệp và duy trì tính công tâm, chuẩn mực trong từng thuật toán đánh giá.
            </Typography>
          </Stack>

          <Grid container className="gsap-ethics-grid" spacing={{ xs: 3, md: 4 }}>
            {/* CỘT 1: BẢO MẬT DỰ ÁN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                className="gsap-ethics-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  p: { xs: 3, sm: 4 },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant="h3" component="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>
                    Bảo Mật Tuyệt Đối Danh Mục Dự Án & Gói Thầu
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.75 }}>
                  Kế hoạch nhân sự cấp cao phục vụ hồ sơ dự thầu là bí mật kinh doanh sống còn của các nhà thầu và chủ đầu tư. InfoHR thiết lập hệ thống bảo mật đa tầng:
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Tuân thủ Nghị định 13/2023/NĐ-CP:</strong> Bảo vệ nghiêm ngặt dữ liệu cá nhân của ứng viên và bí mật hoạt động của doanh nghiệp.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Mã hóa dữ liệu lưu trữ & truyền tải:</strong> Tiêu chuẩn AES-256 trên cơ sở dữ liệu và TLS 1.3 đối với toàn bộ kết nối WebRTC Voice.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Chế độ tuyển dụng ẩn danh (Confidential):</strong> Tùy chọn giấu tên doanh nghiệp và tên gói thầu khi tiếp cận các vị trí nhân sự chiến lược.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Cam kết không chia sẻ bên thứ ba:</strong> Dữ liệu ứng viên và tài liệu dự án của doanh nghiệp không bao giờ bị sử dụng cho mục đích thương mại khác.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* CỘT 2: ĐẠO ĐỨC AI */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                className="gsap-ethics-card"
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  p: { xs: 3, sm: 4 },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      bgcolor: '#F1F5F9',
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BalanceOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant="h3" component="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>
                    Thuật Toán AI Công Tâm — Không Định Kiến
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.75 }}>
                  Trợ lý ảo AILA được huấn luyện chuyên sâu để mở ra cơ hội bình đẳng cho mọi kỹ sư và nhân sự kỹ thuật dựa trên năng lực giải quyết vấn đề thực tế:
                </Typography>

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#0F172A', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>100% Đánh giá trên năng lực kỹ thuật:</strong> Tiêu chí chấm điểm hoàn toàn dựa trên quy chuẩn xây dựng, phản xạ an toàn và logic xử lý sự cố.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#0F172A', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Triệt tiêu định kiến vô thức:</strong> Thuật toán loại bỏ các yếu tố ảnh hưởng về giới tính, độ tuổi, vùng miền hay chất giọng địa phương của ứng viên.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#0F172A', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Minh bạch hóa kết quả Scorecard:</strong> Mọi điểm số đều có trích dẫn câu hỏi, câu trả lời và file ghi âm đối chiếu rõ ràng.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ color: '#0F172A', fontSize: 18, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      <strong>Con người giữ quyền quyết định cuối cùng:</strong> AILA đóng vai trò trợ lý sơ loại độc lập, không thay thế hội đồng tuyển dụng của công ty.
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 5: CHÍNH SÁCH ĐỒNG HÀNH & BẢO HÀNH TUYỂN DỤNG */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          py: { xs: 7, md: 11 },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 }, maxWidth: 840, mx: 'auto' }}>
            <Chip
              label="CAM KẾT DỊCH VỤ (SERVICE LEVEL AGREEMENT)"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #DBEAFE',
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.75rem', md: '2.4rem' },
                letterSpacing: '-0.015em',
              }}
            >
              Chính Sách Đồng Hành & Bảo Hành Tuyển Dụng
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              Mối quan hệ hợp tác B2B bền vững dựa trên sự an tâm và hiệu quả tuyển dụng thực tế của doanh nghiệp.
            </Typography>
          </Stack>

          <Grid container className="gsap-guarantee-grid" spacing={{ xs: 3, md: 4 }}>
            {/* CHÍNH SÁCH 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                className="gsap-guarantee-card"
                sx={{
                  p: { xs: 3, sm: 3.5 },
                  bgcolor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h3" component="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.15rem', mb: 1.5 }}>
                  Bảo Hành Đổi Hồ Sơ Thử Việc
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, flexGrow: 1 }}>
                  Đối với các gói tuyển dụng cam kết, nếu nhân sự không vượt qua thời gian thử việc hoặc đơn phương nghỉ việc trong 60 ngày, InfoHR cam kết bù đắp hồ sơ thay thế tương đương hoàn toàn miễn phí.
                </Typography>
              </Box>
            </Grid>

            {/* CHÍNH SÁCH 2 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                className="gsap-guarantee-card"
                sx={{
                  p: { xs: 3, sm: 3.5 },
                  bgcolor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#FEF2F2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <SpeedRoundedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h3" component="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.15rem', mb: 1.5 }}>
                  Bảo Lưu & Cam Kết Hoàn Điểm
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, flexGrow: 1 }}>
                  Chỉ trừ điểm lọc CV khi ứng viên nghe máy phản hồi và xác nhận có nhu cầu công việc. Hệ thống tự động hoàn lại 100% điểm nếu số điện thoại sai lệch hoặc thuê bao không hoạt động sau 3 lần kết nối.
                </Typography>
              </Box>
            </Grid>

            {/* CHÍNH SÁCH 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                className="gsap-guarantee-card"
                sx={{
                  p: { xs: 3, sm: 3.5 },
                  bgcolor: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#F1F5F9',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <SupportAgentOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h3" component="h3" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.15rem', mb: 1.5 }}>
                  Tư Vấn Kỹ Thuật Đồng Hành 1-on-1
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.75, flexGrow: 1 }}>
                  Mỗi doanh nghiệp được hỗ trợ bởi một chuyên viên am hiểu chuyên môn xây dựng - kỹ thuật, hỗ trợ tối ưu bản mô tả công việc (JD) và cấu hình kịch bản câu hỏi phỏng vấn chuẩn hóa cho AILA.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* SECTION 6: CTA HỢP TÁC & ĐẶT LỊCH DEMO CHUYÊN SÂU */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Box
            className="gsap-cta-box"
            sx={{
              borderRadius: { xs: '20px', md: '24px' },
              background:
                'linear-gradient(135deg, rgba(11, 17, 32, 0.94) 0%, rgba(15, 23, 42, 0.88) 100%), url("/images/employer/cta_cyber_backdrop.jpg") center/cover no-repeat',
              color: '#FFFFFF',
              p: { xs: 4, sm: 6, md: 8 },
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.6), 0 0 40px rgba(37, 99, 235, 0.15)',
            }}
          >
            {/* Ambient subtle glow */}
            <Box
              sx={{
                position: 'absolute',
                top: '-25%',
                right: '-15%',
                width: 450,
                height: 450,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 820, mx: 'auto', position: 'relative', zIndex: 1 }}>
              <Chip
                label="HỢP TÁC DOANH NGHIỆP"
                sx={{
                  bgcolor: 'rgba(37, 99, 235, 0.25)',
                  color: '#93C5FD',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '100px',
                }}
              />

              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.75rem' },
                  lineHeight: { xs: 1.3, md: 1.25 },
                  letterSpacing: '-0.02em',
                }}
              >
                Sẵn Sàng Đồng Hành Cùng InfoHR Nâng Tầm Đội Ngũ Kỹ Thuật?
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#94A3B8',
                  fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.7,
                  maxWidth: 700,
                }}
              >
                Đăng ký ngay hôm nay để nhận tư vấn giải pháp tuyển dụng chuyên môn hoặc trải nghiệm trực tiếp buổi phỏng vấn mẫu với trợ lý Voice AI AILA.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}
              >
                <Button
                  variant="contained"
                  component={Link}
                  href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 1.5,
                    px: 3.5,
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.45)',
                    textTransform: 'none',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                      boxShadow: '0 6px 22px rgba(37, 99, 235, 0.55)',
                    },
                  }}
                >
                  Đăng Ký Tài Khoản Doanh Nghiệp
                </Button>

                <Button
                  variant="outlined"
                  component={Link}
                  href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 1.5,
                    px: 3.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#60A5FA',
                      bgcolor: 'rgba(255, 255, 255, 0.12)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Xem Bảng Giá & Đặt Lịch Demo
                </Button>
              </Stack>

              {/* Direct B2B contact channels */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 3 }}
                alignItems="center"
                justifyContent="center"
                sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', width: '100%' }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneInTalkOutlinedIcon sx={{ color: '#60A5FA', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                    Hotline Doanh Nghiệp: 028 7108 8688
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MailOutlineRoundedIcon sx={{ color: '#60A5FA', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                    Email: hotline@infohr.vn
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
