'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ApartmentIcon from '@mui/icons-material/Apartment';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeSearch from '../../../../views/components/defaults/HomeSearch';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import contentService from '../../../../services/contentService';
import { BANNER_TYPES, IMAGES, ROUTES } from '../../../../configs/constants';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import type { Banner } from '../../../../types/models';

const styles = {
  '.swiper-pagination-bullet': {
    width: 10,
    height: 10,
    opacity: 0.5,
    backgroundColor: '#8b6bd4',
  },
  '.swiper-pagination-bullet-active': {
    width: 10,
    height: 10,
    opacity: 1,
  },
};

const RenderItem = ({ item }: { item: Banner }) => {
  return (
    <Box
      component="img"
      src={item.imageUrl}
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
        borderRadius: 1.5,
        display: 'block',
      }}
    />
  );
};

const TopSlide = () => {
  const { t, i18n } = useTranslation('public');
  const router = useRouter();
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
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{ borderRadius: 1.5, display: 'block', transform: 'none' }}
                />
              </SwiperSlide>
            ) : banners.length > 0 ? (
              banners.map((value) => (
                <SwiperSlide key={value.id} style={{ cursor: 'pointer' }}>
                  <Link href={value?.buttonLink} target="_blank" rel="noreferrer">
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
      </Box>

      <Box
        sx={{
          mt: { xs: -4, sm: -5, md: -8 },
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
                    label={t('home.heroEyebrow', 'Nền tảng tuyển dụng thông minh')}
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
                    {t('home.heroTitle', 'Tìm việc phù hợp, tuyển đúng người nhanh hơn')}
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
                    {t(
                      'home.heroDescription',
                      'Khám phá việc làm theo ngành, thành phố và công ty. Nhà tuyển dụng có thể tiếp cận ứng viên phù hợp nhanh hơn với bộ công cụ tìm kiếm, hồ sơ và phỏng vấn của Square.'
                    )}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SearchIcon />}
                      onClick={() => router.push(localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language))}
                    >
                      {t('home.heroPrimaryCta', 'Khám phá việc làm')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ApartmentIcon />}
                      onClick={() => router.push(`/${ROUTES.EMPLOYER.INTRODUCE}`)}
                    >
                      {t('home.heroSecondaryCta', 'Dành cho nhà tuyển dụng')}
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
                        label: t('home.heroBenefit1', 'Lọc theo nghề, thành phố, công ty'),
                      },
                      {
                        icon: <VerifiedUserIcon fontSize="small" />,
                        label: t('home.heroBenefit2', 'Công ty nổi bật và tin tuyển dụng rõ ràng'),
                      },
                      {
                        icon: <TipsAndUpdatesIcon fontSize="small" />,
                        label: t('home.heroBenefit3', 'AI hỗ trợ gợi ý và tối ưu quy trình'),
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
                    borderRadius: 3,
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    backgroundColor: 'rgba(15, 57, 127, 0.06)',
                    border: '1px solid',
                    borderColor: 'rgba(15, 57, 127, 0.08)',
                  }}
                >
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {t('home.searchHeading', 'Bắt đầu tìm kiếm ngay')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(
                        'home.searchDescription',
                        'Nhập từ khóa, chọn nghề hoặc thành phố để tìm cơ hội phù hợp hơn.'
                      )}
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
