import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Box, Link } from "@mui/material";
import HomeSearch from '../../../../pages/components/defaults/HomeSearch';
import MuiImageCustom from '../../../../components/MuiImageCustom';
import ProjectService from '../../../../services/ProjectService';
import { BANNER_TYPES } from '../../../../configs/constants';

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

const RenderItem = ({ item }: { item: any }) => {
  return (
    <MuiImageCustom
      width="100%"
      height={320}
      src={item.imageUrl}
      sx={{
        borderRadius: 1.5,
      }}
      fit="cover"
    />
  );
};

const TopSlide = () => {
  const [banners, setBanners] = React.useState<any[]>([]);

  React.useEffect(() => {
    const getBanners = async () => {
      try {
        const resData = await ProjectService.getBanners({type: BANNER_TYPES.HOME});
        const data = resData?.data || [];
        setBanners(data);
      } catch (error) {
        console.log(error);
      }
    };
    getBanners();
  }, []);

  return (
    <Box
      className="justify-content-center"
      style={{ height: 320, position: 'relative' }}
    >
      <Box sx={styles}>
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
          {banners.map((value) => (
            <SwiperSlide key={value.id} style={{ cursor: 'pointer' }}>
              <Link href={value?.buttonLink} target="_blank">
                <RenderItem item={value} />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 0, sm: '20%' },
          paddingLeft: { xs: 0, sm: '5%' },
          paddingRight: { xs: 0, sm: '5%' },
          zIndex: 10,
        }}
      >
        <HomeSearch />
      </Box>
    </Box>
  );
};

export default TopSlide;
