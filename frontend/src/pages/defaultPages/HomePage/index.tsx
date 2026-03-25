import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Card, CardContent, CardHeader, Stack, Typography, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SearchIcon from "@mui/icons-material/Search";
import {
  HOME_FILTER_CAREER,
  ROLES_NAME,
  ROUTES,
} from "../../../configs/constants";
import useSEO from "../../../hooks/useSEO";
import useStructuredData from "../../../hooks/useStructuredData";
import TopCompanyCarousel from "../../../components/TopCompanyCarousel";
import CareerCarousel from "../../../components/CareerCarousel";
import FeedbackCarousel from "../../../components/FeedbackCarousel";
import JobByCategory from "../../components/defaults/JobByCategory";
import FilterJobPostCard from "../../components/defaults/FilterJobPostCard";
import SuggestedJobPostCard from "../../components/defaults/SuggestedJobPostCard";
import bannerExplore from '../../../assets/images/banner-explore.webp';
import bannerExplorePc from '../../../assets/images/banner-explore-pc.webp';
import { useAppSelector } from "../../../hooks/useAppStore";
import type { SvgIconComponent } from "@mui/icons-material";
import LazyLoadSection from "../../../components/LazyLoadSection";

/** Reusable section for career-filtered job listings */
const CareerJobSection = ({
  career,
  t,
}: {
  career: (typeof HOME_FILTER_CAREER)[number];
  t: (key: string, options?: Record<string, unknown>) => string;
}) => {
  const Icon = career.titleIcon;
  return (
    <Card variant="outlined" sx={{ boxShadow: 0 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "white" }} aria-label={career.name}>
            <Icon color="secondary" />
          </Avatar>
        }
        title={
          <Typography variant="h5" sx={{ color: "white" }}>
            {t('home.jobsIn', { careerName: career.name })}
          </Typography>
        }
        sx={{
          backgroundColor: "primary.main",
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

export default function HomePage() {
  const { t } = useTranslation('public');

  useSEO({
    title: 'Tìm việc nhanh, tuyển dụng hiệu quả',
    description: 'Square - Nền tảng tuyển dụng hàng đầu Việt Nam. Tìm kiếm hàng nghìn việc làm phù hợp, ứng tuyển nhanh chóng và kết nối với nhà tuyển dụng uy tín.',
    url: window.location.origin + '/',
    keywords: 'tìm việc, tuyển dụng, việc làm, ứng tuyển, nhà tuyển dụng, Square',
  });

  useStructuredData([
    {
      type: 'WebSite',
      name: 'Square Tuyển Dụng',
      url: window.location.origin,
      searchUrl: `${window.location.origin}/viec-lam?keyword={search_term_string}`,
    },
    {
      type: 'Organization',
      name: 'Square',
      url: window.location.origin,
      logoUrl: `${window.location.origin}/square-icons/logo.svg`,
      description: 'Nền tảng tuyển dụng trực tuyến hàng đầu Việt Nam',
      sameAs: [
        'https://www.facebook.com/square.vn',
        'https://sqstudio.vn',
      ],
    },
  ]);

  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const nav = useNavigate();

  return (
    <>
      <Box sx={{ mt: 6 }}>
        {/* Top Companies */}
        <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
          {t('home.topCompanies')}
        </Typography>
        <TopCompanyCarousel />
      </Box>

      <Box sx={{ mt: 10 }}>
        {/* Urgent Jobs */}
        <Card variant="outlined" sx={{ boxShadow: 0 }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: "white" }} aria-label="urgent jobs">
                <AccessTimeIcon color="secondary" />
              </Avatar>
            }
            title={
              <Typography variant="h5" sx={{ color: "white" }}>
                {t('home.urgentJobs')}
              </Typography>
            }
            sx={{
              backgroundColor: "primary.main",
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
        {/* Key Careers */}
        <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
          {t('home.keyCareers')}
        </Typography>
        <LazyLoadSection minHeight="200px" rootMargin="200px">
          <CareerCarousel />
        </LazyLoadSection>
      </Box>

      {isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (
        <Box sx={{ mt: 10 }}>
          {/* Suggested Jobs */}
          <Card variant="outlined">
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "white" }} aria-label="suggested jobs">
                  <TipsAndUpdatesIcon color="secondary" />
                </Avatar>
              }
              title={
                <Typography variant="h5" sx={{ color: "primary.main" }}>
                  {t('home.suggestedJobs')}
                </Typography>
              }
              sx={{
                backgroundImage: `url(${bannerExplore})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },
              }}
            />
            <CardContent sx={{ backgroundColor: "primary.background" }}>
              <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 2, xl: 2 } }}>
                <LazyLoadSection minHeight="400px">
                  <SuggestedJobPostCard />
                </LazyLoadSection>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box
        sx={{
          borderRadius: 1,
          p: 4,
          mt: 6,
          backgroundImage: `url(${bannerExplorePc})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography fontSize={32} fontWeight="bold" color="white">
              {t('home.exploreHeading')}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => nav(`/${ROUTES.JOB_SEEKER.JOBS}`)}
            >
              {t('home.startExploring')}
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Career Job Sections — deduplicated via map */}
      {HOME_FILTER_CAREER.map((career, index) => (
        <Box sx={{ mt: index === 0 ? 6 : 10 }} key={career.id}>
          <LazyLoadSection minHeight="400px" rootMargin="300px">
            <CareerJobSection career={career} t={t} />
          </LazyLoadSection>
        </Box>
      ))}

      <Box sx={{ mt: 10 }}>
        {/* User Feedback */}
        <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
          {t('home.userFeedback')}
        </Typography>
        <LazyLoadSection minHeight="300px" rootMargin="300px">
          <FeedbackCarousel />
        </LazyLoadSection>
      </Box>

      <Box sx={{ mt: 10 }}>
        {/* Job by Category */}
        <Box sx={{ backgroundColor: "background.paper", borderRadius: 2 }}>
          <LazyLoadSection minHeight="500px" rootMargin="400px">
            <JobByCategory />
          </LazyLoadSection>
        </Box>
      </Box>
    </>
  );
}
