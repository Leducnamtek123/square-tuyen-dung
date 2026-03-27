import React from "react";
import { Box, Button, Stack, styled, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BANNER_TYPES } from "@/configs/constants";
import contentService from "@/services/contentService";

interface Banner {
  id: string | number;
  imageUrl: string;
  description?: string;
  buttonLink?: string;
  buttonText?: string;
  isShowButton?: boolean;
}

interface MainJobRightBannerProps {
  [key: string]: any;
}

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

const MainJobRightBanner = (_props: MainJobRightBannerProps) => {
  const { t } = useTranslation("common");
  const [rightBanners, setRightBanners] = React.useState<Banner[]>([]);
  const theme = useTheme();

  React.useEffect(() => {
    const getRightBanners = async () => {
      try {
        const resData: any = await contentService.getBanners({
          type: BANNER_TYPES.MAIN_JOB_RIGHT,
        });
        const data = Array.isArray(resData) ? resData : (resData?.results || resData?.data || []);
        setRightBanners(data);
      } catch (error) {}
    };
    getRightBanners();
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
      {rightBanners?.map((banner) => (
        <Box key={banner.id} sx={{ position: 'relative' }}>
          <StyledBannerLink
            href={banner.buttonLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <StyledBannerImage
              src={banner.imageUrl}
              alt={banner.description || "Banner"}
              loading="lazy"
            />
          </StyledBannerLink>
          {banner.isShowButton && banner.buttonLink && (
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: (theme.zIndex as any).card + 1
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
                {banner.buttonText || t('viewDetails')}
              </Button>
            </Box>
          )}
        </Box>
      ))}
    </Stack>
  );
};

export default MainJobRightBanner;
