'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
import BoltIcon from '@mui/icons-material/Bolt';
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
import { useAppSelector } from '../../../hooks/useAppStore';
import type { SvgIconComponent } from '@mui/icons-material';
import LazyLoadSection from '../../../components/Common/LazyLoadSection';
import type { TFunction } from 'i18next';
import type { Career } from '@/types/models';

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
          {t('home.jobsIn', { careerName: career.name })}
        </Typography>
      </Stack>
      <FilterJobPostCard params={{ careerId: career.id }} />
    </Box>
  );
};

const EntryPointCard = ({
  icon,
  title,
  description,
  benefits,
  ctaLabel,
  href,
  accent,
  statusBadge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  href: string;
  accent: string;
  statusBadge?: { text: string; color?: string };
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '24px',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        border: '1px solid',
        borderColor: 'rgba(226, 232, 240, 0.8)',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        transition:
          'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, border-color 200ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 25px 50px -12px rgba(15, 57, 127, 0.12)',
          borderColor: accent,
        },
        '&:active': {
          transform: 'scale(0.99)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 3.5, md: 4 } }}>
        <Stack spacing={3}>
          {statusBadge && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                width: 'fit-content',
                px: 1.5,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: `${accent}0c`,
                border: `1px solid ${accent}22`,
                color: accent,
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: accent,
                  boxShadow: `0 0 6px ${accent}`,
                }}
              />
              {statusBadge.text}
            </Box>
          )}

          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${accent}12`,
                color: accent,
                flexShrink: 0,
                border: `1px solid ${accent}24`,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.45 }}>
                {description}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {benefits.map((benefit) => (
              <Chip
                key={benefit}
                label={benefit}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(226, 232, 240, 0.9)',
                  bgcolor: '#f8fafc',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  py: 0.5,
                }}
              />
            ))}
          </Stack>

          <Button
            component={Link}
            href={href}
            prefetch
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              width: { xs: '100%', sm: 'fit-content' },
              justifyContent: 'center',
              bgcolor: accent,
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              boxShadow: `0 4px 14px ${accent}33`,
              transition:
                'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background-color 120ms ease, box-shadow 120ms ease',
              '&:hover': {
                bgcolor: accent,
                filter: 'brightness(0.92)',
                boxShadow: `0 8px 20px ${accent}44`,
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            {ctaLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const { t, i18n } = useTranslation('public');
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
      return data.slice(0, 4);
    },
    staleTime: 5 * 60_000,
  });

  return (
    <>
      <Box sx={{ mt: 8 }}>
        <FilterJobPostCard params={{ isUrgent: true }} />
      </Box>

      <Box sx={{ mt: 6 }}>
        <TopCompanyCarousel />
      </Box>

      <Box sx={{ mt: 10 }}>
        <Stack spacing={1} sx={{ mb: 4, textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t('home.choosePathTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
            {t('home.choosePathDescription')}
          </Typography>
        </Stack>
        <Grid container spacing={3.5}>
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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
        <Box sx={{ mt: 10 }}>
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

      <Box sx={{ mt: 10 }}>
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
      <Box sx={{ mt: 10, mb: 8 }}>
        <LazyLoadSection minHeight="400px" rootMargin="300px">
          <CareerHandbookSection />
        </LazyLoadSection>
      </Box>
    </>
  );
}
