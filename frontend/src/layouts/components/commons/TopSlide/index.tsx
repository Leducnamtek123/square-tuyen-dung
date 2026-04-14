import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Box, Link, Skeleton } from "@mui/material";
import HomeSearch from '../../../../views/components/defaults/HomeSearch';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import contentService from '../../../../services/contentService';
import { BANNER_TYPES, IMAGES } from '../../../../configs/constants';

const styles = {
  ".swiper-pagination-bullet": {
    width: 10,
    height: 10,
    opacity: 0.5,
    backgroundColor: "#8b6bd4",
  },
  ".swiper-pagination-bullet-active": {
    width: 10,
    height: 10,
    opacity: 1,
  },
};

const RenderItem = ({ item }: { item: { targetUrl?: string; imageUrl?: string; description?: string; id?: string | number; buttonLink?: string } }) => {
  return (
    <Box
      component="img"
      src={item.imageUrl}
      alt={item.description || 'Banner'}
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).src = IMAGES.coverImageDefault; (e.target as HTMLImageElement).onerror = null; }}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 1.5,
        display: 'block',
      }}
    />
  );
};

const TopSlide = () => {
  const [banners, setBanners] = React.useState<{ targetUrl?: string; imageUrl?: string; description?: string; id?: string | number; buttonLink?: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const getBanners = async () => {
      try {
        setIsLoading(true);
        const resData = await contentService.getBanners({ type: BANNER_TYPES.HOME });
        const data = Array.isArray(resData) ? resData : ((resData as { results?: { targetUrl?: string; imageUrl?: string; description?: string; id?: string | number; buttonLink?: string }[]; data?: { targetUrl?: string; imageUrl?: string; description?: string; id?: string | number; buttonLink?: string }[] })?.results || (resData as { results?: { targetUrl?: string; imageUrl?: string; description?: string; id?: string | number; buttonLink?: string }[]; data?: { targetUrl?: string; imageUrl?: string; description?: string; id?: string | number; buttonLink?: string }[] })?.data || []);
        setBanners(data);
      } catch (error) {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    getBanners();
  }, []);

  return (
    <Box>
      {/* Banner image — responsive height by breakpoint */}
      <Box
        sx={{
          height: { xs: 200, sm: 280, md: 320 },
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
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1.5, display: 'block', transform: 'none' }} />
              </SwiperSlide>
            ) : banners.length > 0 ? (
              banners.map((value) => (
                <SwiperSlide key={value.id} style={{ cursor: 'pointer' }}>
                  <Link href={value?.buttonLink} target="_blank">
                    <RenderItem item={value} />
                  </Link>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <MuiImageCustom
                  width="100%"
                  height="100%"
                  src={IMAGES.coverImageDefault}
                  sx={{
                    borderRadius: 1.5,
                  }}
                  fit="cover"
                />
              </SwiperSlide>
            )}
          </Swiper>
        </Box>

        {/* HomeSearch overlay on banner — visible sm+ only */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { sm: '90%', md: '80%', lg: '70%' },
            zIndex: 10,
          }}
        >
          <HomeSearch />
        </Box>
      </Box>

      {/* HomeSearch below banner — visible on xs only */}
      <Box
        sx={{
          display: { xs: 'block', sm: 'none' },
          px: 2,
          py: 2,
          backgroundColor: 'background.default',
        }}
      >
        <HomeSearch />
      </Box>
    </Box>
  );
};

export default TopSlide;
