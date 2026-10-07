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
  Divider,
} from '@mui/material';
import {
  Building2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Layers,
  Radio,
  Users,
  Lock,
  Compass,
  Briefcase,
  AlertCircle,
  Sparkles,
  Workflow,
  Scale,
  HardHat,
  Home,
  DraftingCompass,
  Zap,
} from 'lucide-react';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from '@/utils/gsapHelpers';

import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME } from '@/configs/constants';
import { useTranslation } from 'react-i18next';

registerGsapPlugins();

export default function AboutUsPage() {
  const { t } = useTranslation('about');
  TabTitle(t('aboutUsPage.tabTitle', { appName: APP_NAME, defaultValue: `Về chúng tôi — Nền tảng Tuyển dụng Chuyên ngành & Phỏng vấn Voice AI | ${APP_NAME}` }));

  const containerRef = React.useRef<HTMLDivElement>(null);

  // GSAP animation definitions for smooth entrance
  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const has = (selector: string) => !!el.querySelector(selector);
      const mm = gsap.matchMedia();

      // Desktop animations
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        if (has('.gsap-about-hero')) {
          gsap.fromTo(
            '.gsap-about-hero',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', clearProps: 'all' }
          );
        }

        if (has('.gsap-stat-card')) {
          gsap.fromTo(
            '.gsap-stat-card',
            { y: 25, opacity: 0 },
            {
              scrollTrigger: has('.gsap-stats-grid') ? {
                trigger: '.gsap-stats-grid',
                start: 'top 88%',
                once: true,
              } : undefined,
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }

        if (has('.gsap-problem-card')) {
          gsap.fromTo(
            '.gsap-problem-card',
            { y: 30, opacity: 0 },
            {
              scrollTrigger: has('.gsap-problem-section') ? {
                trigger: '.gsap-problem-section',
                start: 'top 85%',
                once: true,
              } : undefined,
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
            { y: 25, opacity: 0 },
            {
              scrollTrigger: has('.gsap-industries-grid') ? {
                trigger: '.gsap-industries-grid',
                start: 'top 85%',
                once: true,
              } : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.1,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }

        if (has('.gsap-node-card')) {
          gsap.fromTo(
            '.gsap-node-card',
            { y: 25, opacity: 0 },
            {
              scrollTrigger: has('.gsap-nodes-grid') ? {
                trigger: '.gsap-nodes-grid',
                start: 'top 85%',
                once: true,
              } : undefined,
              y: 0,
              opacity: 1,
              duration: 0.55,
              stagger: 0.1,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }
      });

      // Mobile animations
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        if (has('.gsap-about-hero')) {
          gsap.fromTo(
            '.gsap-about-hero',
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
          );
        }

        if (has('.gsap-stat-card')) {
          gsap.fromTo(
            '.gsap-stat-card',
            { y: 15, opacity: 0 },
            {
              scrollTrigger: has('.gsap-stats-grid') ? {
                trigger: '.gsap-stats-grid',
                start: 'top 92%',
                once: true,
              } : undefined,
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.08,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }
      });

      // Reduced motion fallback
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        const targets = [
          '.gsap-about-hero',
          '.gsap-stat-card',
          '.gsap-problem-card',
          '.gsap-industry-card',
          '.gsap-node-card',
        ].filter(has);
        if (targets.length > 0) {
          gsap.set(targets.join(', '), { opacity: 1, y: 0, clearProps: 'all' });
        }
      });
    },
    { scope: containerRef }
  );

  // Industry Icon mapping
  const INDUSTRY_ICONS = {
    construction: HardHat,
    realEstate: Home,
    architecture: DraftingCompass,
    mep: Zap,
  };

  // Traditional Pains Data
  const traditionalPains = (t('aboutUsPage.problemSection.traditionalPains', { returnObjects: true }) as Array<{ title: string; desc: string }>) || [];
  const solutionPoints = (t('aboutUsPage.problemSection.solutionPoints', { returnObjects: true }) as Array<{ title: string; desc: string }>) || [];
  const industryItems = (t('aboutUsPage.industriesSection.items', { returnObjects: true }) as Array<{ id: 'construction' | 'realEstate' | 'architecture' | 'mep'; name: string; roles: string; challenge: string; solution: string }>) || [];
  const ecosystemItems = (t('aboutUsPage.ecosystemSection.items', { returnObjects: true }) as Array<{ subdomain: string; name: string; desc: string; url: string; target: string }>) || [];
  const techCards = (t('aboutUsPage.technologySection.cards', { returnObjects: true }) as Array<{ title: string; desc: string }>) || [];
  const statsList = (t('aboutUsPage.stats', { returnObjects: true }) as Array<{ num: string; label: string; desc: string }>) || [];

  return (
    <Box ref={containerRef} sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: { xs: 8, md: 12 } }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 1: HERO EDITORIAL & BẢN SẮC NỀN TẢNG */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          pt: { xs: 6, sm: 8, md: 11 },
          pb: { xs: 6, md: 10 },
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack className="gsap-about-hero" spacing={3} textAlign="center" alignItems="center" sx={{ mb: { xs: 4, md: 6 } }}>
            {/* Kicker badge */}
            <Chip
              icon={<Building2 size={15} className="text-blue-600" />}
              label={t('aboutUsPage.kicker', { defaultValue: 'THÔNG TIN NỀN TẢNG • HỆ SINH THÁI CÔNG NGHỆ INFOHR' })}
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                px: 1.5,
                py: 0.6,
                border: '1px solid #BFDBFE',
                borderRadius: '100px',
                letterSpacing: '0.04em',
              }}
            />

            {/* Editorial Headline */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.85rem', sm: '2.6rem', md: '3.2rem' },
                lineHeight: { xs: 1.25, md: 1.2 },
                maxWidth: 960,
                letterSpacing: '-0.025em',
              }}
            >
              {t('aboutUsPage.heroTitle', {
                defaultValue: 'Tái Định Nghĩa Tuyển Dụng Kỹ Thuật Bằng Dữ Liệu Thực & Voice AI Minh Bạch',
              })}
            </Typography>

            {/* Grounded, authentic narrative lead */}
            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                maxWidth: 780,
                mx: 'auto',
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                lineHeight: 1.75,
              }}
            >
              {t('aboutUsPage.heroLead', {
                defaultValue:
                  'InfoHR được phát triển nhằm giải quyết triệt để sự đứt gãy giữa bằng cấp danh nghĩa và năng lực thực chiến tại Việt Nam. Chúng tôi xây dựng chuẩn mực tuyển dụng chuyên sâu cho 4 khối ngành kinh tế kỹ thuật trọng điểm — kết hợp sàn kết nối hồ sơ xác thực và trợ lý phỏng vấn giọng nói AILA 24/7.',
              })}
            </Typography>

            {/* 4 Concrete Identity Anchors */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              gap={1.25}
              sx={{ pt: 1, pb: 1.5 }}
            >
              <Chip
                icon={<Building2 size={16} className="text-slate-700" />}
                label={t('aboutUsPage.badges.squareGroup', { defaultValue: 'Hệ sinh thái InfoHR' })}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid #CBD5E1',
                  py: 1.8,
                  px: 0.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
              <Chip
                icon={<Radio size={16} className="text-red-600" />}
                label={t('aboutUsPage.badges.webrtc', { defaultValue: 'Hạ tầng WebRTC Voice AI' })}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid #CBD5E1',
                  py: 1.8,
                  px: 0.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
              <Chip
                icon={<ShieldCheck size={16} className="text-emerald-600" />}
                label={t('aboutUsPage.badges.verified', { defaultValue: '100% Hồ sơ thẩm định năng lực' })}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid #CBD5E1',
                  py: 1.8,
                  px: 0.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
              <Chip
                icon={<HardHat size={16} className="text-blue-600" />}
                label={t('aboutUsPage.badges.fourIndustries', { defaultValue: 'Chuyên sâu 4 ngành kỹ thuật' })}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  border: '1px solid #CBD5E1',
                  py: 1.8,
                  px: 0.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
            </Stack>

            {/* Clear Action CTAs */}
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
                endIcon={<ArrowRight size={18} />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 1.4,
                  px: 3.5,
                  borderRadius: '10px',
                  boxShadow: '0 6px 20px -4px rgba(37, 99, 235, 0.35)',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                {t('aboutUsPage.heroCtaPrimary', { defaultValue: 'Khám Phá Việc Làm Kỹ Thuật' })}
              </Button>

              <Button
                variant="outlined"
                component="a"
                href="https://aila.infohr.vn/"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<ExternalLink size={17} />}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 1.4,
                  px: 3,
                  borderRadius: '10px',
                  textTransform: 'none',
                  bgcolor: '#FFFFFF',
                  '&:hover': {
                    bgcolor: '#F1F5F9',
                    borderColor: '#94A3B8',
                  },
                }}
              >
                {t('aboutUsPage.heroCtaSecondary', { defaultValue: 'Trải Nghiệm AILA Voice AI' })}
              </Button>
            </Stack>
          </Stack>

          {/* Hero Ecosystem Diagram Showcase */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: '16px', md: '20px' },
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
              mt: { xs: 3, md: 5 },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 240, sm: 380, md: 500 },
              }}
            >
              <Image
                src="/images/about/about_hero_ecosystem.webp"
                alt="Kiến trúc hệ sinh thái InfoHR Tuyển dụng & AILA Voice AI"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                style={{ objectFit: 'cover' }}
              />

              {/* Floating Architectural Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 12, md: 20 },
                  left: { xs: 12, md: 20 },
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  borderRadius: '100px',
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 0.6, md: 0.8 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <Cpu size={16} className="text-blue-400" />
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', md: '0.85rem' }, color: '#FFFFFF' }}>
                  Hệ Sinh Thái Tuyển Dụng Chuyên Ngành & HRM 2.0
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 2: BẢO CHỨNG BẰNG CON SỐ THỰC TẾ (REAL METRICS) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 8 }, mb: { xs: 6, md: 9 } }}>
        <Grid container className="gsap-stats-grid" spacing={{ xs: 2, md: 3 }}>
          {statsList.map((stat, idx) => (
            <Grid key={idx} size={{ xs: 6, md: 3 }}>
              <Card
                className="gsap-stat-card"
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  textAlign: 'left',
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: '#93C5FD',
                    boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: idx === 1 ? '#0F172A' : idx === 2 ? '#059669' : '#2563EB',
                    fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.5rem' },
                    lineHeight: 1.1,
                    mb: 0.5,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {stat.num}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: { xs: '0.85rem', sm: '0.92rem' } }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, fontSize: '0.8rem' }}>
                  {stat.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 3: BÀI TOÁN THỰC TẾ & NGUỒN CỘI RA ĐỜI (THE MARKET FRICTION) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        className="gsap-problem-section"
        sx={{
          py: { xs: 6, md: 10 },
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          mb: { xs: 7, md: 11 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
            <Chip
              label={t('aboutUsPage.problemSection.tag', { defaultValue: 'BÀI TOÁN THỰC TẾ & NGUỒN CỘI' })}
              sx={{
                bgcolor: '#F1F5F9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #CBD5E1',
                borderRadius: '100px',
                letterSpacing: '0.04em',
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.3rem' }, letterSpacing: '-0.02em' }}>
              {t('aboutUsPage.problemSection.title', { defaultValue: 'Vì Sao Thị Trường Cần Một Nền Tảng Như InfoHR?' })}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 760, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              {t('aboutUsPage.problemSection.description', {
                defaultValue:
                  'Thị trường tuyển dụng truyền thống đang lãng phí hàng triệu giờ lao động vì cơ chế sàng lọc dàn trải và khủng hoảng \'CV ảo\'.',
              })}
            </Typography>
          </Stack>

          {/* Comparative 2-Column Editorial Grid */}
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Cột 1: Thực trạng truyền thống */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                className="gsap-problem-card"
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '16px',
                  bgcolor: '#FFFDFD',
                  border: '1px solid #FECACA',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#FEE2E2', color: '#DC2626', width: 44, height: 44, borderRadius: '10px' }}>
                    <AlertCircle size={22} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#991B1B', fontSize: '1.15rem' }}>
                      {t('aboutUsPage.problemSection.traditionalTitle', { defaultValue: 'Nghịch lý của tuyển dụng truyền thống' })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 600 }}>
                      Sự lãng phí nguồn lực & khủng hoảng niềm tin
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                  {traditionalPains.map((pain, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: '10px', bgcolor: '#FFFFFF', border: '1px solid #FEE2E2' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, fontSize: '0.95rem' }}>
                        {idx + 1}. {pain.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.88rem' }}>
                        {pain.desc}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* Cột 2: Chuẩn mực giải pháp InfoHR */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                className="gsap-problem-card"
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: '16px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #BFDBFE',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 44, height: 44, borderRadius: '10px' }}>
                    <CheckCircle2 size={22} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E40AF', fontSize: '1.15rem' }}>
                      {t('aboutUsPage.problemSection.solutionTitle', { defaultValue: 'Chuẩn mực giải pháp từ InfoHR' })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                      Dữ liệu thực, phỏng vấn tự động & đánh giá khách quan
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                  {solutionPoints.map((sol, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: '10px', bgcolor: '#FFFFFF', border: '1px solid #DBEAFE' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, fontSize: '0.95rem' }}>
                        ✓ {sol.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontSize: '0.88rem' }}>
                        {sol.desc}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 4: TẠI SAO LÀ 4 NGÀNH KỸ THUẬT TRỌNG ĐIỂM? */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
        <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
          <Chip
            label={t('aboutUsPage.industriesSection.tag', { defaultValue: 'CHIẾN LƯỢC TRỌNG TÂM' })}
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid #DBEAFE',
              borderRadius: '100px',
              letterSpacing: '0.04em',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.3rem' }, letterSpacing: '-0.02em' }}>
            {t('aboutUsPage.industriesSection.title', { defaultValue: 'Chuyên Sâu 4 Khối Ngành Kinh Tế Kỹ Thuật Trọng Điểm' })}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 800, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            {t('aboutUsPage.industriesSection.description', {
              defaultValue:
                'Thay vì dàn trải đa ngành, InfoHR tập trung giải quyết chiều sâu cho 4 lĩnh vực đòi hỏi chứng chỉ hành nghề pháp lý và tiêu chuẩn kỹ thuật khắt khe nhất Việt Nam.',
            })}
          </Typography>
        </Stack>

        <Grid container className="gsap-industries-grid" spacing={{ xs: 2.5, md: 3 }}>
          {industryItems.map((item) => {
            const IconComponent = INDUSTRY_ICONS[item.id] || HardHat;
            return (
              <Grid key={item.id} size={{ xs: 12, md: 6 }}>
                <Card
                  className="gsap-industry-card"
                  elevation={0}
                  sx={{
                    p: { xs: 3, sm: 3.5 },
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#93C5FD',
                      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#EFF6FF', color: '#2563EB', width: 48, height: 48, borderRadius: '12px' }}>
                      <IconComponent size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'block' }}>
                        {item.roles}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 1, p: 2, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      Thách thức tuyển dụng thực địa:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontSize: '0.88rem' }}>
                      {item.challenge}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 'auto', p: 2, borderRadius: '10px', bgcolor: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                      Giải pháp InfoHR chuyên biệt:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#15803D', lineHeight: 1.6, fontSize: '0.88rem' }}>
                      {item.solution}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 5: BẢN ĐỒ 4 PHÂN HỆ TRỰC THUỘC HỆ SINH THÁI (CONCRETE URLS) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 10 },
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          mb: { xs: 7, md: 11 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
            <Chip
              label={t('aboutUsPage.ecosystemSection.tag', { defaultValue: 'HỆ SINH THÁI KHÉP KÍN' })}
              sx={{
                bgcolor: '#F1F5F9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #CBD5E1',
                borderRadius: '100px',
                letterSpacing: '0.04em',
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.3rem' }, letterSpacing: '-0.02em' }}>
              {t('aboutUsPage.ecosystemSection.title', { defaultValue: 'Bản Đồ 4 Phân Hệ Trực Thuộc Hệ Sinh Thái InfoHR' })}
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 760, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              {t('aboutUsPage.ecosystemSection.description', {
                defaultValue:
                  'Mỗi phân hệ đảm nhận một mắt xích chuyên biệt trong chuỗi giá trị nhân sự, kết nối đồng bộ theo thời gian thực.',
              })}
            </Typography>
          </Stack>

          <Grid container className="gsap-nodes-grid" spacing={{ xs: 2.5, md: 3 }}>
            {ecosystemItems.map((item, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  className="gsap-node-card"
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#2563EB',
                      boxShadow: '0 10px 25px rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <Chip
                    label={item.subdomain}
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: idx === 2 ? '#DC2626' : '#2563EB',
                      bgcolor: idx === 2 ? '#FEF2F2' : '#EFF6FF',
                      border: idx === 2 ? '1px solid #FECACA' : '1px solid #DBEAFE',
                      mb: 2,
                    }}
                  />

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', mb: 1.25 }}>
                    {item.name}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.65, fontSize: '0.88rem', mb: 3, flexGrow: 1 }}>
                    {item.desc}
                  </Typography>

                  <Button
                    variant="text"
                    component="a"
                    href={getSafeExternalOpenUrl(item.url)}
                    target={item.target}
                    rel="noopener noreferrer"
                    endIcon={<ExternalLink size={15} />}
                    sx={{
                      alignSelf: 'flex-start',
                      p: 0,
                      fontWeight: 700,
                      color: idx === 2 ? '#DC2626' : '#2563EB',
                      textTransform: 'none',
                      fontSize: '0.88rem',
                      '&:hover': {
                        bgcolor: 'transparent',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Truy cập {item.subdomain}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 6: MINH BẠCH CÔNG NGHỆ & AI CÓ ĐẠO ĐỨC (RESPONSIBLE AI) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
        <Stack spacing={1.5} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
          <Chip
            label={t('aboutUsPage.technologySection.tag', { defaultValue: 'MINH BẠCH CÔNG NGHỆ' })}
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid #DBEAFE',
              borderRadius: '100px',
              letterSpacing: '0.04em',
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.75rem', md: '2.3rem' }, letterSpacing: '-0.02em' }}>
            {t('aboutUsPage.technologySection.title', { defaultValue: 'Kiến Trúc Thực Chiến & Nguyên Tắc AI Có Trách Nhiệm' })}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 800, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            {t('aboutUsPage.technologySection.description', {
              defaultValue:
                'Chúng tôi không coi AI là \'chiếc đũa thần\', mà là trợ lý chuẩn hóa, khách quan và minh bạch để bảo vệ lợi ích của cả ứng viên và doanh nghiệp.',
            })}
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {techCards.map((card, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: { xs: 3, sm: 3.5 },
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: idx === 0 ? '#EFF6FF' : idx === 1 ? '#FEF2F2' : '#F0FDF4',
                    color: idx === 0 ? '#2563EB' : idx === 1 ? '#DC2626' : '#16A34A',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    mb: 2,
                  }}
                >
                  {idx === 0 ? <Radio size={22} /> : idx === 1 ? <Scale size={22} /> : <Lock size={22} />}
                </Avatar>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', mb: 1.25 }}>
                  {card.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.9rem' }}>
                  {card.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PHẦN 7: ĐƠN VỊ PHÁT TRIỂN & BANNER CTA */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg">
        {/* InfoHR Technology Corporate Credibility Box */}
        <Box
          sx={{
            p: { xs: 3.5, sm: 5 },
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            mb: { xs: 5, md: 7 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Chip
                label={t('aboutUsPage.corporateSection.tag', { defaultValue: 'ĐƠN VỊ PHÁT TRIỂN' })}
                size="small"
                sx={{
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  mb: 1.5,
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' }, mb: 1.25 }}>
                {t('aboutUsPage.corporateSection.companyName', { defaultValue: 'InfoHR Technology — Kiến Tạo Giải Pháp Chuyển Đổi Số' })}
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {t('aboutUsPage.corporateSection.companyDesc', {
                  defaultValue:
                    'InfoHR là nền tảng chiến lược trong lĩnh vực công nghệ nhân sự (HRTech). Với nền tảng kỹ thuật vững chắc và bề dày kinh nghiệm đồng hành cùng các doanh nghiệp hàng đầu tại Việt Nam, InfoHR cam kết đem lại giá trị bền vững và sự minh bạch cho thị trường tuyển dụng.',
                })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <ShieldCheck size={28} className="text-blue-600" />
                <Box textAlign="left">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Cam Kết Chất Lượng
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Bảo hành tuyển dụng & hỗ trợ 24/7
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* High-End Editorial CTA Banner */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: '20px', md: '24px' },
            overflow: 'hidden',
            minHeight: { xs: 400, md: 340 },
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
          }}
        >
          {/* Background Image */}
          <Image
            src="/images/about/about_cta_banner.webp"
            alt="Đội ngũ nhân sự chuyên nghiệp cùng hệ thống InfoHR"
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
                md: 'linear-gradient(90deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.88) 55%, rgba(37, 99, 235, 0.35) 85%, rgba(37, 99, 235, 0) 100%)',
              },
            }}
          />

          {/* Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              p: { xs: 3.5, sm: 5, md: 6 },
              maxWidth: { xs: '100%', md: 680 },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '1.6rem', sm: '2rem', md: '2.3rem' },
                lineHeight: 1.25,
                mb: 1.5,
              }}
            >
              {t('aboutUsPage.ctaSection.title', { defaultValue: 'Sẵn Sàng Đồng Hành Cùng Chuẩn Mực Tuyển Dụng Mới?' })}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#CBD5E1',
                fontSize: { xs: '0.92rem', sm: '1.02rem' },
                lineHeight: 1.65,
                mb: 3.5,
              }}
            >
              {t('aboutUsPage.ctaSection.desc', {
                defaultValue:
                  'Cho dù bạn là kỹ sư đang tìm kiếm bến đỗ xứng tầm hay doanh nghiệp đang khát khao nhân sự tinh nhuệ, InfoHR luôn sẵn sàng đồng hành.',
              })}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant="contained"
                component={Link}
                href="/jobs"
                endIcon={<ArrowRight size={18} />}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#1D4ED8',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  py: 1.4,
                  px: 3.5,
                  borderRadius: '10px',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#EFF6FF',
                    color: '#1E40AF',
                  },
                }}
              >
                {t('aboutUsPage.ctaSection.candidateCta', { defaultValue: 'Khám Phá Việc Làm Kỹ Thuật' })}
              </Button>

              <Button
                variant="outlined"
                component="a"
                href="https://ntd.infohr.vn"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<ExternalLink size={16} />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  py: 1.4,
                  px: 3,
                  borderRadius: '10px',
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.18)',
                  },
                }}
              >
                {t('aboutUsPage.ctaSection.employerCta', { defaultValue: 'Đăng Ký Nhà Tuyển Dụng' })}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
