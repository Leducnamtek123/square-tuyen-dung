 'use client';
import { useAppSelector } from '@/redux/hooks';
import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import commonService from "@/services/commonService";
import MuiImageCustom from "@/components/Common/MuiImageCustom";
import { searchJobPost } from "@/redux/filterSlice";
import { IMAGES, ROUTES } from "@/configs/constants";
import { Theme } from "@mui/material/styles";
import { Career } from "@/types/models";

const styles = {
  ".swiper-pagination": {
    bottom: "-5px !important",
  },
  ".swiper-wrapper": {
    paddingBottom: "35px",
  },
  ".swiper-pagination-bullet": {
    width: 8,
    height: 8,
    opacity: 0.5,
    backgroundColor: (theme: Theme) => theme.palette.primary.main,
    transition: "all 0.3s ease",
  },
  ".swiper-pagination-bullet-active": {
    width: 24,
    height: 8,
    opacity: 1,
    borderRadius: "4px",
  },
};

const Loading = (
  <Card
    sx={{
      alignItems: "center",
      p: 2,
      mb: 0.5,
      boxShadow: 0,
      backgroundColor: (theme) => theme.palette.background.paper,
      transition: "transform 0.2s ease-in-out",
      borderRadius: "16px",
    }}
  >
    <Skeleton
      variant="rounded"
      width={72}
      height={72}
      style={{ margin: "0 auto", borderRadius: "12px" }}
    />
    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
      <Skeleton width="80%" style={{ margin: "0 auto" }} />
    </Typography>
    <Typography variant="caption">
      <Skeleton width="60%" style={{ margin: "0 auto" }} />
    </Typography>
  </Card>
);

const CareerCarousel = () => {
  const { t } = useTranslation('public');
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { jobPostFilter } = useAppSelector((state) => state.filter);
  const [parentWidth, setParentWidth] = React.useState(0);
  const col = parentWidth < 600 ? 2 : parentWidth < 900 ? 3 : parentWidth < 1200 ? 4 : 5;

  const { data: topCareers = [], isLoading } = useQuery({
    queryKey: ['top-careers'],
    queryFn: async () => {
      const resData = await commonService.getTop10Careers();
      return resData || [];
    },
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const element = document.getElementById("career-carousel");
      if (element) {
        setParentWidth(element.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFilter = (id: string | number) => {
    dispatch(searchJobPost({ ...jobPostFilter, careerId: String(id) }));
    push(`/${ROUTES.JOB_SEEKER.JOBS}`);
  };

  return (
    <div id="career-carousel">
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
              <SwiperSlide key={value}>{Loading}</SwiperSlide>
            ))
            : topCareers.map((value: Career & { jobPostTotal?: number }) => (
              <SwiperSlide key={value.id}>
                <Card
                  sx={{
                    alignItems: "center",
                    p: 2,
                    mb: 0.5,
                    cursor: "pointer",
                    boxShadow: 0,
                    backgroundColor: (theme) => theme.palette.background.paper,
                    borderRadius: "16px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: (theme: Theme) => theme.customShadows?.medium,
                      "& .career-icon": {
                        transform: "scale(1.05)",
                      },
                      "& .career-name": {
                        color: (theme: Theme) => theme.palette.primary.main,
                      },
                    },
                  }}
                  onClick={() => handleFilter(value.id)}
                >
                  <Stack
                    direction="row"
                    justifyContent="center"
                    sx={{
                      p: 2,
                      "& .career-icon": {
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    <MuiImageCustom
                      width={72}
                      height={72}
                      src={value?.iconUrl}
                      fallbackSrc={IMAGES.companyLogoDefault}
                      className="career-icon"
                      sx={{
                        borderRadius: "12px",
                        p: 1,
                        backgroundColor: (theme: Theme) => theme.palette.primary.background,
                      }}
                    />
                  </Stack>
                  <Typography
                    className="career-name"
                    variant="h6"
                    component="h6"
                    gutterBottom={true}
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      transition: "color 0.3s ease",
                      px: 1,
                    }}
                  >
                    {value?.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    gutterBottom
                    sx={{
                      textAlign: "center",
                      color: (theme: Theme) => theme.palette.text.secondary,
                      backgroundColor: (theme: Theme) => theme.palette.primary.background,
                      px: 2,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {t("home.jobsCount", { count: value.jobPostTotal, defaultValue: "{{count}} Việc Làm" })}
                  </Typography>
                </Card>
              </SwiperSlide>
            ))}
        </Swiper>
      </Box>
    </div>
  );
};

export default CareerCarousel;
