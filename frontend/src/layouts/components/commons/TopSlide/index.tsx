'use client';

import React from 'react';
import NextLink from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeSearch from '../../../../views/components/defaults/HomeSearch';
import contentService from '../../../../services/contentService';
import { BANNER_TYPES, IMAGES, ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import type { Banner } from '../../../../types/models';

const styles = {
  '.swiper-pagination-bullet': {
    width: 10,
    height: 10,
    opacity: 0.5,
    backgroundColor: '#2aa9e1',
  },
  '.swiper-pagination-bullet-active': {
    width: 22,
    height: 10,
    opacity: 1,
    borderRadius: 999,
    backgroundColor: '#1a407d',
  },
};

const RenderItem = ({ item }: { item: Banner }) => {
  const imageUrl = item.imageUrl || IMAGES.coverImageDefault;
  const mobileImageUrl = item.imageMobileUrl || imageUrl;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1.5,
        bgcolor: '#071832',
        boxShadow: '0 18px 44px rgba(15, 57, 127, 0.14)',
      }}
    >
      <Box
        component="picture"
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      >
        <source media="(max-width: 599px)" srcSet={mobileImageUrl} />
        <Box
          component="img"
          src={imageUrl}
          alt={item.description || 'Banner'}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGES.coverImageDefault;
            (e.target as HTMLImageElement).onerror = null;
          }}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7, 24, 50, 0) 58%, rgba(7, 24, 50, 0.24) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

const TopSlide = () => {
  const { t, i18n } = useTranslation('public');
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);
  const employerIntroHref = localizeRoutePath(`/${ROUTES.EMPLOYER.INTRODUCE}`, i18n.language);

  React.useEffect(() => {
    const getBanners = async () => {
      try {
        const resData = await contentService.getBanners({ type: BANNER_TYPES.HOME });
        setBanners(resData);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    getBanners();
  }, []);

  return (
    <Box>
      <Box
        sx={{
          aspectRatio: { xs: '1 / 1', sm: '16 / 5' },
          maxHeight: { xs: 340, sm: 380, md: 430, lg: 450 },
          position: 'relative',
        }}
      >
        <Box sx={{ ...styles, height: '100%' }}>
          <Swiper
            spaceBetween={30}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            preventClicks={false}
            preventClicksPropagation={false}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Pagination]}
            className="mySwiper"
            style={{ height: '100%' }}
          >
            {isLoading ? (
              <SwiperSlide>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{ borderRadius: 1.5, display: 'block', transform: 'none' }}
                />
              </SwiperSlide>
            ) : banners.length > 0 ? (
              banners.map((value) => {
                return (
                  <SwiperSlide key={value.id}>
                    <RenderItem item={value} />
                  </SwiperSlide>
                );
              })
            ) : (
              <SwiperSlide>
                <Box
                  component="img"
                  src={IMAGES.coverImageDefault}
                  alt="Banner"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 1.5,
                    display: 'block',
                  }}
                />
              </SwiperSlide>
            )}
          </Swiper>
        </Box>
      </Box>

      <Box
        sx={{
          mt: { xs: -3, sm: -4, md: -5 },
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 8 },
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(15, 57, 127, 0.18)',
            border: '1px solid',
            borderColor: 'rgba(15, 57, 127, 0.10)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(235,244,255,0.96) 100%)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4.5 } }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2.25}>
                  <Chip
                    label={t('home.heroEyebrow')}
                    color="primary"
                    variant="outlined"
                    sx={{ width: 'fit-content', fontWeight: 700 }}
                  />
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.08,
                      letterSpacing: '-0.03em',
                      color: 'text.primary',
                      fontSize: { xs: '2rem', sm: '2.35rem', md: '3rem' },
                    }}
                  >
                    {t('home.heroTitle')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '1rem', md: '1.05rem' },
                      lineHeight: 1.7,
                      maxWidth: 620,
                    }}
                  >
                    {t('home.heroDescription')}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      component={NextLink}
                      href={jobsHref}
                      prefetch
                      variant="contained"
                      size="large"
                      startIcon={<SearchIcon />}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: 'center',
                      }}
                    >
                      {t('home.heroPrimaryCta')}
                    </Button>
                    <Button
                      component={NextLink}
                      href={employerIntroHref}
                      prefetch
                      variant="outlined"
                      size="large"
                      startIcon={<ApartmentIcon />}
                      sx={{
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: 'center',
                        bgcolor: 'rgba(255,255,255,0.74)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {t('home.heroSecondaryCta')}
                    </Button>
                  </Stack>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    useFlexGap
                    sx={{
                      flexWrap: 'wrap',
                      gap: 1.25,
                      rowGap: 1.25,
                      mt: 0.5,
                      alignItems: 'flex-start',
                    }}
                  >
                    {[
                      {
                        icon: <SearchIcon fontSize="small" />,
                        label: t('home.heroBenefit1'),
                      },
                      {
                        icon: <VerifiedUserIcon fontSize="small" />,
                        label: t('home.heroBenefit2'),
                      },
                      {
                        icon: <TipsAndUpdatesIcon fontSize="small" />,
                        label: t('home.heroBenefit3'),
                      },
                    ].map((item) => (
                      <Chip
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        variant="outlined"
                        size="medium"
                        sx={{
                          width: 'fit-content',
                          minHeight: 36,
                          px: 0.5,
                          borderColor: 'rgba(15, 57, 127, 0.16)',
                          bgcolor: 'rgba(255,255,255,0.7)',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    borderRadius: 3.5,
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    backgroundColor: 'rgba(255,255,255,0.62)',
                    border: '1px solid',
                    borderColor: 'rgba(26, 64, 125, 0.1)',
                    boxShadow: '0 18px 40px rgba(15, 57, 127, 0.08)',
                    backdropFilter: 'blur(14px)',
                  }}
                >
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {t('home.searchHeading')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('home.searchDescription')}
                    </Typography>
                  </Stack>
                  <HomeSearch />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TopSlide;
