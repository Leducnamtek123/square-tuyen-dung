'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import HomeSearch from '../../../../views/components/defaults/HomeSearch';
import contentService from '../../../../services/contentService';
import { BANNER_TYPES, IMAGES } from '../../../../configs/constants';
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

const HERO_FRAME_MAX_WIDTH = { xs: 340, sm: 1216, md: 1376, lg: 1440 };

const heroFrameSx = {
  width: '100%',
  maxWidth: HERO_FRAME_MAX_WIDTH,
  mx: 'auto',
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
          background: [
            'linear-gradient(90deg, rgba(4, 22, 49, 0.88) 0%, rgba(4, 22, 49, 0.72) 38%, rgba(4, 22, 49, 0.20) 72%, rgba(4, 22, 49, 0.08) 100%)',
            'linear-gradient(180deg, rgba(4, 22, 49, 0.28) 0%, rgba(4, 22, 49, 0.12) 44%, rgba(4, 22, 49, 0.36) 100%)',
          ].join(', '),
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

const TopSlide = () => {
  const { t } = useTranslation('public');
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
      <Box sx={heroFrameSx}>
        <Box
          sx={{
            height: { xs: 700, sm: 560, md: 500, lg: 540 },
            position: 'relative',
            overflow: 'hidden',
            borderRadius: { xs: 1.5, md: 1.5 },
            bgcolor: '#071832',
            boxShadow: '0 26px 70px rgba(4, 22, 49, 0.22)',
          }}
        >
          <Box sx={{ ...styles, height: '100%', '& .swiper-pagination': { display: 'none' } }}>
            <Swiper
              spaceBetween={30}
              preventClicks={false}
              preventClicksPropagation={false}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
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

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              px: { xs: 2.5, sm: 4, md: 5, lg: 6 },
              py: { xs: 4, md: 5 },
              pointerEvents: 'none',
            }}
          >
            <Stack
              spacing={{ xs: 2, md: 2.3 }}
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: 880 },
                pointerEvents: 'auto',
              }}
            >
              <Chip
                label={t('home.heroEyebrow')}
                sx={{
                  width: 'fit-content',
                  height: 24,
                  px: 0.25,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.92)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  maxWidth: 700,
                  fontWeight: 500,
                  lineHeight: 0.98,
                  letterSpacing: 0,
                  color: '#fff',
                  textShadow: '0 8px 28px rgba(0,0,0,0.22)',
                  fontSize: { xs: '2.4rem', sm: '3.35rem', md: '4rem', lg: '4.35rem' },
                }}
              >
                {t('home.heroTitle')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: { xs: '100%', md: 640 },
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '0.98rem', md: '1.05rem' },
                  lineHeight: 1.55,
                  textShadow: '0 4px 18px rgba(0,0,0,0.22)',
                }}
              >
                {t('home.heroDescription')}
              </Typography>
              <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, pt: { xs: 1, md: 1.5 } }}>
                <HomeSearch variant="hero" />
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopSlide;
