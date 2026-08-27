'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Divider,
  Grid2 as Grid,
  Stack,
  Typography,
} from '@mui/material';
import { ROUTES, APP_NAME } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import FooterSocialIcons from './FooterSocialIcons';
import { DmcaProtectedBadge, MinistryOfIndustryBadge } from './FooterBadges';

const subscribeToStaticYear = () => () => {};
const getCurrentYearSnapshot = () => new Date().getFullYear();

export const CandidateFooter: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'public']);
  const lang = i18n.language;

  const currentYear = React.useSyncExternalStore(
    subscribeToStaticYear,
    getCurrentYearSnapshot,
    getCurrentYearSnapshot
  );

  const infoLinks = [
    { label: 'Cẩm nang nghề nghiệp', route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}`, lang) },
    { label: 'Báo giá dịch vụ', route: localizeRoutePath(`/${ROUTES.EMPLOYER.PRICING}`, lang) },
    { label: 'Điều khoản sử dụng', route: `/${ROUTES.JOB_SEEKER.TERMS_HTML}` },
    { label: 'Quy định bảo mật', route: `/${ROUTES.JOB_SEEKER.PRIVACY_HTML}` },
    { label: 'Sơ đồ trang web', route: `/${ROUTES.JOB_SEEKER.SITEMAP_HTML}` },
    { label: 'Tuân thủ và sự đồng ý của Khách Hàng', route: `/${ROUTES.JOB_SEEKER.CONSENT_HTML}` },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        mt: 'auto',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      {/* ── Main Candidate Footer (Clean White Theme) ── */}
      <Box sx={{ py: { xs: 5, md: 6 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {/* Col 1: Về chúng tôi (48% width) */}
            <Grid size={{ xs: 12, md: 5.5, lg: 5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  mb: 2,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                Về chúng tôi
              </Typography>

              <Stack spacing={1.25} sx={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.6 }}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                  {APP_NAME}.vn - Công Ty Cổ Phần Công Nghệ Tuyển Dụng {APP_NAME}
                </Typography>

                <Typography sx={{ fontSize: '0.875rem' }}>
                  <Box component="span" sx={{ color: '#64748b', fontWeight: 600 }}>Trụ sở chính: </Box>
                  29 Hòa Hảo, Phường 2, Quận 10, TP. Hồ Chí Minh, Việt Nam
                </Typography>


                <Typography sx={{ fontSize: '0.875rem' }}>
                  <Box component="span" sx={{ color: '#64748b', fontWeight: 600 }}>Điện thoại: </Box>
                  <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>0987 987 733</Box>
                  {' '}|{' '}
                  <Box component="span" sx={{ color: '#0f172a', fontWeight: 700 }}>(028) 7108 2424</Box>
                </Typography>

                <Typography sx={{ fontSize: '0.875rem' }}>
                  <Box component="span" sx={{ color: '#64748b', fontWeight: 600 }}>Email hỗ trợ người tìm việc: </Box>
                  <Box component="a" href="mailto:ntv@infohr.vn" sx={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                    ntv@infohr.vn
                  </Box>
                </Typography>

                <Typography sx={{ fontSize: '0.875rem' }}>
                  <Box component="span" sx={{ color: '#64748b', fontWeight: 600 }}>Email hỗ trợ nhà tuyển dụng: </Box>
                  <Box component="a" href="mailto:ntd@infohr.vn" sx={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                    ntd@infohr.vn
                  </Box>
                </Typography>
              </Stack>
            </Grid>

            {/* Col 2: Thông tin (25% width) */}
            <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  mb: 2,
                  color: '#0f172a',
                }}
              >
                Thông tin
              </Typography>

              <Stack spacing={1.25}>
                {infoLinks.map((item) => (
                  <Box
                    key={item.label}
                    component={Link}
                    href={item.route}
                    sx={{
                      color: '#475569',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease, transform 0.15s ease',
                      display: 'inline-block',
                      '&:hover': {
                        color: '#2563eb',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Col 3: Kết nối (27% width) */}
            <Grid size={{ xs: 12, sm: 6, md: 3.5, lg: 3.5 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  mb: 1.5,
                  color: '#0f172a',
                }}
              >
                Kết nối với chúng tôi
              </Typography>

              <FooterSocialIcons variant="light" />
            </Grid>
          </Grid>

          <Divider sx={{ mt: 5, mb: 3, borderColor: '#e2e8f0' }} />

          {/* ── Bottom Bar with Trust Badges ── */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ textAlign: { xs: 'center', md: 'left' } }}
          >
            <Typography sx={{ color: '#475569', fontSize: '0.85rem' }}>
              © {currentYear} {APP_NAME}. Bản quyền được bảo lưu.
            </Typography>

            {/* Trust Badges: DMCA & Bộ Công Thương */}
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <DmcaProtectedBadge />
              <MinistryOfIndustryBadge />
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default CandidateFooter;
