 'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box, Card, Skeleton, Stack, Typography, Button } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import companyService from '@/services/companyService';
import { ROUTES, IMAGES } from '@/configs/constants';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useTranslation } from 'react-i18next';
import type { Company } from '@/types/models';

import type { Theme } from '@mui/material/styles';

const LOADING_SLIDE_KEYS = ['loading-1', 'loading-2', 'loading-3', 'loading-4', 'loading-5', 'loading-6', 'loading-7', 'loading-8', 'loading-9', 'loading-10'];
const STAR_KEYS = ['star-1', 'star-2', 'star-3', 'star-4', 'star-5'];
const LOADING_STAR_KEYS = ['loading-star-1', 'loading-star-2', 'loading-star-3', 'loading-star-4', 'loading-star-5'];

const styles = {
  ".swiper-pagination": {
    bottom: "-5px !important",
  },
  ".swiper-wrapper": {
    paddingBottom: "30px",
    paddingTop: "4px",
  },
  ".swiper-pagination-bullet": {
    width: 12,
    height: 12,
    opacity: 0.5,
    backgroundColor: (theme: Theme) => theme.palette.primary.main,
    transition: "all 0.3s ease",
  },
  ".swiper-pagination-bullet-active": {
    width: 24,
    height: 12,
    opacity: 1,
    borderRadius: "6px",
  },
};

const Loading = () => {
  return (
    <>
      <div id="top-company-carousel-loading">
        <Card
          sx={{
            boxShadow: 0,
            p: 2.5,
            mb: 0.5,
            minHeight: 220,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.200',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2 }} />
          </Box>
          <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3 }} />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', width: '100%' }}>
            <Stack direction="row" spacing={0.5}>
              {LOADING_STAR_KEYS.map((key) => (
                <Skeleton key={key} variant="circular" width={20} height={20} />
              ))}
            </Stack>
            <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: 2 }} />
          </Stack>
        </Card>
      </div>
    </>
  );
};

const TopCompanyCarousel = () => {
  const { push } = useRouter();
  const { i18n, t } = useTranslation('common');
  const [parentWidth, setParentWidth] = React.useState(0);
  const col = parentWidth < 600 ? 2 : parentWidth < 900 ? 3 : parentWidth < 1200 ? 4 : 5;

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['top-companies'],
    queryFn: async () => {
      const resData = await companyService.getTopCompanies();
      // httpRequest interceptor already unwraps response.data.data
      // so resData is the companies array directly
      if (Array.isArray(resData)) return resData as Company[];
      const fallback = resData as { data?: Company[]; results?: Company[] };
      return fallback?.data || fallback?.results || [];
    },
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const newWidth = document.getElementById(
        'top-company-carousel'
      )?.offsetWidth || 0;
      setParentWidth(newWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="top-company-carousel">
      <Box sx={styles}>
        <Swiper
          slidesPerView={col}
          spaceBetween={15}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: true,
          }}
          modules={[Pagination, Autoplay]}
        >
          {isLoading
            ? LOADING_SLIDE_KEYS.map((key) => (
                <SwiperSlide key={key}>
                  <Loading />
                </SwiperSlide>
              ))
            : companies.map((value: Company & { shortDescription?: string }) => (
                <SwiperSlide key={value.id}>
                  <Card
                    sx={{
                      boxShadow: 0,
                      p: 2.5,
                      mb: 0.5,
                      mt: 1,
                      cursor: 'pointer',
                      minHeight: 220,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme: Theme & { customShadows?: { medium?: string } }) => theme.customShadows?.medium || 'none',
                        borderColor: 'primary.main',
                        '& .company-name': {
                          color: 'primary.main',
                        }
                      },
                    }}
                    onClick={() => push(localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, value.slug as string)}`, i18n.language))}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.100',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        mb: 2,
                        flexShrink: 0,
                      }}
                    >
                      <MuiImageCustom
                        width="100%"
                        height="100%"
                        src={value?.companyImageUrl as string | undefined}
                        fallbackSrc={IMAGES.companyLogoDefault}
                        duration={200}
                        sx={{ 
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      component="h6"
                      className="company-name"
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        lineHeight: 1.3,
                        mb: 1,
                        color: 'grey.900',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textAlign: 'left',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {value?.companyName as React.ReactNode}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textAlign: 'left',
                        mb: 3,
                        lineHeight: 1.5,
                        height: 42, 
                      }}
                    >
                      {(value?.shortDescription as React.ReactNode) || t('company.defaultDescription')}
                    </Typography>

                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="space-between" 
                      sx={{ 
                        mt: 'auto', 
                        width: '100%',
                        pt: 1,
                      }}
                    >
                      <Stack direction="row" spacing={0.3}>
                        {STAR_KEYS.map((key) => (
                          <StarIcon key={key} sx={{ color: 'primary.main', fontSize: 18 }} />
                        ))}
                      </Stack>
                      <Button 
                        variant="contained" 
                        size="small" 
                        disableElevation
                        sx={{ 
                          borderRadius: 2, 
                          textTransform: 'none', 
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {t('viewDetails')}
                      </Button>
                    </Stack>
                  </Card>
                </SwiperSlide>
              ))}
        </Swiper>
      </Box>
    </div>
  );
};

export default TopCompanyCarousel;
