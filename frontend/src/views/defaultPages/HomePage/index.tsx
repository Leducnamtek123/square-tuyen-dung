'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
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
import JobByCategory from '../../components/defaults/JobByCategory';
import FilterJobPostCard from '../../components/defaults/FilterJobPostCard';
import SuggestedJobPostCard from '../../components/defaults/SuggestedJobPostCard';
import HomeSearch from '../../components/defaults/HomeSearch';
import commonService from '../../../services/commonService';
import bannerExploreImport from '../../../assets/images/banner-explore.webp';
import bannerExplorePcImport from '../../../assets/images/banner-explore-pc.webp';
import { useAppSelector } from '../../../hooks/useAppStore';
import type { SvgIconComponent } from '@mui/icons-material';
import LazyLoadSection from '../../../components/Common/LazyLoadSection';
import type { TFunction } from 'i18next';
import type { Career } from '@/types/models';

const toSrc = (img: string | { src?: string; default?: { src?: string } } | null | undefined): string =>
  typeof img === 'string' ? img : img?.src || img?.default?.src || '';
const bannerExplore = toSrc(bannerExploreImport);
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
          <Avatar sx={{ bgcolor: 'white' }} aria-label={career.name}>
            {Icon ? <Icon color="secondary" /> : career.name.slice(0, 1)}
          </Avatar>
        }
        title={
          <Typography variant="h5" sx={{ color: 'white' }}>
            {t('home.jobsIn', { careerName: career.name })}
          </Typography>
        }
        sx={{
          backgroundColor: 'primary.main',
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
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  onClick: () => void;
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

          <Button variant="contained" onClick={onClick} sx={{ width: 'fit-content' }}>
            {ctaLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const { t, i18n } = useTranslation('public');
  const { push } = useRouter();

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
      name: 'Square',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      logoUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/square-icons/logo.svg`,
      description: t('seo.home.appDescription'),
      sameAs: [
        'https://www.facebook.com/square.vn',
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
      <Box
        sx={{
          mt: 6,
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(15,57,127,0.98) 0%, rgba(26,64,125,0.92) 55%, rgba(42,169,225,0.92) 100%)',
          p: { xs: 2.5, sm: 3, md: 4 },
          color: 'white',
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
              {t('home.searchHeadline', 'Search jobs faster, apply smarter')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.84)', maxWidth: 760, mt: 1 }}>
              {t('home.searchSubheadline', 'Start with one search box, then save alerts, follow companies, and track roles that match your profile.')}
            </Typography>
          </Box>
          <HomeSearch />
        </Stack>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.topCompanies')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t(
              'home.topCompaniesSubtitle',
              'Khám phá doanh nghiệp đang tuyển và đi thẳng đến những cơ hội đáng chú ý nhất.'
            )}
          </Typography>
        </Stack>
        <TopCompanyCarousel />
      </Box>

      <Box sx={{ mt: 10 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.choosePathTitle', 'Bạn đang tìm gì?')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t(
              'home.choosePathDescription',
              'Chọn đúng lối đi ngay từ đầu để rút ngắn thời gian tìm việc hoặc tuyển dụng.'
            )}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <EntryPointCard
              icon={<SearchIcon />}
              title={t('home.candidateTitle', 'Dành cho ứng viên')}
              description={t(
                'home.candidateDescription',
                'Tìm công việc phù hợp theo nghề, thành phố và công ty trong vài thao tác.'
              )}
              benefits={[
                t('home.candidateBenefit1', 'Lọc theo ngành'),
                t('home.candidateBenefit2', 'Lưu và theo dõi job'),
                t('home.candidateBenefit3', 'Gợi ý phù hợp'),
              ]}
              ctaLabel={t('home.candidateCta', 'Khám phá việc làm')}
              onClick={() => push(localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language))}
              accent="#1e6bb8"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <EntryPointCard
              icon={<ApartmentIcon />}
              title={t('home.employerTitle', 'Dành cho nhà tuyển dụng')}
              description={t(
                'home.employerDescription',
                'Đăng tin, tìm hồ sơ và rút ngắn quy trình tuyển dụng với bộ công cụ dành cho doanh nghiệp.'
              )}
              benefits={[
                t('home.employerBenefit1', 'Đăng tin nhanh'),
                t('home.employerBenefit2', 'Tìm hồ sơ phù hợp'),
                t('home.employerBenefit3', 'Phỏng vấn hiệu quả'),
              ]}
              ctaLabel={t('home.employerCta', 'Xem giải pháp')}
              onClick={() => push(`/${ROUTES.EMPLOYER.INTRODUCE}`)}
              accent="#2aa9e1"
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
            backgroundImage: `linear-gradient(135deg, rgba(15,57,127,0.96) 0%, rgba(26,64,125,0.92) 60%, rgba(42,169,225,0.92) 100%), url(${bannerExplorePc})`,
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
                  {t(
                    'home.exploreDescription',
                    'Bắt đầu từ một nơi duy nhất để tìm việc, xem công ty, lọc theo ngành và đi nhanh đến hành động tiếp theo.'
                  )}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => push(localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language))}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                }}
              >
                {t('home.startExploring')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 10 }}>
        <Card variant="outlined" sx={{ boxShadow: 0 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'white' }} aria-label="urgent jobs">
                <AccessTimeIcon color="secondary" />
              </Avatar>
            }
            title={
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>
                {t('home.urgentJobs')}
              </Typography>
            }
            sx={{
              backgroundColor: 'primary.main',
              p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },
            }}
          />
          <CardContent>
            <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 2, xl: 2 } }}>
              <FilterJobPostCard params={{ isUrgent: true }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 10 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
            {t('home.keyCareers')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            {t(
              'home.keyCareersSubtitle',
              'Đi vào những nhóm nghề đang có nhu cầu cao để rút ngắn bước tìm kiếm.'
            )}
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
                <Avatar sx={{ bgcolor: 'white' }} aria-label="suggested jobs">
                  <TipsAndUpdatesIcon color="secondary" />
                </Avatar>
              }
              title={
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 800 }}>
                  {t('home.suggestedJobs')}
                </Typography>
              }
              sx={{
                backgroundImage: `url(${bannerExplore})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },
              }}
            />
            <CardContent sx={{ backgroundColor: 'primary.background' }}>
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
            {t(
              'home.userFeedbackSubtitle',
              'Đánh giá thật từ người dùng giúp landing page có thêm độ tin cậy.'
            )}
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
