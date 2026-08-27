'use client';

import React, { useRef } from "react";
import { Box, Card, Stack, Typography, Theme, Button, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Grid2 as Grid } from "@mui/material";
import Link from 'next/link';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME, ROUTES } from "../../../configs/constants";
import { localizeRoutePath } from "../../../configs/routeLocalization";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const IntroducePage = () => {
  const { t, i18n } = useTranslation("employer");
  const containerRef = useRef<HTMLDivElement>(null);
  TabTitle(`Giới thiệu & Dịch vụ Tuyển dụng - ${t('common.appName', { defaultValue: APP_NAME })}`);

  useGSAP(
    () => {
      // 1. Hero entrance timeline
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .fromTo(
          ".gsap-hero-badge",
          { y: -15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, clearProps: 'transform' }
        )
        .fromTo(
          ".gsap-hero-title",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, clearProps: 'transform' },
          "-=0.3"
        )
        .fromTo(
          ".gsap-hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' },
          "-=0.4"
        )
        .fromTo(
          ".gsap-hero-actions",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform' },
          "-=0.3"
        );

      // 2. Highlights with ScrollTrigger
      gsap.fromTo(
        ".gsap-highlight-card",
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-highlights-grid",
            start: "top 85%",
          },
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: 'transform',
        }
      );

      // 3. Services box & cards with ScrollTrigger
      gsap.fromTo(
        ".gsap-services-box",
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-services-box",
            start: "top 85%",
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          clearProps: 'transform',
        }
      );

      gsap.fromTo(
        ".gsap-service-card",
        { y: 25, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-services-grid",
            start: "top 85%",
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: 'transform',
        }
      );

      // 4. Steps with ScrollTrigger
      gsap.fromTo(
        ".gsap-step-card",
        { y: 25, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".gsap-steps-grid",
            start: "top 85%",
          },
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: 'transform',
        }
      );
    },
    { scope: containerRef }
  );

  const highlights = [
    {
      title: t('introduce.highlights.h1.title', { defaultValue: 'Đăng tin hiệu quả' }),
      description: t('introduce.highlights.h1.desc', { defaultValue: 'Tiếp cận hàng triệu ứng viên tiềm năng nhanh chóng.' }),
      icon: CampaignOutlinedIcon,
    },
    {
      title: t('introduce.highlights.h2.title', { defaultValue: 'Đội ngũ chất lượng' }),
      description: t('introduce.highlights.h2.desc', { defaultValue: 'Hồ sơ ứng viên được xác thực và chọn lọc tự động.' }),
      icon: PeopleAltOutlinedIcon,
    },
    {
      title: t('introduce.highlights.h3.title', { defaultValue: 'Tuyển dụng thông minh' }),
      description: t('introduce.highlights.h3.desc', { defaultValue: 'Công nghệ AI hỗ trợ gợi ý ứng viên phù hợp nhất.' }),
      icon: TrackChangesOutlinedIcon,
    },
    {
      title: t('introduce.highlights.h4.title', { defaultValue: 'Hỗ trợ 24/7' }),
      description: t('introduce.highlights.h4.desc', { defaultValue: 'Đội ngũ chuyên viên tư vấn đồng hành suốt quy trình.' }),
      icon: VerifiedOutlinedIcon,
    },
  ];

  const services = [
    {
      title: t('service.jobPost.title', { defaultValue: 'Đăng tin tuyển dụng' }),
      description: t('service.jobPost.desc', { defaultValue: 'Đăng tin tuyển dụng hiển thị ưu tiên trên các chuyên mục ngành nghề hàng đầu.' }),
      icon: FactCheckOutlinedIcon,
    },
    {
      title: t('service.search.title', { defaultValue: 'Tìm kiếm ứng viên' }),
      description: t('service.search.desc', { defaultValue: 'Lọc và tiếp cận trực tiếp kho hồ sơ hàng nghìn CV chất lượng cao.' }),
      icon: SearchOutlinedIcon,
    },
    {
      title: t('service.interview.title', { defaultValue: 'Phỏng vấn AI & Trực tuyến' }),
      description: t('service.interview.desc', { defaultValue: 'Hệ thống phỏng vấn tự động hóa và phỏng vấn trực tuyến ghi hình thông minh.' }),
      icon: VideoCallOutlinedIcon,
    },
    {
      title: t('service.report.title', { defaultValue: 'Báo cáo & Phân tích' }),
      description: t('service.report.desc', { defaultValue: 'Thống kê hiệu quả tuyển dụng và phân tích chi tiết ứng viên tham gia.' }),
      icon: InsightsOutlinedIcon,
    },
  ];

  const steps = [
    {
      title: t('introduce.steps.s1.title', { defaultValue: 'Tạo tài khoản nhà tuyển dụng' }),
      description: t('introduce.steps.s1.desc', { defaultValue: 'Đăng ký nhanh chóng và xác thực thông tin doanh nghiệp.' }),
    },
    {
      title: t('introduce.steps.s2.title', { defaultValue: 'Đăng tin tuyển dụng' }),
      description: t('introduce.steps.s2.desc', { defaultValue: 'Soạn thảo nội dung việc làm và lựa chọn gói hiển thị phù hợp.' }),
    },
    {
      title: t('introduce.steps.s3.title', { defaultValue: 'Tiếp nhận & Sàng lọc CV' }),
      description: t('introduce.steps.s3.desc', { defaultValue: 'Hệ thống tự động phân loại và gợi ý hồ sơ ứng viên chất lượng.' }),
    },
    {
      title: t('introduce.steps.s4.title', { defaultValue: 'Phỏng vấn & Tuyển dụng' }),
      description: t('introduce.steps.s4.desc', { defaultValue: 'Lên lịch phỏng vấn và hoàn tất quy trình tuyển dụng nhân tài.' }),
    },
  ];

  return (
    <Box ref={containerRef} sx={{ maxWidth: "1200px", margin: "0 auto", py: 5, px: 3 }}>
      {/* ── Hero Banner Header ────────────────────────────────────────── */}
      <Box sx={{ mb: 8, textAlign: "center" }}>
        <Box
          className="gsap-hero-badge"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.6,
            mb: 2,
            borderRadius: '9999px',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            color: '#2563eb',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <BoltIcon fontSize="small" />
          Giải pháp Tuyển dụng &amp; AI Matching Doanh nghiệp
        </Box>
        <Typography
          className="gsap-hero-title"
          variant="h3"
          sx={{
            mb: 2,
            background: (theme: Theme) => theme.palette.primary.main,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800,
            fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          {t('introduce.heroTitle', { defaultValue: 'Giải pháp tuyển dụng nhân tài toàn diện' })}
        </Typography>
        <Typography
          className="gsap-hero-desc"
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
            fontSize: '1.1rem',
            mb: 4,
          }}
        >
          {t('introduce.heroSubtitle', { appName: APP_NAME, defaultValue: 'Kết nối doanh nghiệp với hàng triệu ứng viên tiềm năng thông qua nền tảng tuyển dụng thông minh - hỗ trợ chuyên sâu 4 ngành trọng điểm: Xây dựng, Bất động sản, Kiến trúc / Nội thất và Kỹ thuật.' })}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center" className="gsap-hero-actions">
          <Button
            component={Link}
            href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: '12px',
              px: 3.5,
              py: 1.4,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
            }}
          >
            Đăng ký tuyển dụng ngay
          </Button>
          <Button
            component={Link}
            href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '12px',
              px: 3.5,
              py: 1.4,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Xem bảng giá dịch vụ
          </Button>
        </Stack>
      </Box>

      {/* ── Highlights Grid ────────────────────────────────────────── */}
      <Grid container spacing={4} sx={{ mb: 10 }} className="gsap-highlights-grid">
        {highlights.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }} className="gsap-highlight-card">
            <Card
              sx={{
                height: "100%",
                p: 3,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: '16px',
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: (theme: Theme) => theme.customShadows.card,
                  borderColor: "primary.light",
                },
              }}
            >
              <Stack spacing={2}>
                <item.icon sx={{ fontSize: 36, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Integrated Services Section ────────────────────────────────── */}
      <Box className="gsap-services-box" sx={{ mb: 10, p: { xs: 3, md: 5 }, borderRadius: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            Dịch vụ Tuyển dụng Nổi bật
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Cung cấp đầy đủ tính năng hiện đại giúp doanh nghiệp tối ưu hóa chi phí và thời gian tuyển dụng.
          </Typography>
        </Box>

        <Grid container spacing={3} className="gsap-services-grid">
          {services.map((service) => (
            <Grid key={service.title} size={{ xs: 12, sm: 6, md: 3 }} className="gsap-service-card">
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  border: "1px solid #e2e8f0",
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  boxShadow: 0,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Stack spacing={2}>
                  <service.icon sx={{ fontSize: 36, color: "primary.main" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {service.title}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.6, fontSize: '0.875rem' }}>
                    {service.description}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
          <Button
            component={Link}
            href={localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, i18n.language)}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: '24px',
              px: 4,
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(15,23,42,0.15)',
            }}
          >
            Xem bảng giá dịch vụ
          </Button>
        </Stack>
      </Box>

      {/* ── Process Steps Section ──────────────────────────────────────── */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            mb: 5,
            textAlign: "center",
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          {t('introduce.processTitle', { defaultValue: 'Quy trình Tuyển dụng Đơn giản' })}
        </Typography>
        <Grid container spacing={3} className="gsap-steps-grid">
          {steps.map((step, index) => (
            <Grid key={step.title} size={{ xs: 12, sm: 6, md: 3 }} className="gsap-step-card">
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: '16px',
                  border: "1px solid #e2e8f0",
                  boxShadow: 0,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, mb: 1, color: "primary.main" }}
                >
                  {t('introduce.stepLabel', { index: index + 1, defaultValue: `Bước ${index + 1}` })}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.6, fontSize: '0.875rem' }}>
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default IntroducePage;
