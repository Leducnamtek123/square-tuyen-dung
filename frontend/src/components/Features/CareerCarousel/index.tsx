'use client';
import React from "react";
import { useDispatch } from "react-redux";
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Avatar, Box, Card, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import commonService from "@/services/commonService";
import MuiImageCustom from "@/components/Common/MuiImageCustom";
import { buildJobPostFilter, searchJobPost } from "@/redux/filterSlice";
import { IMAGES, ROUTES } from "@/configs/constants";
import { localizeRoutePath } from "@/configs/routeLocalization";
import { Theme } from "@mui/material/styles";
import { Career } from "@/types/models";
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import EngineeringIcon from '@mui/icons-material/Engineering';
import WeekendIcon from '@mui/icons-material/Weekend';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import type { SvgIconComponent } from '@mui/icons-material';

const styles = {
  ".swiper-pagination": {
    bottom: "-5px !important",
  },
  ".swiper-wrapper": {
    paddingBottom: "35px",
    alignItems: "stretch",
  },
  ".swiper-slide": {
    height: "auto",
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

const CAREER_ICON_MAP: Record<string, SvgIconComponent> = {
  apartment: ApartmentIcon,
  engineering: EngineeringIcon,
  weekend: WeekendIcon,
  architecture: ArchitectureIcon,
};

const CAREER_ACCENTS = ['#1e6bb8', '#2aa9e1', '#0f9d7a', '#8c6df2'];

const Loading = (
  <Card
    sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: 280,
      p: 2,
      boxShadow: 0,
      backgroundColor: (theme) => theme.palette.background.paper,
      transition: "transform 0.2s ease-in-out",
      borderRadius: "18px",
      border: '1px solid rgba(196, 198, 209, 0.55)',
    }}
  >
    <Skeleton
      variant="rounded"
      width="100%"
      height={132}
      sx={{ borderRadius: 3 }}
    />
    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
      <Skeleton width="80%" />
    </Typography>
    <Typography variant="caption">
      <Skeleton width="42%" />
    </Typography>
  </Card>
);

const normalizeCareers = (careers: Career[] = []) =>
  careers
    .map((career) => ({
      ...career,
      id: Number(career.id),
      name: String(career.name ?? '').trim(),
      jobPostTotal: Number(career.jobPostTotal ?? career.job_post_total ?? 0),
    }))
    .filter((career) => Number.isFinite(career.id) && career.id > 0 && career.name);

const CareerArtwork = ({ career }: { career: Career }) => {
  const Icon = career.appIconName ? CAREER_ICON_MAP[career.appIconName.toLowerCase()] : undefined;

  if (career.iconUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 132,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.66), rgba(255,255,255,0.92))',
          border: '1px solid rgba(196, 198, 209, 0.35)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <MuiImageCustom
          width={160}
          height={110}
          src={career.iconUrl}
          fallbackSrc={IMAGES.companyLogoDefault}
          loading="eager"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: 132,
        borderRadius: 3,
        display: 'grid',
        placeItems: 'center',
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.background} 0%, rgba(255,255,255,0.92) 100%)`,
        border: '1px solid rgba(196, 198, 209, 0.35)',
      }}
    >
      <Avatar
        sx={{
          width: 78,
          height: 78,
          bgcolor: 'white',
          boxShadow: '0 12px 24px rgba(15,57,127,0.12)',
          color: 'primary.main',
        }}
        aria-label={career.name}
      >
        {Icon ? <Icon color="inherit" sx={{ fontSize: 42 }} /> : <BusinessCenterIcon sx={{ fontSize: 42 }} />}
      </Avatar>
    </Box>
  );
};

const CareerCarousel = () => {
  const { t, i18n } = useTranslation('public');
  const dispatch = useDispatch();
  const [parentWidth, setParentWidth] = React.useState(0);
  const col = parentWidth < 600 ? 1 : parentWidth < 900 ? 2 : parentWidth < 1200 ? 3 : 4;
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  const { data: rawTopCareers = [], isLoading } = useQuery({
    queryKey: ['top-careers'],
    queryFn: async () => {
      const resData = await commonService.getTop10Careers();
      return resData || [];
    },
    staleTime: 5 * 60_000,
  });
  const topCareers = React.useMemo(() => normalizeCareers(rawTopCareers), [rawTopCareers]);

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
    dispatch(searchJobPost(buildJobPostFilter({ careerId: String(id) })));
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
            : topCareers.map((value: Career & { jobPostTotal?: number }, index) => {
              const accent = CAREER_ACCENTS[index % CAREER_ACCENTS.length];
              return (
                <SwiperSlide key={value.id}>
                  <Card
                    component={Link}
                    href={jobsHref}
                    prefetch
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      minHeight: 280,
                      p: 1.5,
                      mb: 0.5,
                      cursor: "pointer",
                      color: 'inherit',
                      textDecoration: 'none',
                      boxShadow: 0,
                      background: `linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)`,
                      borderRadius: 4,
                      border: '1px solid rgba(196, 198, 209, 0.55)',
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      '&:before': {
                        content: '""',
                        display: 'block',
                        height: 6,
                        borderRadius: 999,
                        marginBottom: 1.25,
                        background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.2))`,
                      },
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: '0 18px 34px rgba(4, 48, 104, 0.14)',
                        borderColor: accent,
                        "& .career-name": {
                          color: (theme: Theme) => theme.palette.primary.main,
                        },
                      },
                    }}
                    onClick={() => handleFilter(value.id)}
                  >
                    <Stack spacing={1.5} sx={{ flex: 1, p: 1 }}>
                      <CareerArtwork career={value} />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography
                          className="career-name"
                          variant="h6"
                          component="h6"
                          gutterBottom={true}
                          sx={{
                            fontWeight: 800,
                            fontSize: '1.02rem',
                            lineHeight: 1.25,
                            minHeight: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.3s ease',
                            px: 0.5,
                          }}
                        >
                          {value?.name}
                        </Typography>
                        <Chip
                          label={t('home.jobsCount', { count: value.jobPostTotal })}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            color: accent,
                            bgcolor: `${accent}12`,
                            border: `1px solid ${accent}24`,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Card>
                </SwiperSlide>
              );
            })}
        </Swiper>
      </Box>
    </div>
  );
};

export default CareerCarousel;
