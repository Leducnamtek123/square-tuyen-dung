'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid2 as Grid,
  Stack,
  Typography,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  GSAP_MEDIA_CONDITIONS,
  registerGsapPlugins,
} from '@/utils/gsapHelpers';

// MUI Icons
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';

import { TabTitle } from '@/utils/generalFunction';
import { APP_NAME, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';

registerGsapPlugins();

export default function PricingPage() {
  const { t, i18n } = useTranslation('employer');
  TabTitle(
    t('pricing.tabTitle', {
      appName: APP_NAME,
      defaultValue: `Dịch Vụ & Bảng Giá Tuyển Dụng | ${APP_NAME}`,
    })
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Form states
  const [formState, setFormState] = useState({
    contactName: '',
    phone: '',
    companyName: '',
    hiringNeed: 'Gói Tăng Tốc (Professional) — 4.500.000 đ',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Smooth scroll handler
  const handleScrollToSection = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form validation & submission
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!formState.contactName.trim()) {
      errors.contactName = 'Vui lòng nhập họ và tên người liên hệ';
    }
    if (!formState.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại hoặc Zalo';
    } else if (!/^[0-9+() -]{9,15}$/.test(formState.phone.trim())) {
      errors.phone = 'Số điện thoại không hợp lệ (từ 9 đến 15 ký tự số)';
    }
    if (!formState.companyName.trim()) {
      errors.companyName = 'Vui lòng nhập tên công ty hoặc nhà thầu';
    }
    if (!formState.hiringNeed.trim()) {
      errors.hiringNeed = 'Vui lòng chọn nhu cầu tuyển dụng';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({
        contactName: '',
        phone: '',
        companyName: '',
        hiringNeed: 'Gói Tăng Tốc (Professional) — 4.500.000 đ',
        notes: '',
      });
    }, 600);
  };

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;
      const has = (selector: string): boolean => Boolean(el.querySelector(selector));

      const mm = gsap.matchMedia();

      // -- Desktop Animations (>=769px) --------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isDesktop, () => {
        if (has('.gsap-hero-title')) {
          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

          if (has('.gsap-hero-badge')) {
            heroTl.fromTo(
              '.gsap-hero-badge',
              { y: -15, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, clearProps: 'all' }
            );
          }
          heroTl.fromTo(
            '.gsap-hero-title',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' },
            '-=0.2'
          );
          if (has('.gsap-hero-desc')) {
            heroTl.fromTo(
              '.gsap-hero-desc',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
              '-=0.3'
            );
          }
          if (has('.gsap-hero-actions')) {
            heroTl.fromTo(
              '.gsap-hero-actions',
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, clearProps: 'all' },
              '-=0.25'
            );
          }
          if (has('.gsap-hero-guarantees')) {
            heroTl.fromTo(
              '.gsap-hero-guarantees',
              { y: 25, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.55, clearProps: 'all' },
              '-=0.2'
            );
          }
        }

        // Section 2: 3 Pillars
        if (has('.gsap-pillar-card')) {
          gsap.fromTo(
            '.gsap-pillar-card',
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power3.out',
              clearProps: 'all',
              scrollTrigger: has('.gsap-pillars-section')
                ? {
                    trigger: '.gsap-pillars-section',
                    start: 'top 80%',
                    once: true,
                  }
                : undefined,
            }
          );
        }

        // Section 3: 4 Pricing Cards
        if (has('.gsap-pricing-card')) {
          gsap.fromTo(
            '.gsap-pricing-card',
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power3.out',
              clearProps: 'all',
              scrollTrigger: has('.gsap-pricing-section')
                ? {
                    trigger: '.gsap-pricing-section',
                    start: 'top 80%',
                    once: true,
                  }
                : undefined,
            }
          );
        }

        // Section 4: Comparison Matrix
        if (has('.gsap-matrix-table')) {
          gsap.fromTo(
            '.gsap-matrix-table',
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power3.out',
              clearProps: 'all',
              scrollTrigger: has('.gsap-matrix-section')
                ? {
                    trigger: '.gsap-matrix-section',
                    start: 'top 80%',
                    once: true,
                  }
                : undefined,
            }
          );
        }

        // Section 5: Enterprise Form
        if (has('.gsap-form-card')) {
          gsap.fromTo(
            '.gsap-form-card',
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power3.out',
              clearProps: 'all',
              scrollTrigger: has('.gsap-form-section')
                ? {
                    trigger: '.gsap-form-section',
                    start: 'top 80%',
                    once: true,
                  }
                : undefined,
            }
          );
        }

        // Section 6: FAQ Accordion
        if (has('.gsap-faq-item')) {
          gsap.fromTo(
            '.gsap-faq-item',
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power3.out',
              clearProps: 'all',
              scrollTrigger: has('.gsap-faq-section')
                ? {
                    trigger: '.gsap-faq-section',
                    start: 'top 80%',
                    once: true,
                  }
                : undefined,
            }
          );
        }
      });

      // -- Mobile Animations (<769px) ----------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.isMobile, () => {
        if (has('.gsap-hero-title')) {
          gsap.fromTo(
            ['.gsap-hero-badge', '.gsap-hero-title', '.gsap-hero-desc', '.gsap-hero-actions'],
            { y: 15, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.1,
              ease: 'power2.out',
              clearProps: 'all',
            }
          );
        }
      });

      // -- Reduced Motion ---------------------------------------------
      mm.add(GSAP_MEDIA_CONDITIONS.reduceMotion, () => {
        gsap.set(
          [
            '.gsap-hero-badge',
            '.gsap-hero-title',
            '.gsap-hero-desc',
            '.gsap-hero-actions',
            '.gsap-hero-guarantees',
            '.gsap-pillar-card',
            '.gsap-pricing-card',
            '.gsap-matrix-table',
            '.gsap-form-card',
            '.gsap-faq-item',
          ],
          { opacity: 1, y: 0, clearProps: 'all' }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      {/* ========================================================================= */}
      {/* SECTION 1: HERO BẢNG GIÁ & 3 CAM KẾT VẬN HÀNH                            */}
      {/* ========================================================================= */}
      <Box
        component="section"
        sx={{
          pt: { xs: 7, md: 10 },
          pb: { xs: 6, md: 9 },
          background: 'radial-gradient(120% 80% at 50% 0%, #EFF6FF 0%, #FFFFFF 65%)',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 940, mx: 'auto' }}>
            <Box className="gsap-hero-badge">
              <Chip
                label="BẢNG GIÁ & DỊCH VỤ MINH BẠCH"
                size="small"
                sx={{
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563EB',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '100px',
                }}
              />
            </Box>

            <Typography
              variant="h1"
              className="gsap-hero-title"
              sx={{
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                fontWeight: 800,
                lineHeight: { xs: 1.25, md: 1.2 },
                color: '#0F172A',
                letterSpacing: '-0.025em',
              }}
            >
              Dịch Vụ & Bảng Giá Tuyển Dụng Chuyên Ngành — Minh Bạch, Trả Theo Nhu Cầu.
            </Typography>

            <Typography
              variant="body1"
              className="gsap-hero-desc"
              sx={{
                fontSize: { xs: '1rem', md: '1.18rem' },
                color: '#475569',
                lineHeight: 1.7,
                maxWidth: 820,
              }}
            >
              Không chi phí ẩn, không ép mua gói lớn. Chỉ trả tiền cho hồ sơ và dịch vụ mang lại giá trị thật cho doanh nghiệp kỹ thuật.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              className="gsap-hero-actions"
              sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                variant="contained"
                onClick={handleScrollToSection('cac-goi-gia')}
                endIcon={<ArrowDownwardRoundedIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  px: 3.5,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                  textTransform: 'none',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                    boxShadow: '0 6px 22px rgba(37, 99, 235, 0.45)',
                  },
                }}
              >
                Xem Các Gói Giá
              </Button>
              <Button
                variant="outlined"
                onClick={handleScrollToSection('dang-ky-tu-van')}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                  px: 3.5,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#2563EB',
                    color: '#2563EB',
                    backgroundColor: '#F8FAFC',
                  },
                }}
              >
                Tư Vấn Doanh Nghiệp
              </Button>
            </Stack>

            {/* 3 Cam kết vận hành nổi bật */}
            <Box sx={{ width: '100%', pt: 4 }} className="gsap-hero-guarantees">
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      p: 2.75,
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '16px',
                      textAlign: 'left',
                      boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#2563EB',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.08)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.75} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.25,
                          backgroundColor: '#EFF6FF',
                          borderRadius: '10px',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <VerifiedUserOutlinedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, lineHeight: 1.4 }}
                        >
                          Hoàn điểm 100% nếu số thuê bao không nghe máy
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          Chỉ tính phí khi liên lạc được ứng viên thực sự. Tự động hoàn lại 100% điểm lọc CV nếu số máy không nhấc máy sau 48h xác minh.
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      p: 2.75,
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '16px',
                      textAlign: 'left',
                      boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#2563EB',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.08)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.75} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.25,
                          backgroundColor: '#F1F5F9',
                          borderRadius: '10px',
                          color: '#0F172A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ShieldOutlinedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, lineHeight: 1.4 }}
                        >
                          Bảo hành đổi ứng viên thử việc
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          Cam kết giới thiệu hồ sơ thay thế miễn phí trong suốt thời gian thử việc nếu ứng viên không đáp ứng yêu cầu công trường.
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      p: 2.75,
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '16px',
                      textAlign: 'left',
                      boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#2563EB',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.08)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.75} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.25,
                          backgroundColor: '#FEF2F2',
                          borderRadius: '10px',
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ReceiptLongOutlinedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, lineHeight: 1.4 }}
                        >
                          Xuất hóa đơn VAT điện tử trong ngày
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          Cung cấp đầy đủ hợp đồng kinh tế và hóa đơn GTGT điện tử hợp lệ gửi qua email ngay sau khi kích hoạt dịch vụ.
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SECTION 2: 3 TRỤ CỘT DỊCH VỤ CỐT LÕI                                     */}
      {/* ========================================================================= */}
      <Box
        component="section"
        id="tru-cot-dich-vu"
        className="gsap-pillars-section"
        sx={{
          py: { xs: 7, md: 10 },
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
            <Chip
              label="HỆ SINH THÁI DỊCH VỤ CHUYÊN BIỆT"
              size="small"
              sx={{
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                px: 1.5,
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              3 Trụ Cột Dịch Vụ Cốt Lõi Cho Doanh Nghiệp Kỹ Thuật
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#475569', maxWidth: 760, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
            >
              Mỗi dịch vụ được thiết kế chuyên sâu giải quyết triệt để rủi ro tuyển dụng trong ngành Xây dựng, BĐS, Kiến trúc và MEP.
            </Typography>
          </Stack>

          <Grid container spacing={3.5}>
            {/* Trụ cột 1 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                className="gsap-pillar-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#2563EB',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 32px -10px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                {/* Photographic Header */}
                <Box sx={{ position: 'relative', height: 160, width: '100%', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src="/images/employer/industry_construction.jpg"
                    alt="Đăng tin tuyển dụng chuyên ngành"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.15) 60%)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: '#0F172A',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <PostAddOutlinedIcon fontSize="small" />
                    </Box>
                    <Chip
                      label="TIẾP CẬN ĐÚNG NGÀNH"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        borderRadius: '100px',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                </Box>

                <Stack spacing={2.5} sx={{ p: { xs: 2.75, md: 3 }, flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.25rem', lineHeight: 1.35 }}>
                    Đăng tin tuyển dụng chuyên ngành & hiển thị ưu tiên giờ vàng
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    Tiếp cận trực tiếp kỹ sư và chuyên viên 4 khối ngành kỹ thuật với thuật toán phân phối tự động vào các khung giờ vàng.
                  </Typography>

                  <Divider sx={{ borderColor: '#E2E8F0', my: 1 }} />

                  <Stack spacing={1.5}>
                    {[
                      'Hiển thị ưu tiên chuyên mục: Xây dựng, Bất động sản, Kiến trúc, MEP.',
                      'Thuật toán đẩy tin tự động vào giờ vàng kỹ sư tìm việc (11h30 - 13h00 & 19h30 - 21h30).',
                      'Hỗ trợ chuẩn hóa mô tả công việc (JD) bám sát mã ngành và quy chuẩn công trường.',
                      'Tỉ lệ ứng viên đúng chuyên ngành nộp hồ sơ cao hơn 4.2 lần so với các trang đại trà.',
                    ].map((item, idx) => (
                      <Stack key={idx} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            {/* Trụ cột 2 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                className="gsap-pillar-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#2563EB',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 32px -10px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                {/* Photographic Header */}
                <Box sx={{ position: 'relative', height: 160, width: '100%', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src="/images/employer/engineering_verify.jpg"
                    alt="Điểm lọc hồ sơ CV bảo đảm có xác thực chứng chỉ hành nghề"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.15) 60%)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <FactCheckOutlinedIcon fontSize="small" />
                    </Box>
                    <Chip
                      label="100% HỒ SƠ THẬT"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        borderRadius: '100px',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                </Box>

                <Stack spacing={2.5} sx={{ p: { xs: 2.75, md: 3 }, flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.25rem', lineHeight: 1.35 }}>
                    Điểm lọc hồ sơ CV bảo đảm có xác thực chứng chỉ hành nghề
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    Tiếp cận kho ứng viên có đầy đủ dữ liệu công trình thực tế, quy mô dự án và chứng chỉ hành nghề Bộ Xây dựng.
                  </Typography>

                  <Divider sx={{ borderColor: '#E2E8F0', my: 1 }} />

                  <Stack spacing={1.5}>
                    {[
                      'Thẩm định hồ sơ: Xác thực chứng chỉ hành nghề Giám sát, Thiết kế, Định giá (Hạng I/II/III).',
                      'Cơ chế bảo lưu & hoàn điểm: Chỉ trừ điểm khi ứng viên nghe máy hoặc phản hồi xác nhận đang tìm việc.',
                      'Hoàn điểm tự động trong 24h nếu số thuê bao không liên lạc được hoặc ứng viên đã nhận việc.',
                      'Bộ lọc kỹ thuật đa chiều: Lọc theo cấp công trình (Cấp I, II, Đặc biệt), phần mềm (Revit, AutoCAD, BIM).',
                    ].map((item, idx) => (
                      <Stack key={idx} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            {/* Trụ cột 3 */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                className="gsap-pillar-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#DC2626',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 32px -10px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                {/* Photographic Header */}
                <Box sx={{ position: 'relative', height: 160, width: '100%', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src="/images/employer/voice_ai_interview.jpg"
                    alt="Trợ lý phỏng vấn sơ loại AILA Voice AI 24/7"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.15) 60%)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <RecordVoiceOverOutlinedIcon fontSize="small" />
                    </Box>
                    <Chip
                      label="CÔNG NGHỆ ĐỘT PHÁ"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        color: '#DC2626',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        borderRadius: '100px',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                </Box>

                <Stack spacing={2.5} sx={{ p: { xs: 2.75, md: 3 }, flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.25rem', lineHeight: 1.35 }}>
                    Trợ lý phỏng vấn sơ loại AILA Voice AI 24/7 & báo cáo Scorecard
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    Trợ lý Voice AI đàm thoại tự nhiên thời gian thực theo WebRTC, tự động phỏng vấn kỹ thuật và xuất phiếu Scorecard tức thì.
                  </Typography>

                  <Divider sx={{ borderColor: '#E2E8F0', my: 1 }} />

                  <Stack spacing={1.5}>
                    {[
                      'Tự động gọi điện và phỏng vấn sơ loại tình huống kỹ thuật 24/7 theo kịch bản chuẩn TCVN / ASTM.',
                      'Khảo sát kinh nghiệm thực chiến công trường, kiểm tra xử lý xung đột bản vẽ cơ điện & kết cấu.',
                      'Trả về Phiếu Đánh Giá Năng Lực (Scorecard) chi tiết kèm file audio ghi âm nguyên bản ngay sau phỏng vấn.',
                      'Tiết kiệm 15 - 20 giờ làm việc của Giám đốc dự án và Chỉ huy trưởng cho mỗi vòng sơ loại.',
                    ].map((item, idx) => (
                      <Stack key={idx} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ color: '#DC2626', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* SECTION 3: 4 GÓI GIÁ TUYỂN DỤNG                                          */}
      {/* ========================================================================= */}
      <Box
        component="section"
        id="cac-goi-gia"
        className="gsap-pricing-section"
        sx={{
          py: { xs: 7, md: 11 },
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 6, md: 8 } }}>
            <Chip
              label="BẢNG GIÁ DỊCH VỤ MINH BẠCH"
              size="small"
              sx={{
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563EB',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                px: 1.5,
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Lựa Chọn Gói Dịch Vụ Phù Hợp Với Quy Mô Doanh Nghiệp
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#475569', maxWidth: 780, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
            >
              Linh hoạt lựa chọn từ nhu cầu tuyển dụng thời vụ đến giải pháp toàn diện cho tổng thầu và tập đoàn.
            </Typography>
          </Stack>

          <Grid container spacing={3} alignItems="stretch">
            {/* Gói 1: Khởi Đầu (Starter) */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                className="gsap-pricing-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '16px',
                  p: 3,
                  position: 'relative',
                  boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Chip
                  label="DỰ ÁN NHỎ"
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    mb: 2,
                    borderRadius: '100px',
                  }}
                />

                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Gói Khởi Đầu (Starter)
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, minHeight: 40, lineHeight: 1.4 }}>
                  Phù hợp cho nhà thầu phụ, đơn vị tư vấn nhỏ cần bổ sung 1 - 2 kỹ sư hiện trường.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    1.800.000 đ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    / gói 30 ngày
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#E2E8F0', mb: 2.5 }} />

                <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                  {[
                    '3 Tin đăng chuyên ngành (30 ngày)',
                    '25 Điểm lọc hồ sơ CV bảo đảm liên lạc',
                    'Đẩy tin tự động 1 lần/tuần giờ vàng',
                    'Hỗ trợ chuẩn hóa JD chuẩn TCVN',
                    'Hỗ trợ kỹ thuật giờ hành chính',
                  ].map((feat, idx) => (
                    <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleRoundedIcon sx={{ color: '#64748B', fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.4 }}>
                        {feat}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  component={Link}
                  href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    fontWeight: 700,
                    py: 1.25,
                    borderRadius: '12px',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#2563EB',
                      color: '#2563EB',
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Chọn Gói Khởi Đầu
                </Button>
              </Card>
            </Grid>

            {/* Gói 2: Tăng Tốc (Professional) - GÓI NỔI BẬT / KHUYÊN DÙNG */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {/* Double-bezel radiant shell */}
              <Box
                className="gsap-pricing-card"
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  p: '2px',
                  borderRadius: '18px',
                  boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.3), 0 0 0 1px rgba(37, 99, 235, 0.2)',
                  transform: { lg: 'scale(1.03)' },
                  zIndex: 2,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    px: 2,
                    py: 0.5,
                    borderRadius: '100px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                    whiteSpace: 'nowrap',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    zIndex: 3,
                  }}
                >
                  KHUYÊN DÙNG — TIẾT KIỆM 40%
                </Box>

                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    borderRadius: '16px',
                    p: 3,
                  }}
                >
                  <Chip
                    label="PHỔ BIẾN NHẤT"
                    size="small"
                    sx={{
                      alignSelf: 'flex-start',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563EB',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      mb: 2,
                      mt: 1,
                      borderRadius: '100px',
                    }}
                  />

                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                    Gói Tăng Tốc (Professional)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, minHeight: 40, lineHeight: 1.4 }}>
                    Giải pháp tối ưu cho tổng thầu, công ty kiến trúc & MEP cần tuyển dụng liên tục.
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB' }}>
                      4.500.000 đ
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      / gói 60 ngày
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: '#E2E8F0', mb: 2.5 }} />

                  <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                    {[
                      '10 Tin đăng vị trí Top ngành ưu tiên',
                      '100 Điểm lọc hồ sơ CV (Hoàn 100% nếu số chết)',
                      '50 Lượt trợ lý AILA Voice AI phỏng vấn sơ loại',
                      'Huy hiệu "Doanh Nghiệp Kỹ Thuật Uy Tín"',
                      'Tự động đẩy tin 3 lần/tuần khung giờ vàng',
                      'Chuyên viên quản lý tài khoản hỗ trợ 24/7',
                    ].map((feat, idx) => (
                      <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>
                          {feat}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    component={Link}
                    href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
                    variant="contained"
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      py: 1.3,
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                      textTransform: 'none',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                        boxShadow: '0 6px 22px rgba(37, 99, 235, 0.45)',
                      },
                    }}
                  >
                    Chọn Gói Tăng Tốc
                  </Button>
                </Card>
              </Box>
            </Grid>

            {/* Gói 3: Doanh Nghiệp (Enterprise) */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                className="gsap-pricing-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '16px',
                  p: 3,
                  position: 'relative',
                  boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Chip
                  label="TẬP ĐOÀN & TỔNG THẦU"
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    mb: 2,
                    borderRadius: '100px',
                  }}
                />

                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Gói Doanh Nghiệp (Enterprise)
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, minHeight: 40, lineHeight: 1.4 }}>
                  Thiết kế riêng cho các tập đoàn xây dựng, chủ đầu tư BĐS, tổng thầu EPC quy mô lớn.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Liên Hệ Báo Giá
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Tùy chỉnh theo quy mô
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#E2E8F0', mb: 2.5 }} />

                <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                  {[
                    'Đăng tin không giới hạn trong hợp đồng',
                    'Mở khóa kho hồ sơ cấp cao (Chỉ huy trưởng, QLDA)',
                    'Kịch bản phỏng vấn AILA AI may đo riêng',
                    'Tích hợp InfoHR HRM / ATS nội bộ qua API',
                    'Chuyên viên tuyển dụng cấp cao phụ trách 1-on-1',
                    'Bảo hành đổi ứng viên thử việc lên đến 60 ngày',
                  ].map((feat, idx) => (
                    <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleRoundedIcon sx={{ color: '#0F172A', fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.4 }}>
                        {feat}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  onClick={handleScrollToSection('dang-ky-tu-van')}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    fontWeight: 700,
                    py: 1.25,
                    borderRadius: '12px',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#2563EB',
                      color: '#2563EB',
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Nhận Báo Giá Tùy Chỉnh
                </Button>
              </Card>
            </Grid>

            {/* Gói 4: Thẻ Tiện Ích Lẻ (Add-on Services) */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                className="gsap-pricing-card"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '16px',
                  p: 3,
                  position: 'relative',
                  boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.08)',
                  },
                }}
              >
                <Chip
                  label="MUA THÊM LINH HOẠT"
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    mb: 2,
                    borderRadius: '100px',
                  }}
                />

                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Thẻ Tiện Ích Lẻ
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, minHeight: 40, lineHeight: 1.4 }}>
                  Mua thêm lượt phỏng vấn AI hoặc điểm lọc CV bất kỳ lúc nào mà không cần nâng gói.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Từ 500.000 đ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Trả theo nhu cầu
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#E2E8F0', mb: 2.5 }} />

                <Stack spacing={1.5} sx={{ flexGrow: 1, mb: 3 }}>
                  {[
                    'Lượt phỏng vấn AI: từ 500.000 đ / 20 lượt',
                    'Điểm lọc CV mua thêm: từ 600.000 đ / 30 điểm',
                    'Đẩy tin VIP giờ vàng: 150.000 đ / lượt',
                    'Thẩm định hồ sơ kỹ sư nâng cao: 200.000 đ / CV',
                    'Kích hoạt dùng ngay, không giới hạn hạn dùng',
                  ].map((feat, idx) => (
                    <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleRoundedIcon sx={{ color: '#64748B', fontSize: 16, mt: 0.3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.4 }}>
                        {feat}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  onClick={handleScrollToSection('dang-ky-tu-van')}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#0F172A',
                    fontWeight: 700,
                    py: 1.25,
                    borderRadius: '12px',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#2563EB',
                      color: '#2563EB',
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Đăng Ký Tiện Ích Lẻ
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* SECTION 4: BẢNG MA TRẬN SO SÁNH CHI TIẾT TÍNH NĂNG                       */}
      {/* ========================================================================= */}
      <Box
        component="section"
        id="bang-so-sanh"
        className="gsap-matrix-section"
        sx={{
          py: { xs: 7, md: 10 },
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
            <Chip
              label="MINH BẠCH TÍNH NĂNG"
              size="small"
              sx={{
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                px: 1.5,
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Bảng So Sánh Chi Tiết Quyền Lợi & Tính Năng Giữa Các Gói
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#475569', maxWidth: 760, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
            >
              Đối chiếu rõ ràng từng quyền lợi để lựa chọn phương án đầu tư nhân sự hiệu quả nhất cho doanh nghiệp.
            </Typography>
          </Stack>

          <TableContainer
            component={Paper}
            variant="outlined"
            className="gsap-matrix-table"
            sx={{
              borderColor: '#E2E8F0',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
              overflowX: 'auto',
            }}
          >
            <Table aria-label="Feature Comparison Matrix" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#0F172A' }}>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 800, width: '36%', py: 2, fontSize: '0.95rem' }}>
                    Tính Năng / Quyền Lợi
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#FFFFFF', fontWeight: 700, width: '16%', py: 2 }}>
                    Gói Khởi Đầu
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: '#FFFFFF',
                      fontWeight: 800,
                      width: '18%',
                      py: 2,
                      backgroundColor: '#1E3A8A',
                      borderLeft: '1px solid #2563EB',
                      borderRight: '1px solid #2563EB',
                    }}
                  >
                    Gói Tăng Tốc ★
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#FFFFFF', fontWeight: 700, width: '16%', py: 2 }}>
                    Gói Enterprise
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#FFFFFF', fontWeight: 700, width: '14%', py: 2 }}>
                    Tiện Ích Lẻ
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* NHÓM 1: ĐĂNG TIN */}
                <TableRow sx={{ backgroundColor: '#F1F5F9' }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 800, color: '#0F172A', py: 1.5, fontSize: '0.85rem' }}>
                    1. DỊCH VỤ ĐĂNG TIN TUYỂN DỤNG
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>Số lượng tin đăng chuyên ngành</TableCell>
                  <TableCell align="center">3 tin</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2563EB', backgroundColor: '#F8FAFC' }}>
                    10 tin
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Không giới hạn</TableCell>
                  <TableCell align="center">Theo gói mua lẻ</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Thời gian hiển thị tin đăng</TableCell>
                  <TableCell align="center">30 ngày</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}>60 ngày</TableCell>
                  <TableCell align="center">Toàn hợp đồng</TableCell>
                  <TableCell align="center">30 ngày/tin</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Đẩy tin tự động giờ vàng</TableCell>
                  <TableCell align="center">1 lần / tuần</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}>3 lần / tuần</TableCell>
                  <TableCell align="center">Hàng ngày</TableCell>
                  <TableCell align="center">150.000 đ / lượt</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Vị trí hiển thị ưu tiên Top ngành</TableCell>
                  <TableCell align="center">Tiêu chuẩn</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}>Top 1 chuyên mục</TableCell>
                  <TableCell align="center">Trang chủ & Đa kênh</TableCell>
                  <TableCell align="center">Theo gói</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Huy hiệu Doanh nghiệp uy tín</TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}><CheckCircleRoundedIcon sx={{ color: '#2563EB' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#0F172A' }} /></TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                </TableRow>

                {/* NHÓM 2: LỌC CV */}
                <TableRow sx={{ backgroundColor: '#F1F5F9' }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 800, color: '#0F172A', py: 1.5, fontSize: '0.85rem' }}>
                    2. DỊCH VỤ LỌC & MỞ KHÓA HỒ SƠ ỨNG VIÊN
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>Số điểm lọc hồ sơ CV bảo đảm</TableCell>
                  <TableCell align="center">25 điểm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2563EB', backgroundColor: '#F8FAFC' }}>
                    100 điểm
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Theo hợp đồng</TableCell>
                  <TableCell align="center">Từ 30 điểm</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Xác thực chứng chỉ Bộ Xây dựng & Dự án</TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Chính sách hoàn điểm nếu không nghe máy</TableCell>
                  <TableCell align="center">Hoàn 100% (48h)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#2563EB', backgroundColor: '#F8FAFC' }}>
                    Hoàn 100% (48h)
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Hoàn tự động</TableCell>
                  <TableCell align="center">Hoàn 100% (48h)</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Tải hồ sơ CV PDF không giới hạn</TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center">Theo điểm mở</TableCell>
                </TableRow>

                {/* NHÓM 3: AILA VOICE AI */}
                <TableRow sx={{ backgroundColor: '#F1F5F9' }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 800, color: '#0F172A', py: 1.5, fontSize: '0.85rem' }}>
                    3. TRỢ LÝ PHỎNG VẤN SƠ LOẠI AILA VOICE AI
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>Số lượt phỏng vấn AILA Voice AI</TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#DC2626', backgroundColor: '#F8FAFC' }}>
                    50 lượt
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Không giới hạn</TableCell>
                  <TableCell align="center">Từ 20 lượt</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Tùy biến kịch bản câu hỏi kỹ thuật</TableCell>
                  <TableCell align="center">Bộ chuẩn</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}>5 kịch bản riêng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>May đo độc quyền</TableCell>
                  <TableCell align="center">Bộ chuẩn</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Báo cáo Scorecard & Audio ghi âm gốc</TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}><CheckCircleRoundedIcon sx={{ color: '#DC2626' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#DC2626' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#DC2626' }} /></TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Phỏng vấn đa luồng đồng thời</TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}>Tối đa 5 phiên</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Không giới hạn</TableCell>
                  <TableCell align="center">1 phiên</TableCell>
                </TableRow>

                {/* NHÓM 4: HỖ TRỢ & BẢO HÀNH */}
                <TableRow sx={{ backgroundColor: '#F1F5F9' }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 800, color: '#0F172A', py: 1.5, fontSize: '0.85rem' }}>
                    4. CHÍNH SÁCH HỖ TRỢ & BẢO HÀNH DOANH NGHIỆP
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>Bảo hành đổi ứng viên thử việc</TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#0F172A', backgroundColor: '#F8FAFC' }}>
                    30 ngày
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    60 ngày
                  </TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Tích hợp hệ thống HRM / ATS qua API</TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center"><RemoveRoundedIcon sx={{ color: '#94A3B8' }} /></TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Kênh hỗ trợ chuyên biệt</TableCell>
                  <TableCell align="center">Hotline / Email</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}>Chuyên viên Zalo 24/7</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Dedicated 1-on-1</TableCell>
                  <TableCell align="center">Hotline</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ color: '#334155' }}>Xuất hóa đơn VAT điện tử trong ngày</TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#F8FAFC' }}><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                  <TableCell align="center"><CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* SECTION 5: FORM ĐĂNG KÝ TƯ VẤN ENTERPRISE B2B                             */}
      {/* ========================================================================= */}
      <Box
        component="section"
        id="dang-ky-tu-van"
        className="gsap-form-section"
        sx={{
          py: { xs: 7, md: 10 },
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="stretch">
            {/* Visual Showcase Sidebar */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  p: { xs: 3, md: 4 },
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #1E293B',
                  boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src="/images/employer/pricing_showcase.jpg"
                  alt="InfoHR Enterprise Solutions Dashboard"
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: '12px',
                    mb: 3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1, fontSize: '1.25rem' }}>
                  Đồng Hành Cùng Doanh Nghiệp Kỹ Thuật Lớn
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
                  Giải pháp may đo riêng biệt tích hợp trực tiếp vào quy trình tuyển dụng và hệ sinh thái quản trị nhân sự của tập đoàn.
                </Typography>
                <Stack spacing={2} sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {[
                    'Phản hồi trong 15 phút từ chuyên viên kỹ thuật',
                    '100% hồ sơ ứng viên được bảo đảm xác thực',
                    'Kịch bản Voice AI may đo theo dự án',
                    'Bảo hành đổi hồ sơ thử việc lên đến 60 ngày',
                  ].map((point, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ color: '#60A5FA', fontSize: 18, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: '0.875rem' }}>
                        {point}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* Form Column */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                variant="outlined"
                className="gsap-form-card"
                sx={{
                  p: { xs: 3.5, sm: 4.5 },
                  borderColor: '#E2E8F0',
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack spacing={1.5} sx={{ mb: 3.5, textAlign: 'left' }}>
                  <Box>
                    <Chip
                      label="TƯ VẤN DOANH NGHIỆP"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        letterSpacing: '0.06em',
                        px: 1.5,
                        borderRadius: '100px',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '1.95rem' },
                      fontWeight: 800,
                      color: '#0F172A',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Nhận Báo Giá Tùy Chỉnh & Đặt Lịch Demo AILA AI
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    Để lại thông tin nhu cầu tuyển dụng, chuyên viên giải pháp của InfoHR sẽ liên hệ lại trong vòng 15 phút với bảng dự toán chi tiết.
                  </Typography>
                </Stack>

                {isSubmitted && (
                  <Alert
                    severity="success"
                    sx={{
                      mb: 3.5,
                      borderRadius: '10px',
                      backgroundColor: '#F8FAFC',
                      color: '#0F172A',
                      border: '1px solid #16A34A',
                      '& .MuiAlert-icon': { color: '#16A34A' },
                    }}
                    onClose={() => setIsSubmitted(false)}
                  >
                    Yêu cầu báo giá đã được gửi thành công! Chuyên viên tư vấn InfoHR sẽ liên hệ lại với Quý doanh nghiệp trong vòng 15 phút làm việc qua số điện thoại/Zalo đã cung cấp.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#0F172A' }}>
                        Họ và tên người liên hệ *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="contactName"
                        value={formState.contactName}
                        onChange={handleInputChange}
                        error={Boolean(formErrors.contactName)}
                        helperText={formErrors.contactName}
                        placeholder="Nguyễn Văn A (Phụ trách Tuyển dụng / Giám đốc)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#0F172A' }}>
                        Số điện thoại / Zalo *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="phone"
                        value={formState.phone}
                        onChange={handleInputChange}
                        error={Boolean(formErrors.phone)}
                        helperText={formErrors.phone}
                        placeholder="0912 345 678"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#0F172A' }}>
                        Tên công ty / Tổng thầu / Đơn vị tư vấn *
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        name="companyName"
                        value={formState.companyName}
                        onChange={handleInputChange}
                        error={Boolean(formErrors.companyName)}
                        helperText={formErrors.companyName}
                        placeholder="Công ty CP Xây dựng & Cơ điện ..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#0F172A' }}>
                        Nhu cầu tuyển dụng chính *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        name="hiringNeed"
                        value={formState.hiringNeed}
                        onChange={handleInputChange}
                        error={Boolean(formErrors.hiringNeed)}
                        helperText={formErrors.hiringNeed}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                          },
                        }}
                      >
                        <MenuItem value="Gói Tăng Tốc (Professional) — 4.500.000 đ">
                          Gói Tăng Tốc (Professional) — 4.500.000 đ (Khuyên Dùng)
                        </MenuItem>
                        <MenuItem value="Gói Doanh Nghiệp (Enterprise) — Báo giá tùy chỉnh">
                          Gói Doanh Nghiệp (Enterprise) — Báo giá may đo theo quy mô
                        </MenuItem>
                        <MenuItem value="Gói Khởi Đầu (Starter) — 1.800.000 đ">
                          Gói Khởi Đầu (Starter) — 1.800.000 đ
                        </MenuItem>
                        <MenuItem value="Thẻ Tiện Ích Lẻ (Lượt phỏng vấn AI / Điểm lọc CV)">
                          Thẻ Tiện Ích Lẻ (Lượt phỏng vấn AI / Điểm lọc CV)
                        </MenuItem>
                        <MenuItem value="Tuyển Chỉ huy trưởng / Kỹ sư Giám sát công trường">
                          Cần tuyển Chỉ huy trưởng / Kỹ sư Giám sát công trường
                        </MenuItem>
                        <MenuItem value="Tuyển Kỹ sư MEP / HVAC / PCCC">
                          Cần tuyển Kỹ sư Cơ điện MEP / HVAC / PCCC
                        </MenuItem>
                        <MenuItem value="Tuyển KTS / Thiết kế nội thất / Kỹ sư BIM">
                          Cần tuyển Kiến trúc sư / Thiết kế nội thất / BIM
                        </MenuItem>
                        <MenuItem value="Tư vấn tổng thể nhân lực cho dự án mới">
                          Tư vấn trọn gói nhân lực cho dự án khởi công mới
                        </MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: '#0F172A' }}>
                        Ghi chú thêm về yêu cầu hoặc quy mô dự án (Tùy chọn)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2.5}
                        name="notes"
                        value={formState.notes}
                        onChange={handleInputChange}
                        placeholder="VD: Cần tuyển gấp 3 Kỹ sư MEP cho dự án tòa nhà 25 tầng tại Quận 7, TP.HCM..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        endIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon />}
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          color: '#FFFFFF',
                          py: 1.4,
                          fontWeight: 700,
                          fontSize: '0.975rem',
                          borderRadius: '12px',
                          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                          textTransform: 'none',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                            boxShadow: '0 6px 22px rgba(37, 99, 235, 0.45)',
                          },
                        }}
                      >
                        {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi Yêu Cầu Báo Giá & Nhận Tư Vấn'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ borderColor: '#E2E8F0', my: 2.5 }} />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="center"
                  spacing={{ xs: 1, sm: 2.5 }}
                  sx={{ color: '#64748B', fontSize: '0.85rem', textAlign: 'center' }}
                >
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    ✓ Cam kết phản hồi trong 15 phút
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    ✓ Bảo mật tuyệt đối thông tin dự án
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    ✓ Xuất hóa đơn VAT điện tử trong ngày
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========================================================================= */}
      {/* SECTION 6: FAQ ACCORDION CÂU HỎI THƯỜNG GẶP                              */}
      {/* ========================================================================= */}
      <Box
        component="section"
        id="cau-hoi-thuong-gap"
        className="gsap-faq-section"
        sx={{
          py: { xs: 7, md: 10 },
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} textAlign="center" alignItems="center" sx={{ mb: { xs: 5, md: 7 } }}>
            <Chip
              label="GIẢI ĐÁP MINH BẠCH"
              size="small"
              sx={{
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                px: 1.5,
                borderRadius: '100px',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Câu Hỏi Thường Gặp Về Dịch Vụ & Bảng Giá Tuyển Dụng
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#475569', maxWidth: 680, fontSize: { xs: '0.95rem', md: '1.05rem' } }}
            >
              Những thắc mắc thực tế nhất của các nhà tuyển dụng và doanh nghiệp kỹ thuật khi hợp tác cùng InfoHR.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {/* FAQ 1 */}
            <Accordion
              defaultExpanded
              className="gsap-faq-item"
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px !important',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#CBD5E1' },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#0F172A' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Làm sao để được bảo hành hoàn trả điểm lọc CV khi ứng viên không nghe máy?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  Trên hệ thống InfoHR, mỗi hồ sơ khi bạn mở khóa đều có nút &quot;Báo cáo trạng thái liên hệ&quot;. Nếu ứng viên không nghe máy sau 3 lần gọi ở các thời điểm khác nhau, hoặc số điện thoại đã đổi chủ/không liên lạc được, bạn chỉ cần bấm báo cáo trong vòng 48 giờ. Đội ngũ kiểm duyệt của InfoHR sẽ xác minh tự động và hoàn trả 100% số điểm lọc vào tài khoản doanh nghiệp của bạn trong vòng tối đa 24 giờ làm việc.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 2 */}
            <Accordion
              className="gsap-faq-item"
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px !important',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#CBD5E1' },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#0F172A' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Trợ lý AILA Voice AI phỏng vấn những nội dung gì và doanh nghiệp có được tự chỉnh sửa câu hỏi không?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  AILA Voice AI được huấn luyện chuyên sâu theo từng vị trí kỹ thuật: hỏi về quy trình thi công, tiêu chuẩn nghiệm thu TCVN, xử lý xung đột bản vẽ cơ điện MEP, phần mềm Revit/BIM, và kinh nghiệm hiện trường thực tế. Đối với gói Professional và Enterprise, Quý doanh nghiệp hoàn toàn có quyền tự thiết lập kịch bản, thêm các câu hỏi tình huống đặc thù của dự án hoặc tinh chỉnh tiêu chí chấm điểm kỹ thuật theo barem riêng của công ty.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 3 */}
            <Accordion
              className="gsap-faq-item"
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px !important',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#CBD5E1' },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#0F172A' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Quy trình thanh toán và xuất hóa đơn giá trị gia tăng (VAT) điện tử diễn ra như thế nào?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  InfoHR hỗ trợ thanh toán linh hoạt qua chuyển khoản ngân hàng doanh nghiệp (có hợp đồng dịch vụ) hoặc cổng thanh toán trực tuyến bảo mật. Ngay sau khi giao dịch thành công hoặc hợp đồng được ký kết, hệ thống kế toán của InfoHR sẽ phát hành hóa đơn điện tử VAT (hợp lệ theo quy định của Tổng cục Thuế) và gửi tự động qua email của doanh nghiệp ngay trong ngày làm việc.
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* FAQ 4 */}
            <Accordion
              className="gsap-faq-item"
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px !important',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: '#CBD5E1' },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#0F172A' }} />}
                sx={{ px: 3, py: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  Doanh nghiệp mới đăng ký có được hưởng chính sách ưu đãi hoặc dùng thử dịch vụ không?
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                  Có. Tất cả tài khoản doanh nghiệp mới sau khi hoàn tất xác thực giấy phép kinh doanh đều được InfoHR tặng ngay gói dùng thử bao gồm: 01 tin đăng tuyển chuyên ngành miễn phí (30 ngày) và 05 lượt trải nghiệm phỏng vấn sơ loại cùng Trợ lý Voice AI AILA. Ngoài ra, Quý doanh nghiệp sẽ được chuyên viên tư vấn 1-on-1 hướng dẫn chuẩn hóa mô tả công việc (JD) để thu hút ứng viên đạt chuẩn ngay từ tuần đầu tiên.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>

          {/* CTA Banner cuối trang */}
          <Box sx={{ mt: 7 }}>
            <Box
              sx={{
                p: { xs: 4, sm: 6, md: 7 },
                background:
                  'linear-gradient(135deg, rgba(11, 17, 32, 0.94) 0%, rgba(15, 23, 42, 0.88) 100%), url("/images/employer/cta_cyber_backdrop.jpg") center/cover no-repeat',
                color: '#FFFFFF',
                borderRadius: { xs: '20px', md: '24px' },
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.6), 0 0 40px rgba(37, 99, 235, 0.15)',
              }}
            >
              {/* Subtle radial ambient glow */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '-25%',
                  right: '-15%',
                  width: 450,
                  height: 450,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <Stack spacing={2.5} alignItems="center" sx={{ position: 'relative', zIndex: 1, maxWidth: 780, mx: 'auto' }}>
                <Chip
                  label="TƯ VẤN DOANH NGHIỆP"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '100px',
                  }}
                />

                <Typography
                  variant="h3"
                  sx={{
                    color: '#FFFFFF',
                    fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.25rem' },
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                  }}
                >
                  Cần Tư Vấn Gói Dịch Vụ Phù Hợp Nhất Cho Dự Án Của Bạn?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#94A3B8', maxWidth: 640, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.6 }}
                >
                  Đội ngũ chuyên viên tư vấn kỹ thuật của InfoHR luôn sẵn sàng đồng hành cùng các nhà thầu và doanh nghiệp 24/7.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    component={Link}
                    href={localizeRoutePath(`/${ROUTES.EMPLOYER_AUTH.REGISTER}`, i18n.language)}
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      px: 3.5,
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.45)',
                      textTransform: 'none',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                        boxShadow: '0 6px 22px rgba(37, 99, 235, 0.55)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Đăng Ký Tài Khoản Doanh Nghiệp
                  </Button>
                  <Button
                    onClick={handleScrollToSection('dang-ky-tu-van')}
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.25)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: '#FFFFFF',
                      px: 3.5,
                      py: 1.4,
                      fontWeight: 700,
                      borderRadius: '12px',
                      textTransform: 'none',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#60A5FA',
                        bgcolor: 'rgba(255, 255, 255, 0.12)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Yêu Cầu Báo Giá Tùy Chỉnh
                  </Button>
                </Stack>

                {/* Direct B2B contact channels */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.5, sm: 3 }}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    pt: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    color: '#E2E8F0',
                    fontSize: '0.95rem',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneInTalkOutlinedIcon sx={{ color: '#60A5FA', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                      Hotline: 028 7108 8688
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MailOutlineRoundedIcon sx={{ color: '#60A5FA', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                      Email: hotline@infohr.vn
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
