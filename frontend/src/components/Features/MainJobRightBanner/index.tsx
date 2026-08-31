'use client';

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  Chip,
  styled,
  useTheme,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useTranslation } from "react-i18next";
import { BANNER_TYPES } from "@/configs/constants";
import contentService from "@/services/contentService";
import type { Banner } from "@/types/models";
import Link from "next/link";

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  borderRadius: "16px",
  overflow: "hidden",
  backgroundColor: "#0F172A",
  boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 20px 35px -5px rgba(15, 23, 42, 0.12), 0 8px 16px -2px rgba(15, 23, 42, 0.06)",
    borderColor: "rgba(203, 213, 225, 1)",
  },
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "rgba(15, 23, 42, 0.5)",
  backdropFilter: "blur(8px)",
  color: "#ffffff",
  padding: "8px",
  zIndex: 10,
  opacity: 0,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    transform: "translateY(-50%) scale(1.08)",
  },
}));

const MainJobRightBanner = () => {
  const { t } = useTranslation("common");
  const theme = useTheme();
  const [rightBanners, setRightBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    const getRightBanners = async () => {
      try {
        const resData = await contentService.getBanners({
          type: BANNER_TYPES.MAIN_JOB_RIGHT,
        });
        if (!isMounted) return;

        if (resData && resData.length > 0) {
          const activeList = resData.filter((b) => b.isActive !== false);
          setRightBanners(activeList.length > 0 ? activeList : resData);
        }
      } catch (error) {
        console.error("Failed to load right banners:", error);
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

  // Auto-play timer
  useEffect(() => {
    if (rightBanners.length <= 1 || isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rightBanners.length);
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [rightBanners.length, isHovered]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + rightBanners.length) % rightBanners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % rightBanners.length);
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={360}
          sx={{ borderRadius: "16px", transform: "none" }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={110}
          sx={{ borderRadius: "14px", transform: "none" }}
        />
      </Stack>
    );
  }

  if (!rightBanners || rightBanners.length === 0) {
    return null;
  }

  const currentBanner = rightBanners[currentIndex];
  const banner = currentBanner;
  // Prefer square/mobile image for vertical sidebar, fallback to imageUrl
  const displayImage = banner.imageMobileUrl || banner.imageUrl;

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
      {/* ── 1. Smart Carousel Banner Card ── */}
      <CarouselContainer
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          "&:hover .carousel-nav-btn": {
            opacity: 1,
          },
        }}
      >
        {/* Banner Link Wrapper */}
        <Box
          component={banner.buttonLink ? "a" : "div"}
          {...(banner.buttonLink
            ? {
                href: banner.buttonLink,
                target: banner.buttonLink.startsWith("http") ? "_blank" : "_self",
                rel: "noopener noreferrer",
              }
            : {})}
          sx={{
            display: "block",
            position: "relative",
            width: "100%",
            aspectRatio: "1/1",
            textDecoration: "none",
            color: "inherit",
            cursor: banner.buttonLink ? "pointer" : "default",
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            key={banner.id}
            src={displayImage}
            alt={banner.description || "Square Recruitment Banner"}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
              display: "block",
              animation: "fadeIn 0.4s ease-in-out",
              "@keyframes fadeIn": {
                from: { opacity: 0.6, transform: "scale(1.02)" },
                to: { opacity: 1, transform: "scale(1)" },
              },
            }}
          />

          {/* Top Tag & Indicator Bar */}
          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: 14,
              right: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 3,
            }}
          >
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: "14px !important", color: "#F59E0B !important" }} />}
              label="Nổi bật"
              size="small"
              sx={{
                height: 24,
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                backdropFilter: "blur(10px)",
                color: "#F8FAFC",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                px: 0.5,
              }}
            />

            {/* Slide Index Counter */}
            {rightBanners.length > 1 && (
              <Box
                sx={{
                  px: 1.2,
                  py: 0.3,
                  borderRadius: "12px",
                  backgroundColor: "rgba(15, 23, 42, 0.65)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#E2E8F0",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {currentIndex + 1} / {rightBanners.length}
              </Box>
            )}
          </Box>

          {/* Bottom Gradient Scrim Overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              pt: 8,
              pb: 2,
              px: 2.5,
              background:
                "linear-gradient(to top, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.78) 50%, rgba(15, 23, 42, 0) 100%)",
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
              zIndex: 2,
            }}
          >
            {/* Description Text */}
            <Typography
              variant="subtitle2"
              sx={{
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "13.5px",
                lineHeight: 1.45,
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {banner.description}
            </Typography>

            {/* CTA Button & Pagination Dots */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 0.5,
              }}
            >
              {banner.isShowButton && banner.buttonLink ? (
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: "16px !important" }} />}
                  sx={{
                    bgcolor: "#2563EB",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "12.5px",
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 1.8,
                    py: 0.6,
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                    "&:hover": {
                      bgcolor: "#1D4ED8",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 20px rgba(37, 99, 235, 0.6)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {banner.buttonText || t("viewDetails")}
                </Button>
              ) : (
                <Box />
              )}

              {/* Dot Indicators */}
              {rightBanners.length > 1 && (
                <Stack direction="row" spacing={0.6} alignItems="center">
                  {rightBanners.map((_, idx) => (
                    <Box
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      sx={{
                        width: idx === currentIndex ? 18 : 6,
                        height: 6,
                        borderRadius: "3px",
                        bgcolor: idx === currentIndex ? "#38BDF8" : "rgba(255, 255, 255, 0.35)",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: idx === currentIndex ? "#38BDF8" : "rgba(255, 255, 255, 0.7)",
                        },
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* Carousel Navigation Arrows */}
        {rightBanners.length > 1 && (
          <>
            <NavButton
              className="carousel-nav-btn"
              onClick={handlePrev}
              aria-label="Previous banner"
              sx={{ left: 10 }}
            >
              <ChevronLeftRoundedIcon fontSize="small" />
            </NavButton>
            <NavButton
              className="carousel-nav-btn"
              onClick={handleNext}
              aria-label="Next banner"
              sx={{ right: 10 }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </NavButton>
          </>
        )}
      </CarouselContainer>

      {/* ── 2. Companion Action Widget: CV & Employer Hub ── */}
      <Box
        sx={{
          p: 2.2,
          borderRadius: "14px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "#0F172A",
            fontSize: "13.5px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: "#EA580C" }} />
          Công Cụ Ứng Viên & Tuyển Dụng
        </Typography>

        <Stack spacing={1}>
          {/* Action 1: Create CV */}
          <Box
            component={Link}
            href="/tao-cv"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.2,
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
              textDecoration: "none",
              border: "1px solid transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#EFF6FF",
                borderColor: "#BFDBFE",
                transform: "translateX(2px)",
              },
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                bgcolor: "#DBEAFE",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1E293B" }}>
                Tạo CV Chuẩn Nghề
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748B" }}>
                Mẫu chuẩn ATS miễn phí
              </Typography>
            </Box>
            <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
          </Box>

          {/* Action 2: Employer Register */}
          <Box
            component={Link}
            href="/nha-tuyen-dung/register"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.2,
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
              textDecoration: "none",
              border: "1px solid transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#FFF7ED",
                borderColor: "#FED7AA",
                transform: "translateX(2px)",
              },
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                bgcolor: "#FFEDD5",
                color: "#EA580C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BusinessCenterOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: "#1E293B" }}>
                Dành Cho Nhà Tuyển Dụng
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748B" }}>
                Đăng tin & AI lọc hồ sơ
              </Typography>
            </Box>
            <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default MainJobRightBanner;
