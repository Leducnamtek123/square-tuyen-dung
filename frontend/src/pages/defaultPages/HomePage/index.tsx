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

interface Props {
  [key: string]: any;
}



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

  const getIcon = (icon: SvgIconComponent) => {
    const Icon = icon;
    return <Icon color="secondary" />
  }

  return (

    <>

      <Box sx={{ mt: 6 }}>

        {/*Start: Top cong ty */}

        <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>

          {t('home.topCompanies')}

        </Typography>

        <TopCompanyCarousel />

        {/*End: Top cong ty */}

      </Box>

      <Box sx={{ mt: 10 }}>

        {/*Start: Viec lam tuyen gap */}

        <Card variant="outlined" sx={{ boxShadow: 0 }}>

          <CardHeader

            avatar={

              <Avatar sx={{ bgcolor: "white" }} aria-label="recipe">

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

              <FilterJobPostCard

                params={{

                  isUrgent: true,

                }}

              />

            </Box>

          </CardContent>

        </Card>

        {/*End: Viec lam tuyen gap */}

      </Box>

      <Box sx={{ mt: 10 }}>

        {/* Start: Cac nganh nghe */}

        <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>

          {t('home.keyCareers')}

        </Typography>

        <CareerCarousel />

        {/* End: Cac nganh nghe */}

      </Box>

      {isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (

        <Box sx={{ mt: 10 }}>

          {/* Start: Viec lam goi y */}

          <Card variant="outlined">

            <CardHeader

              avatar={

                <Avatar sx={{ bgcolor: "white" }} aria-label="recipe">

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

                {/* Start: SuggestedJobPostCard */}

                <SuggestedJobPostCard />

                {/* End: SuggestedJobPostCard */}

              </Box>

            </CardContent>

          </Card>

          {/* End: Viec lam goi y */}

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

          direction={{

            xs: "column",

            sm: "row",

            md: "row",

            lg: "row",

            xl: "row",

          }}

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

      <Box sx={{ mt: 6 }}>

        {/* Start: Viec lam nganh */}

        <Card variant="outlined" sx={{boxShadow: 0}}>

          <CardHeader

            avatar={

              <Avatar sx={{ bgcolor: "white" }} aria-label="recipe">

                {getIcon(HOME_FILTER_CAREER[0].titleIcon)}

              </Avatar>

            }

            title={

              <Typography variant="h5" sx={{ color: "white" }}>

                {t('home.jobsIn', { careerName: HOME_FILTER_CAREER[0].name })}

              </Typography>

            }

            sx={{

              backgroundColor: "primary.main",

              p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },

            }}

          />

          <CardContent>

            <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 2, xl: 2 } }}>

              <FilterJobPostCard

                params={{

                  careerId: HOME_FILTER_CAREER[0].id,

                }}

              />

            </Box>

          </CardContent>

        </Card>

        {/* End: Viec lam nganh */}

      </Box>

      <Box sx={{ mt: 10 }}>

        {/* Start: Viec lam nganh */}

        <Card variant="outlined" sx={{ boxShadow: 0 }}>

          <CardHeader

            avatar={

              <Avatar sx={{ bgcolor: "white" }} aria-label="recipe">

                {getIcon(HOME_FILTER_CAREER[1].titleIcon)}

              </Avatar>

            }

            title={

              <Typography variant="h5" sx={{ color: "white" }}>

                {t('home.jobsIn', { careerName: HOME_FILTER_CAREER[1].name })}

              </Typography>

            }

            sx={{

              backgroundColor: "primary.main",

              p: { xs: 0.75, sm: 1, md: 1.5, lg: 1.5, xl: 1.5 },

            }}

          />

          <CardContent>

            <Box sx={{ p: { xs: 0, sm: 0, md: 0, lg: 2, xl: 2 } }}>

              <FilterJobPostCard

                params={{

                  careerId: HOME_FILTER_CAREER[1].id,

                }}

              />

            </Box>

          </CardContent>

        </Card>

        {/* End: Viec lam nganh */}

      </Box>

      <Box sx={{ mt: 10 }}>

        {/* Start: Feedback */}

        <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>

          {t('home.userFeedback')}

        </Typography>

        <FeedbackCarousel />

        {/* End: Feedback */}

      </Box>

      <Box sx={{ mt: 10 }}>

        {/* Start: Job by category */}

        <Box

          sx={{

            backgroundColor: "background.paper",

            borderRadius: 2,

          }}

        >

          <JobByCategory />

        </Box>

        {/* End: Job by category */}

      </Box>

    </>

  );

}
