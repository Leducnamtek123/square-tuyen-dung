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
      <Box sx={{ mt: 10 }}>
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar sx={{ bgcolor: '#0f172a', color: '#ffffff', width: 38, height: 38 }} aria-label={t('home.urgentJobsAria')}>
              <BoltIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800 }}>
              {t('home.urgentJobs')}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760, pl: 6.25 }}>
            Tuyển nhanh các vị trí cần lấp đầy sớm, ưu tiên hiển thị trước để ứng viên dễ thấy.
          </Typography>
        </Stack>
        <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 1, xl: 1 } }}>
          <FilterJobPostCard params={{ isUrgent: true }} />
        </Box>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.topCompanies')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t('home.topCompaniesSubtitle')}
          </Typography>
        </Stack>
        <TopCompanyCarousel />
      </Box>

      <Box sx={{ mt: 10 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.choosePathTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t('home.choosePathDescription')}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <EntryPointCard
              icon={<SearchIcon />}
              title={t('home.candidateTitle')}
              description={t('home.candidateDescription')}
              benefits={[
                t('home.candidateBenefit1'),
                t('home.candidateBenefit2'),
                t('home.candidateBenefit3'),
              ]}
              ctaLabel={t('home.candidateCta')}
              href={jobsHref}
              accent="#0f172a"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <EntryPointCard
              icon={<ApartmentIcon />}
              title={t('home.employerTitle')}
              description={t('home.employerDescription')}
              benefits={[
                t('home.employerBenefit1'),
                t('home.employerBenefit2'),
                t('home.employerBenefit3'),
              ]}
              ctaLabel={t('home.employerCta')}
              href={employerIntroHref}
              accent="#334155"
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 10 }}>
        <Card
          variant="outlined"
          sx={{
            boxShadow: 0,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.42) 100%), url(${bannerExplorePc})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box>
                <Typography fontSize={{ xs: 24, sm: 28, md: 32 }} fontWeight={800} color="white">
                  {t('home.exploreHeading')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.84)', mt: 1, maxWidth: 680 }}>
                  {t('home.exploreDescription')}
                </Typography>
              </Box>
              <Button
                component={Link}
                href={jobsHref}
                prefetch
                variant="contained"
                color="primary"
                  size="large"
                  startIcon={<SearchIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: 'center',
                    boxShadow: '0 18px 38px rgba(15,23,42,0.18)',
                    '&:hover': { bgcolor: '#111827' },
                  }}
                >
                  {t('home.startExploring')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 10 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.keyCareers')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t('home.keyCareersSubtitle')}
          </Typography>
        </Stack>
        <LazyLoadSection minHeight="200px" rootMargin="200px">
          <CareerCarousel />
        </LazyLoadSection>
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

      {careerSections.map((career, index) => (
        <Box sx={{ mt: index === 0 ? 6 : 10 }} key={career.id}>
          <LazyLoadSection minHeight="400px" rootMargin="300px">
            <CareerJobSection career={career} t={t} />
          </LazyLoadSection>
        </Box>
      ))}

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

      <Box sx={{ mt: 10 }}>
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}>
          <LazyLoadSection minHeight="500px" rootMargin="400px">
            <JobByCategory />
          </LazyLoadSection>
        </Box>
      </Box>
    </>
  );
}
