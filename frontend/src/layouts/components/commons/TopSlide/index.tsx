'use client';

import React from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SearchIcon from '@mui/icons-material/Search';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import HomeSearch from '../../../../views/components/defaults/HomeSearch';
import contentService from '../../../../services/contentService';
import { BANNER_TYPES, IMAGES } from '../../../../configs/constants';
import type { Banner } from '../../../../types/models';

const HERO_HEADER_OFFSET = { xs: '56px', sm: '64px' };

const HERO_STATS = [
  {
    title: 'Hàng nghìn vị trí',
    description: 'Tập trung việc làm theo nghề, khu vực và mức lương.',
    icon: SearchIcon,
  },
  {
    title: 'Nhà tuyển dụng rõ ràng',
    description: 'Thông tin công ty và tin đăng được trình bày gọn gàng.',
    icon: ApartmentIcon,
  },
  {
    title: 'Cập nhật nhanh',
    description: 'Gợi ý mới được tải mượt, phù hợp cho trải nghiệm lướt nhanh.',
    icon: AccessTimeIcon,
  },
];

const RenderItem = ({ item }: { item: Banner }) => {
  const imageUrl = item.imageUrl || IMAGES.coverImageDefault;
  const mobileImageUrl = item.imageMobileUrl || imageUrl;
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#0f172a',
      }}
    >
      <Box component="picture" sx={{ display: 'block', width: '100%', height: '100%' }}>
        <source media="(max-width: 599px)" srcSet={mobileImageUrl} />
        <Box
          component="img"
          src={imageUrl}
          alt={item.description || 'Banner'}
          loading="eager"
          // @ts-ignore fetchPriority property
          fetchPriority="high"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = IMAGES.coverImageDefault;
            (e.target as HTMLImageElement).onerror = null;
            setIsLoaded(true);
          }}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.62) 48%, rgba(15, 23, 42, 0.12) 100%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

const TopSlide = () => {
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const getBanners = async () => {
      try {
        const resData = await contentService.getBanners({ type: BANNER_TYPES.HOME });
        if (!isMounted) return;

        if (resData && resData.length > 0) {
          const preloadPromises = resData.slice(0, 2).map((banner) => {
            return new Promise((resolve) => {
              const url = banner.imageUrl || IMAGES.coverImageDefault;
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = resolve;
            });
          });

          await Promise.race([
            Promise.all(preloadPromises),
            new Promise((r) => setTimeout(r, 600)),
          ]);
        }

        if (isMounted) {
          setBanners(resData);
        }
      } catch {
        // Error handled silently
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    getBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        mt: 3,
        borderRadius: { xs: '16px', md: '24px' },
        overflow: 'hidden',
        boxShadow: '0 16px 36px rgba(15, 23, 42, 0.10)',
        bgcolor: '#0f172a',
        fontFamily: "'Plus Jakarta Sans', var(--font-be-vietnam-pro), sans-serif",
      }}
    >
      <Box
        sx={{
          minHeight: { xs: 420, md: 460 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#0f172a',
        }}
      >
        <Box sx={{ height: '100%', '& .swiper-pagination': { display: 'none' } }}>
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
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ display: 'block', transform: 'none' }} />
              </SwiperSlide>
            ) : banners.length > 0 ? (
              banners.map((value) => (
                <SwiperSlide key={value.id}>
                  <RenderItem item={value} />
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <RenderItem item={{ id: 0, imageUrl: IMAGES.coverImageDefault, description: 'Banner' } as Banner} />
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
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1040,
              px: { xs: 3, sm: 4, md: 8, lg: 10 },
              pointerEvents: 'auto',
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.4rem', sm: '1.85rem', md: '2.25rem' },
                    color: '#ffffff',
                    lineHeight: 1.25,
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Chắp cánh sự nghiệp của bạn cùng{' '}
                  <Box component="span" sx={{ color: '#f43f5e' }}>
                    InfoHR!
                  </Box>
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.95rem', sm: '1.15rem' },
                    color: '#f8fafc',
                    opacity: 0.95,
                    mt: 0.5,
                    textShadow: '0 1px 6px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  Kết nối ứng viên & nhà tuyển dụng nhanh nhất.
                </Typography>
              </Box>
              <HomeSearch variant="hero" />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopSlide;
