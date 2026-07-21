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
            <Stack spacing={2.5}>
              <HomeSearch variant="hero" />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopSlide;
