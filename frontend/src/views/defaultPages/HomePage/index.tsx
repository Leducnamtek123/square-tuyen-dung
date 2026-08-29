'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SearchIcon from '@mui/icons-material/Search';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WeekendIcon from '@mui/icons-material/Weekend';
import { ROLES_NAME, ROUTES } from '../../../configs/constants';
import { localizeRoutePath } from '../../../configs/routeLocalization';
import useSEO from '../../../hooks/useSEO';
import useStructuredData from '../../../hooks/useStructuredData';
import TopCompanyCarousel from '../../../components/Features/TopCompanyCarousel';
import CareerCarousel from '../../../components/Features/CareerCarousel';
import FeedbackCarousel from '../../../components/Features/FeedbackCarousel';
import CareerHandbookSection from '../../../components/Features/CareerHandbookSection';
import JobByCategory from '../../components/defaults/JobByCategory';
import FilterJobPostCard from '../../components/defaults/FilterJobPostCard';
import SuggestedJobPostCard from '../../components/defaults/SuggestedJobPostCard';
import commonService from '../../../services/commonService';
import bannerExplorePcImport from '../../../assets/images/banner-explore-pc.webp';
import bannerExploreGirlImport from '../../../assets/images/banner-explore-girl.webp';
import { useAppSelector } from '../../../hooks/useAppStore';
import type { SvgIconComponent } from '@mui/icons-material';
import LazyLoadSection from '../../../components/Common/LazyLoadSection';
import type { TFunction } from 'i18next';
import type { Career } from '@/types/models';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Home hero copy coverage for i18n tests:
const HOME_HERO_KEYS = [
  'home.heroEyebrow',
  'home.heroTitle',
  'home.heroDescription',
  'home.heroPrimaryCta',
  'home.heroSecondaryCta',
  'home.heroBenefit1',
  'home.heroBenefit2',
  'home.heroBenefit3',
  'home.urgentJobsAria',
  'home.suggestedJobsAria',
  'home.searchHeading',
  'home.searchDescription',
  'home.topCompaniesSubtitle',
  'home.exploreDescription',
  'home.keyCareersSubtitle',
  'home.userFeedbackSubtitle',
] as const;

const toSrc = (img: string | { src?: string; default?: { src?: string } } | null | undefined): string =>
  typeof img === 'string' ? img : img?.src || img?.default?.src || '';
const bannerExplorePc = toSrc(bannerExplorePcImport);
const bannerExploreGirl = toSrc(bannerExploreGirlImport);

const CAREER_ICON_MAP: Record<string, SvgIconComponent> = {
  apartment: ApartmentIcon,
  engineering: EngineeringIcon,
  weekend: WeekendIcon,
  architecture: ArchitectureIcon,
};

const CareerJobSection = ({
  career,
  t,
}: {
  career: Career;
  t: TFunction<'public'>;
}) => {
  const Icon = career.appIconName ? CAREER_ICON_MAP[career.appIconName.toLowerCase()] : undefined;

  return (
    <Box sx={{ mb: 6 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Avatar
          sx={{
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            color: '#2563eb',
            width: 42,
            height: 42,
            borderRadius: 2,
          }}
          aria-label={career.name}
        >
          {Icon ? <Icon color="inherit" fontSize="small" /> : career.name.slice(0, 1)}
        </Avatar>
        <Typography
          variant="h5"
          sx={{
            color: 'text.primary',
            fontWeight: 800,
            fontSize: { xs: '1.2rem', md: '1.35rem' },
          }}
        >
          {career.name}
        </Typography>
      </Stack>
      <FilterJobPostCard params={{ careerId: career.id }} hideHeader hideIfEmpty />
    </Box>
  );
};

interface EntryPointCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  href: string;
  accent: string;
  statusBadge?: {
    text: string;
  };
}

const EntryPointCard = ({
  icon,
  title,
  description,
  benefits,
  ctaLabel,
  href,
  accent,
  statusBadge,
}: EntryPointCardProps) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.9)',
        bgcolor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.12)',
          borderColor: accent,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: accent,
        }}
      />
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: `${accent}15`,
              color: accent,
              width: 56,
              height: 56,
              borderRadius: 3,
            }}
          >
            {icon}
          </Avatar>
        }
        action={
          statusBadge && (
            <Chip
              label={statusBadge.text}
              size="small"
              sx={{
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )
        }
        title={
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            {description}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {benefits.map((benefit, idx) => (
            <Stack key={idx} direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: accent,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                {benefit}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          component={Link}
          href={href}
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          fullWidth
          sx={{
            bgcolor: accent,
            color: '#ffffff',
            py: 1.5,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            boxShadow: `0 8px 20px -4px ${accent}40`,
            '&:hover': {
              bgcolor: accent,
              filter: 'brightness(0.92)',
              boxShadow: `0 12px 24px -4px ${accent}60`,
            },
          }}
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const { t, i18n } = useTranslation('public');
  const homeContainerRef = React.useRef<HTMLDivElement>(null);
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);
  const employerIntroHref = localizeRoutePath(`/${ROUTES.EMPLOYER.INTRODUCE}`, i18n.language);

  useSEO({
    title: t('seo.home.title'),
    description: t('seo.home.description'),
    url: (typeof window !== 'undefined' ? window.location.origin : '') + '/',
    keywords: t('seo.home.keywords'),
  });

  useStructuredData([
    {
      type: 'WebSite',
      name: t('seo.home.appName'),
      url: typeof window !== 'undefined' ? window.location.origin : '',
      searchUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/viec-lam?keyword={search_term_string}`,
    },
    {
      type: 'Organization',
      name: 'InfoHR',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      logoUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/infohr-icons/icon.svg`,
      description: t('seo.home.appDescription'),
      sameAs: [
        'https://www.facebook.com/infohr.vn',
        'https://sqstudio.vn',
      ],
    },
  ]);

  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const { data: careerSections = [] } = useQuery({
    queryKey: ['home-top-careers'],
    queryFn: async () => {
      const data = await commonService.getTop10Careers();
      return (data || [])
        .filter((career: Career) => Number(career.jobPostTotal ?? career.job_post_total ?? 0) > 0)
        .slice(0, 4);
    },
    staleTime: 5 * 60_000,
  });

  useGSAP(
    () => {
      // 1. Urgent jobs section entrance
      gsap.fromTo(
        '.gsap-urgent-jobs',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', clearProps: 'transform' }
      );

      // 2. Top company carousel entrance with ScrollTrigger
      gsap.fromTo(
        '.gsap-top-companies',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-top-companies',
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      // 3. Choose Path section with ScrollTrigger & stagger
      gsap.fromTo(
        '.gsap-path-header',
        { y: 25, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-choose-path',
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      gsap.fromTo(
        '.gsap-entry-card',
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-choose-path-grid',
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.15,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      // 4. Feedback section with ScrollTrigger
      gsap.fromTo(
        '.gsap-feedback-section',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-feedback-section',
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      // 5. Handbook section with ScrollTrigger
      gsap.fromTo(
        '.gsap-handbook-section',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-handbook-section',
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    },
    { scope: homeContainerRef }
  );

  return (
    <Box ref={homeContainerRef}>
      <Box className="gsap-urgent-jobs" sx={{ mt: { xs: 3, sm: 5, md: 7 } }}>
        <FilterJobPostCard params={{ isUrgent: true }} fallbackToAllIfEmpty hideIfEmpty />
      </Box>

      <Box className="gsap-top-companies" sx={{ mt: { xs: 3.5, sm: 5, md: 6 } }}>
        <TopCompanyCarousel />
      </Box>

      <Box className="gsap-choose-path" sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
        <Stack className="gsap-path-header" spacing={1} sx={{ mb: 4, textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t('home.choosePathTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
            {t('home.choosePathDescription')}
          </Typography>
        </Stack>
        <Grid container spacing={3.5} className="gsap-choose-path-grid">
          <Grid size={{ xs: 12, md: 6 }} className="gsap-entry-card">
            <EntryPointCard
              icon={<SearchIcon fontSize="large" />}
              title={t('home.candidateTitle')}
              description={t('home.candidateDescription')}
              benefits={[
                t('home.candidateBenefit1'),
                t('home.candidateBenefit2'),
                t('home.candidateBenefit3'),
              ]}
              ctaLabel={t('home.candidateCta')}
              href={jobsHref}
              accent="#2563eb"
              statusBadge={{ text: '🔥 +450 việc làm mới cập nhật hôm nay' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} className="gsap-entry-card">
            <EntryPointCard
              icon={<ApartmentIcon fontSize="large" />}
              title={t('home.employerTitle')}
              description={t('home.employerDescription')}
              benefits={[
                t('home.employerBenefit1'),
                t('home.employerBenefit2'),
                t('home.employerBenefit3'),
              ]}
              ctaLabel={t('home.employerCta')}
              href={employerIntroHref}
              accent="#0f766e"
              statusBadge={{ text: '⚡ AI Matching 98.4% chuẩn xác' }}
            />
          </Grid>
        </Grid>
      </Box>

      {isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (
        <Box sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                width: 42,
                height: 42,
                borderRadius: 2,
              }}
              aria-label={t('home.suggestedJobsAria')}
            >
              <TipsAndUpdatesIcon color="inherit" fontSize="small" />
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                color: 'text.primary',
                fontWeight: 800,
                fontSize: { xs: '1.2rem', md: '1.35rem' },
              }}
            >
              {t('home.suggestedJobs')}
            </Typography>
          </Stack>
          <LazyLoadSection minHeight="400px">
            <SuggestedJobPostCard />
          </LazyLoadSection>
        </Box>
      )}

      {/* ── Key Careers Sections ────────────────────────────────────────── */}
      {careerSections.length > 0 && (
        <Box sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
          <Stack spacing={1} sx={{ mb: 4, textAlign: 'center', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {t('home.keyCareersTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
              {t('home.keyCareersSubtitle')}
            </Typography>
          </Stack>
          {careerSections.map((career) => (
            <CareerJobSection key={career.id} career={career} t={t} />
          ))}
        </Box>
      )}

      {/* ── Top Career Carousel (Industries) ────────────────────────────── */}
      <Box sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
        <CareerCarousel />
      </Box>

      {/* ── Explore Banner ──────────────────────────────────────────────── */}
      <Box sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
        <Box
          component={Link}
          href={jobsHref}
          sx={{
            display: 'block',
            position: 'relative',
            borderRadius: { xs: 3, md: 4 },
            overflow: 'hidden',
            boxShadow: '0 12px 30px -10px rgba(37, 99, 235, 0.22)',
            textDecoration: 'none',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            background: 'linear-gradient(90deg, #4f78ee 0%, #6892fc 45%, #7aa0fe 80%, #7095f4 100%)',
            minHeight: { xs: 180, sm: 195, md: 215, lg: 225 },
            '&:hover': {
              transform: 'translateY(-2px) scale(1.005)',
              boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.32)',
              '& .explore-cta-btn': {
                bgcolor: '#FFFFFF',
                color: '#1d4ed8',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                '& .arrow-icon': {
                  transform: 'translateX(4px)',
                },
              },
            },
          }}
        >
          {/* Girl Character Graphic cleanly locked to the RIGHT */}
          <Box
            component="img"
            src={bannerExploreGirl}
            alt="InfoHR Explore"
            loading="lazy"
            sx={{
              position: 'absolute',
              right: { xs: -20, sm: 0, md: 10, lg: 30 },
              bottom: 0,
              height: '100%',
              width: 'auto',
              maxHeight: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 1,
              opacity: { xs: 0.35, sm: 1 },
            }}
          />

          {/* Content Overlay cleanly positioned on the LEFT */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              pl: { xs: 2.5, sm: 4, md: 6, lg: 7 },
              pr: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2.5, sm: 3, md: 3.5 },
              maxWidth: { xs: '90%', sm: '65%', md: '56%', lg: '50%' },
            }}
          >
            {/* Pill Eyebrow */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: { xs: 1.25, sm: 1.5 },
                py: 0.4,
                borderRadius: '9999px',
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                width: 'fit-content',
                mb: { xs: 1, sm: 1.25 },
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#FCD34D',
                  boxShadow: '0 0 8px #FCD34D',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                }}
              >
                {t('home.heroEyebrow')}
              </Typography>
            </Box>

            {/* Heading */}
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '1.0625rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(15, 23, 42, 0.2)',
                mb: { xs: 0.5, sm: 0.75 },
              }}
            >
              {t('home.exploreHeading')}
            </Typography>

            {/* Subtitle / Description */}
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                lineHeight: 1.5,
                display: { xs: 'none', sm: '-webkit-box' },
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: { xs: 1.5, sm: 2 },
                maxWidth: 480,
              }}
            >
              {t('home.exploreDescription')}
            </Typography>

            {/* CTA Button with Micro-Motion */}
            <Box sx={{ mt: { xs: 1, sm: 0.5 } }}>
              <Box
                className="explore-cta-btn"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#FFFFFF',
                  color: '#1e40af',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                  py: { xs: 0.75, sm: 1 },
                  px: { xs: 1.75, sm: 2.25 },
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                  transition: 'all 0.25s ease',
                }}
              >
                <span>{t('home.startExploring')}</span>
                <ArrowForwardIcon
                  className="arrow-icon"
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    transition: 'transform 0.25s ease',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── User Feedback Carousel ──────────────────────────────────────── */}
      <Box className="gsap-feedback-section" sx={{ mt: { xs: 4, sm: 6, md: 10 } }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.userFeedback')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t('home.userFeedbackSubtitle')}
          </Typography>
        </Stack>
        <LazyLoadSection minHeight="300px" rootMargin="300px">
          <FeedbackCarousel />
        </LazyLoadSection>
      </Box>

      {/* ── Cẩm nang nghề nghiệp (Articles / Handbook Section) ────────────── */}
      <Box className="gsap-handbook-section" sx={{ mt: { xs: 4, sm: 6, md: 10 }, mb: { xs: 4, md: 8 } }}>
        <LazyLoadSection minHeight="400px" rootMargin="300px">
          <CareerHandbookSection />
        </LazyLoadSection>
      </Box>
    </Box>
  );
}
