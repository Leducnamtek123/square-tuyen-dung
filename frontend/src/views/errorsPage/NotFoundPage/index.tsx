'use client';

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Grid2 as Grid,
  Card,
  Container,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { ROUTES } from '@/configs/constants';

interface DestinationItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
  path: string;
  ariaLabel: string;
}

const NotFoundPage = () => {
  const { t, i18n } = useTranslation('errors');
  const router = useRouter();
  const rawPathname = usePathname() || (typeof window !== 'undefined' ? window.location.pathname : '');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Contextual portal detection (Employer / Admin / Job Seeker)
  const isEmployer = useMemo(
    () => rawPathname.startsWith('/employer') || rawPathname.startsWith('/nha-tuyen-dung'),
    [rawPathname]
  );
  const isAdmin = useMemo(
    () => rawPathname.startsWith('/admin') || rawPathname.startsWith('/quan-tri'),
    [rawPathname]
  );

  const homePath = useMemo(() => {
    if (isEmployer) return localizeRoutePath(`/${ROUTES.EMPLOYER.DASHBOARD}`, i18n.language);
    if (isAdmin) return '/admin/dashboard';
    return '/';
  }, [isEmployer, isAdmin, i18n.language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (isEmployer) {
      const candidatesPath = localizeRoutePath(`/${ROUTES.EMPLOYER.PROFILE}`, i18n.language);
      router.push(`${candidatesPath}?kw=${encodeURIComponent(query)}`);
    } else {
      const jobsPath = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);
      router.push(`${jobsPath}?kw=${encodeURIComponent(query)}`);
    }
  };

  // Context-aware helpful destinations
  const destinations: DestinationItem[] = useMemo(() => {
    if (isEmployer) {
      return [
        {
          title: t('employerCandidatesTitle', { defaultValue: 'Tìm kiếm ứng viên' }),
          desc: t('employerCandidatesDesc', { defaultValue: 'Khám phá hàng ngàn hồ sơ ứng viên tài năng' }),
          icon: <PeopleOutlineRoundedIcon sx={{ fontSize: 20 }} />,
          path: localizeRoutePath(`/${ROUTES.EMPLOYER.PROFILE}`, i18n.language),
          ariaLabel: 'Chuyển đến trang tìm kiếm ứng viên cho nhà tuyển dụng',
        },
        {
          title: t('employerJobPostsTitle', { defaultValue: 'Quản lý tin tuyển dụng' }),
          desc: t('employerJobPostsDesc', { defaultValue: 'Đăng tin mới và theo dõi tiến độ tuyển dụng' }),
          icon: <PostAddOutlinedIcon sx={{ fontSize: 20 }} />,
          path: localizeRoutePath(`/${ROUTES.EMPLOYER.JOB_POST}`, i18n.language),
          ariaLabel: 'Chuyển đến trang quản lý tin đăng tuyển dụng',
        },
        {
          title: t('employerAppliedTitle', { defaultValue: 'Hồ sơ ứng tuyển mới' }),
          desc: t('employerAppliedDesc', { defaultValue: 'Xem danh sách và đánh giá ứng viên nộp CV' }),
          icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} />,
          path: localizeRoutePath(`/${ROUTES.EMPLOYER.APPLIED_PROFILE}`, i18n.language),
          ariaLabel: 'Chuyển đến trang xem hồ sơ ứng viên nộp CV',
        },
        {
          title: t('employerDashboardTitle', { defaultValue: 'Bảng điều khiển NTD' }),
          desc: t('employerDashboardDesc', { defaultValue: 'Tổng quan báo cáo & hiệu suất tuyển dụng' }),
          icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />,
          path: localizeRoutePath(`/${ROUTES.EMPLOYER.DASHBOARD}`, i18n.language),
          ariaLabel: 'Chuyển đến bảng điều khiển nhà tuyển dụng',
        },
      ];
    }

    if (isAdmin) {
      return [
        {
          title: 'Bảng điều khiển Quản trị',
          desc: 'Tổng quan chỉ số hệ thống, dữ liệu người dùng & việc làm',
          icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} />,
          path: '/admin/dashboard',
          ariaLabel: 'Chuyển đến bảng điều khiển quản trị viên',
        },
        {
          title: 'Quản lý tin tuyển dụng',
          desc: 'Duyệt bài đăng, kiểm duyệt nội dung tin tuyển dụng',
          icon: <WorkOutlineRoundedIcon sx={{ fontSize: 20 }} />,
          path: '/admin/jobs',
          ariaLabel: 'Chuyển đến trang quản lý tin tuyển dụng quản trị',
        },
        {
          title: 'Quản lý ứng viên & CV',
          desc: 'Tra cứu thông tin tài khoản ứng viên và hồ sơ CV',
          icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />,
          path: '/admin/profiles',
          ariaLabel: 'Chuyển đến trang quản lý hồ sơ ứng viên quản trị',
        },
        {
          title: 'Quản lý người dùng',
          desc: 'Phân quyền tài khoản doanh nghiệp & ứng viên',
          icon: <PeopleOutlineRoundedIcon sx={{ fontSize: 20 }} />,
          path: '/admin/users',
          ariaLabel: 'Chuyển đến trang quản trị tài khoản người dùng',
        },
      ];
    }

    // Default: Job Seeker & Public Portal
    return [
      {
        title: t('findJobsTitle', { defaultValue: 'Tìm việc làm hot' }),
        desc: t('findJobsDesc', { defaultValue: 'Khám phá hàng ngàn việc làm lương cao mới nhất' }),
        icon: <WorkOutlineRoundedIcon sx={{ fontSize: 20 }} />,
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language),
        ariaLabel: 'Chuyển đến trang tìm kiếm việc làm',
      },
      {
        title: t('cvBuilderTitle', { defaultValue: 'Mẫu CV chuẩn ATS' }),
        desc: t('cvBuilderDesc', { defaultValue: 'Thiết kế CV chuyên nghiệp, chuẩn hóa ATS miễn phí' }),
        icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />,
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.CV_TEMPLATES}`, i18n.language),
        ariaLabel: 'Chuyển đến trang danh sách mẫu CV',
      },
      {
        title: t('topCompaniesTitle', { defaultValue: 'Top Công ty hàng đầu' }),
        desc: t('topCompaniesDesc', { defaultValue: 'Khám phá văn hóa & môi trường làm việc lý tưởng' }),
        icon: <BusinessOutlinedIcon sx={{ fontSize: 20 }} />,
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.COMPANY}`, i18n.language),
        ariaLabel: 'Chuyển đến trang danh sách công ty hàng đầu',
      },
      {
        title: t('notificationsTitle', { defaultValue: 'Thông báo & Tin mới' }),
        desc: t('notificationsDesc', { defaultValue: 'Xem gợi ý việc làm và cập nhật cơ hội mới nhất' }),
        icon: <NotificationsActiveOutlinedIcon sx={{ fontSize: 20 }} />,
        path: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NOTIFICATION}`, i18n.language),
        ariaLabel: 'Chuyển đến trang thông báo việc làm',
      },
    ];
  }, [isEmployer, isAdmin, t, i18n.language]);

  return (
    <Box
      component="main"
      role="main"
      aria-labelledby="not-found-heading"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
        px: { xs: 2.5, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Background Architectural Grid Pattern & Ambient Glow */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(180deg, rgba(248,250,252,0.6) 0%, rgba(241,245,249,1) 100%)',
          backgroundSize: '28px 28px, 100% 100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 280, sm: 500, md: 700 },
          height: { xs: 280, sm: 400, md: 500 },
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, rgba(37, 99, 235, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Architectural Monospaced Status Pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 0.75,
              borderRadius: '9999px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              mb: 3,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)',
                animation: 'beacon 2.5s infinite ease-in-out',
                '@keyframes beacon': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.4, transform: 'scale(0.85)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#334155',
                textTransform: 'uppercase',
              }}
            >
              404 &bull; HTTP_NOT_FOUND
            </Typography>
          </Box>

          {/* Primary Semantic H1 Heading */}
          <Typography
            id="not-found-heading"
            variant="h1"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              fontSize: { xs: '1.875rem', sm: '2.375rem', md: '2.75rem' },
              letterSpacing: '-0.035em',
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            {t('notFoundTitle', { defaultValue: 'Không tìm thấy trang yêu cầu' })}
          </Typography>

          {/* Body Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#475569',
              maxWidth: 580,
              fontSize: { xs: '0.9375rem', sm: '1.0625rem' },
              lineHeight: 1.65,
              mb: 4,
            }}
          >
            {t('notFoundBody', {
              defaultValue:
                'Đường dẫn bạn truy cập có thể đã đổi tên, bị gỡ bỏ hoặc tạm thời không khả dụng. Bạn hãy thử tìm kiếm hoặc khám phá các mục đề xuất bên dưới.',
            })}
          </Typography>

          {/* Accessible Context-Aware Search Box */}
          <Box
            component="form"
            onSubmit={handleSearch}
            role="search"
            aria-label={isEmployer ? 'Tìm kiếm ứng viên' : 'Tìm kiếm việc làm'}
            sx={{
              width: '100%',
              maxWidth: 540,
              mb: 4,
            }}
          >
            <label htmlFor="not-found-search-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
              {isEmployer ? 'Nhập chức danh hoặc kỹ năng ứng viên cần tìm' : 'Nhập từ khóa tìm việc làm, công ty, vị trí'}
            </label>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.625,
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&:focus-within': {
                  borderColor: '#2563eb',
                  boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.16)',
                },
              }}
            >
              <TextField
                id="not-found-search-input"
                fullWidth
                variant="standard"
                placeholder={
                  isEmployer
                    ? t('employerSearchPlaceholder', { defaultValue: 'Tìm ứng viên theo vị trí, kỹ năng...' })
                    : t('searchPlaceholder', { defaultValue: 'Nhập từ khóa tìm việc làm, công ty, vị trí...' })
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 1.5 }}>
                      <SearchRoundedIcon sx={{ color: '#64748b', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: '0.9375rem',
                    color: '#0f172a',
                    '& input::placeholder': {
                      color: '#64748b',
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                aria-label="Thực hiện tìm kiếm"
                sx={{
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  px: 3,
                  py: 1.125,
                  minHeight: 44,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  '&:focus-visible': {
                    outline: '2px solid #0f172a',
                    outlineOffset: '2px',
                  },
                }}
              >
                {t('search', { defaultValue: 'Tìm kiếm' })}
              </Button>
            </Box>
          </Box>

          {/* Primary & Secondary Dual-Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 6, width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeRoundedIcon sx={{ fontSize: 20 }} />}
              onClick={() => router.push(homePath)}
              aria-label={isEmployer ? 'Về trang chủ nhà tuyển dụng' : 'Về trang chủ InfoHR'}
              sx={{
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textTransform: 'none',
                px: 3.5,
                py: 1.35,
                minHeight: 48,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                },
                '&:focus-visible': {
                  outline: '2px solid #0f172a',
                  outlineOffset: '2px',
                },
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                  '&:hover': { transform: 'none' },
                },
              }}
            >
              {isEmployer
                ? t('backEmployerHome', { defaultValue: 'Về trang chủ NTD' })
                : isAdmin
                ? 'Về trang Quản trị'
                : t('backHome', { defaultValue: 'Về trang chủ' })}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 20 }} />}
              onClick={() => router.back()}
              aria-label="Quay lại trang trước đó"
              sx={{
                borderRadius: '12px',
                borderColor: '#cbd5e1',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textTransform: 'none',
                px: 3.5,
                py: 1.35,
                minHeight: 48,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                },
                '&:focus-visible': {
                  outline: '2px solid #2563eb',
                  outlineOffset: '2px',
                },
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            >
              {t('goBack', { defaultValue: 'Quay lại trang trước' })}
            </Button>
          </Stack>

          {/* Semantic H2: Helpful Navigation Cards Section */}
          <Box sx={{ width: '100%', pt: 4, borderTop: '1px solid #e2e8f0' }}>
            <Typography
              id="helpful-links-heading"
              variant="h2"
              sx={{
                fontWeight: 700,
                color: '#475569',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                mb: 3,
              }}
            >
              {t('popularDestinations', { defaultValue: 'Các trang hữu ích có thể bạn quan tâm:' })}
            </Typography>

            <Grid container spacing={2.5}>
              {destinations.map((dest) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={dest.title}>
                  <Card
                    component="a"
                    href={dest.path}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(dest.path);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(dest.path);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={dest.ariaLabel}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: '100%',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      textAlign: 'left',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                      '&:hover': {
                        borderColor: '#93c5fd',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06)',
                        '& .card-icon-box': {
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          borderColor: '#bfdbfe',
                        },
                        '& .card-arrow': {
                          transform: 'translateX(3px)',
                          color: '#2563eb',
                        },
                      },
                      '&:focus-visible': {
                        outline: '2px solid #2563eb',
                        outlineOffset: '2px',
                      },
                      '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                        '&:hover': { transform: 'none' },
                        '&:hover .card-arrow': { transform: 'none' },
                      },
                    }}
                  >
                    <Box>
                      <Box
                        className="card-icon-box"
                        aria-hidden="true"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1.75,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {dest.icon}
                      </Box>
                      <Typography
                        component="h3"
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: '#0f172a', mb: 0.75, fontSize: '0.9375rem', lineHeight: 1.4 }}
                      >
                        {dest.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#475569', lineHeight: 1.5, fontSize: '0.8125rem' }}
                      >
                        {dest.desc}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.25 }}>
                      <ArrowForwardRoundedIcon
                        className="card-arrow"
                        aria-hidden="true"
                        sx={{
                          fontSize: 18,
                          color: '#94a3b8',
                          transition: 'transform 0.2s ease, color 0.2s ease',
                        }}
                      />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Customer Support Contact Footer Note */}
          <Box
            sx={{
              mt: 5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
            }}
          >
            <SupportAgentOutlinedIcon sx={{ fontSize: 18, color: '#475569' }} aria-hidden="true" />
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.8125rem', fontWeight: 500 }}>
              {t('needHelp', {
                defaultValue: 'Cần hỗ trợ? Đội ngũ chăm sóc khách hàng InfoHR luôn sẵn sàng đồng hành cùng bạn.',
              })}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
