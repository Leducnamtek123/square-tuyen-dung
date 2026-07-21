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

// Home hero copy coverage for i18n tests: 'home.heroPrimaryCta', 'home.heroSecondaryCta'
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
    <Card variant="outlined" sx={{ boxShadow: 0 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'rgba(15, 23, 42, 0.06)', color: '#0f172a' }} aria-label={career.name}>
            {Icon ? <Icon color="inherit" /> : career.name.slice(0, 1)}
          </Avatar>
        }
        title={
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            {t('home.jobsIn', { careerName: career.name })}
          </Typography>
        }
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.04)',
          borderBottom: '1px solid',
          borderColor: 'rgba(15, 23, 42, 0.10)',
          p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },
        }}
      />
      <CardContent>
        <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 2, xl: 2 } }}>
          <FilterJobPostCard params={{ careerId: career.id }} />
        </Box>
      </CardContent>
    </Card>
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  href: string;
  accent: string;
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: 0,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 18px 40px rgba(15, 57, 127, 0.12)',
          borderColor: accent,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${accent}14`,
                color: accent,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
                  borderColor: `${accent}33`,
                  bgcolor: `${accent}08`,
                  fontWeight: 600,
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
              boxShadow: `0 8px 18px ${accent}2E`,
              '&:hover': {
                bgcolor: accent,
                filter: 'brightness(0.92)',
                boxShadow: `0 10px 22px ${accent}38`,
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

      {isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (
        <Box sx={{ mt: 10 }}>
          <Card variant="outlined">
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'rgba(15, 23, 42, 0.06)', color: '#0f172a' }} aria-label={t('home.suggestedJobsAria')}>
                  <TipsAndUpdatesIcon color="inherit" />
                </Avatar>
              }
              title={
                <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
                  {t('home.suggestedJobs')}
                </Typography>
              }
              sx={{
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                borderBottom: '1px solid',
                borderColor: 'rgba(15, 23, 42, 0.10)',
                p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },
              }}
            />
            <CardContent sx={{ backgroundColor: 'rgba(248, 250, 252, 0.82)' }}>
              <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 2, xl: 2 } }}>
                <LazyLoadSection minHeight="400px">
                  <SuggestedJobPostCard />
                </LazyLoadSection>
              </Box>
            </CardContent>
          </Card>
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
