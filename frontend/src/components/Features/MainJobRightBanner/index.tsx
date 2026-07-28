 'use client';
import React from "react";
import { Box, Button, Skeleton, Stack, styled, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BANNER_TYPES } from "@/configs/constants";
import contentService from "@/services/contentService";
import type { Banner } from "@/types/models";

const StyledBannerImage = styled("img")({
  width: "100%",
  height: "auto",
  borderRadius: "12px",
  display: "block",
});

const StyledBannerLink = styled("a")({
  textDecoration: "none",
  display: "block",
  width: "100%",
  "&:hover": {
    cursor: "pointer",
  },
});

const BannerItem = ({ banner, buttonText }: { banner: Banner; buttonText: string }) => {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = React.useState(false);

  const bannerImage = (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={260}
          sx={{ borderRadius: '12px', transform: 'none' }}
        />
      )}
      <StyledBannerImage
        src={banner.imageUrl}
        alt={banner.description || "Banner"}
        loading="eager"
        // @ts-ignore fetchPriority property
        fetchPriority="high"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          position: isLoaded ? 'static' : 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {banner.buttonLink ? (
        <StyledBannerLink
          href={banner.buttonLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {bannerImage}
        </StyledBannerLink>
      ) : bannerImage}
      {banner.isShowButton && banner.buttonLink && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: theme.zIndex.appBar + 1
          }}
        >
          <Button
            variant="outlined"
            href={banner.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              minWidth: '180px',
              height: '44px',
              borderRadius: '22px',
              color: theme.palette.common.white,
              borderColor: theme.palette.common.white,
              borderWidth: '2px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
              ...theme.typography.subtitle1,
              fontWeight: 500,
              transition: theme.transitions.create(['transform', 'box-shadow']),
              '&:hover': {
                borderWidth: '2px',
                borderColor: theme.palette.common.white,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: theme.palette.common.white,
                transform: 'translateY(-2px)',
                boxShadow: theme.customShadows.medium
              }
            }}
          >
            {banner.buttonText || buttonText}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const MainJobRightBanner = () => {
  const { t } = useTranslation("common");
  const [rightBanners, setRightBanners] = React.useState<Banner[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const getRightBanners = async () => {
      try {
        const resData = await contentService.getBanners({
          type: BANNER_TYPES.MAIN_JOB_RIGHT,
        });
        if (!isMounted) return;

        if (resData && resData.length > 0) {
          const preloadPromises = resData.map((banner) => {
            return new Promise((resolve) => {
              if (!banner.imageUrl) return resolve(true);
              const img = new Image();
              img.src = banner.imageUrl;
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
          setRightBanners(resData);
        }
      } catch (error) {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    getRightBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Stack
      spacing={2}
      sx={{
        position: "sticky",
        top: { xs: 0, md: 88 },
        pb: 2,
        px: { xs: 2, md: 0 },
      }}
    >
      {isLoading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={260}
          sx={{ borderRadius: '12px', transform: 'none' }}
        />
      ) : (
        rightBanners?.map((banner) => (
          <BannerItem
            key={banner.id}
            banner={banner}
            buttonText={t('viewDetails')}
          />
        ))
      )}
    </Stack>
  );
};

export default MainJobRightBanner;
