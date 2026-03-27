// import 'swiper/css';
// import 'swiper/css/pagination';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import companyService from '@/services/companyService';
import { ROUTES, IMAGES } from '@/configs/constants';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useTranslation } from 'react-i18next';

interface Props {
  [key: string]: any;
}

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
    backgroundColor: (theme: any) => theme.palette.primary.main,
    transition: "all 0.3s ease",
  },
  ".swiper-pagination-bullet-active": {
    width: 24,
    height: 12,
    opacity: 1,
    borderRadius: "6px",
  },
};

const Loading = (_props: Props) => {
  return (
    <>
      <div id="top-company-carousel-loading">
        <Card
          sx={{
            alignItems: 'center',
            boxShadow: 0,
            p: 2,
            mb: 0.5,
            minHeight: 165,
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" justifyContent="center">
            <Skeleton
              variant="rounded"
              width={100}
              height={100}
              style={{ margin: '0 auto' }}
            />
          </Stack>
          <Typography
            variant="h6"
            component="h6"
            gutterBottom={true}
            sx={{
              textAlign: 'center',
              mt: 1,
            }}
          >
            <Skeleton />
          </Typography>
        </Card>
      </div>
    </>
  );
};

const TopCompanyCarousel = () => {
  const nav = useRouter();
  const { i18n } = useTranslation();
  const [parentWidth, setParentWidth] = React.useState(0);
  const [col, setCol] = React.useState(5);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['top-companies'],
    queryFn: async () => {
      const resData: any = await companyService.getTopCompanies();
      return resData?.data || resData?.results || (Array.isArray(resData) ? resData : []);
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

  React.useEffect(() => {
    if (parentWidth < 600) {
      setCol(2);
    } else if (parentWidth < 900) {
      setCol(3);
    } else if (parentWidth < 1200) {
      setCol(4);
    } else {
      setCol(5);
    }
  }, [parentWidth]);

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
            ? Array.from(Array(10).keys()).map((value) => (
                <SwiperSlide key={value}>
                  <Loading />
                </SwiperSlide>
              ))
            : companies.map((value: any) => (
                <SwiperSlide key={value.id}>
                  <Card
                    sx={{
                      boxShadow: 0,
                      alignItems: 'center',
                      p: 2,
                      mb: 0.5,
                      mt: 1,
                      cursor: 'pointer',
                      minHeight: 200,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      bgcolor: 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme: any) => theme.customShadows.medium,
                        borderColor: 'primary.main',
                        '& .company-name': {
                          color: 'primary.main',
                        }
                      },
                    }}
                    onClick={() => nav.push(localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, value.slug)}`, i18n.language))}
                  >
                    <Stack direction="row" justifyContent="center" sx={{ py: 1 }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: 'grey.100',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                          backgroundColor: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.light',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          },
                        }}
                      >
                        <MuiImageCustom
                          width={100}
                          height={100}
                          src={value?.companyImageUrl}
                          fallbackSrc={IMAGES.companyLogoDefault}
                          duration={200}
                          sx={{ 
                            margin: '0 auto',
                            borderRadius: 2,
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    </Stack>
                    <Typography
                      variant="h6"
                      component="h6"
                      className="company-name"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: 15,
                        mt: 2,
                        color: 'grey.800',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {value?.companyName}
                    </Typography>
                  </Card>
                </SwiperSlide>
              ))}
        </Swiper>
      </Box>
    </div>
  );
};

export default TopCompanyCarousel;
