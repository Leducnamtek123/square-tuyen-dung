'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  LEGAL_DOCUMENTS,
  LegalDocument,
  LegalSection,
  getLegalDocument,
} from './legalData';
import toastMessages from '@/utils/toastMessages';

interface Props {
  slug: string;
  portal?: 'jobseeker' | 'employer';
}

export const LegalPolicyViewer: React.FC<Props> = ({ slug, portal = 'jobseeker' }) => {
  const doc: LegalDocument = getLegalDocument(slug) || LEGAL_DOCUMENTS['thoa-thuan-su-dung'];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toastMessages.success('Đã sao chép liên kết vào bộ nhớ tạm');
    }
  };

  const homeHref = portal === 'employer' ? '/employer/introduce' : '/';
  const homeLabel = portal === 'employer' ? 'Nhà tuyển dụng' : 'Trang chủ';

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#f8fafc',
        minHeight: '80vh',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        {/* ── Breadcrumbs ── */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#94a3b8' }} />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link
            href={homeHref}
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {homeLabel}
          </Link>
          <Typography
            sx={{
              color: '#0f172a',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {doc.shortTitle}
          </Typography>
        </Breadcrumbs>

        {/* ── Main Document Container (Clean Vieclam24h Format) ── */}
        <Paper
          elevation={0}
          sx={{
            maxWidth: 960,
            mx: 'auto',
            p: { xs: 3, sm: 5, md: 6 },
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header Section */}
          <Box sx={{ pb: 3, borderBottom: '1px solid #f1f5f9' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  label={portal === 'employer' ? 'Dành cho Nhà tuyển dụng' : 'Dành cho Khách hàng & Ứng viên'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backgroundColor: portal === 'employer' ? '#eff6ff' : '#f0fdf4',
                    color: portal === 'employer' ? '#1d4ed8' : '#15803d',
                    border: `1px solid ${portal === 'employer' ? '#bfdbfe' : '#bbf7d0'}`,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Cập nhật lần cuối: <strong>{doc.lastUpdated}</strong>
                </Typography>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} sx={{ '@media print': { display: 'none' } }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ShareOutlinedIcon fontSize="small" />}
                  onClick={handleCopyLink}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#cbd5e1',
                    color: '#475569',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#94a3b8',
                      backgroundColor: '#f8fafc',
                    },
                  }}
                >
                  Sao chép liên kết
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PrintOutlinedIcon fontSize="small" />}
                  onClick={handlePrint}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#cbd5e1',
                    color: '#475569',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#94a3b8',
                      backgroundColor: '#f8fafc',
                    },
                  }}
                >
                  In văn bản
                </Button>
              </Stack>
            </Stack>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '1.375rem', sm: '1.625rem', md: '1.875rem' },
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.35,
                mb: 1.5,
              }}
            >
              {doc.title}
            </Typography>

            {doc.subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  lineHeight: 1.6,
                }}
              >
                {doc.subtitle}
              </Typography>
            )}
          </Box>

          {/* Document Summary Box (if present) */}
          {doc.summary && (
            <Box
              sx={{
                my: 3.5,
                p: { xs: 2.5, sm: 3 },
                borderRadius: 2.5,
                backgroundColor: '#f8fafc',
                borderLeft: '4px solid #2563eb',
                borderTop: '1px solid #e2e8f0',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#334155',
                  lineHeight: 1.7,
                  fontSize: '0.9375rem',
                  fontStyle: 'italic',
                }}
              >
                {doc.summary}
              </Typography>
            </Box>
          )}

          {/* Document Body Sections */}
          <Box sx={{ mt: 3 }}>
            {doc.sections.map((section: LegalSection, sIdx: number) => (
              <Box
                key={section.id || sIdx}
                id={section.id}
                sx={{
                  mb: 4,
                  '&:last-child': { mb: 0 },
                }}
              >
                {/* Section Header */}
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.0625rem', sm: '1.1875rem' },
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.4,
                    mb: 1.5,
                  }}
                >
                  {section.title}
                </Typography>

                {/* Section Content */}
                {section.content && (
                  <Box sx={{ color: '#334155', fontSize: '0.9375rem', lineHeight: 1.75, mb: 2 }}>
                    {section.content.split('\n').map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;

                      // Bullet point rendering
                      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                        return (
                          <Box
                            key={pIdx}
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1.25,
                              mt: 0.75,
                              ml: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: '#2563eb',
                                mt: 1.1,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: '#334155', lineHeight: 1.7, fontSize: '0.9375rem' }}
                            >
                              {trimmed.replace(/^[-•]\s*/, '')}
                            </Typography>
                          </Box>
                        );
                      }

                      // Numbered item rendering (e.g. 1. , 2. )
                      if (/^\d+\.\s/.test(trimmed)) {
                        return (
                          <Typography
                            key={pIdx}
                            variant="body2"
                            sx={{ color: '#334155', lineHeight: 1.75, fontSize: '0.9375rem', mt: 1, ml: 1 }}
                          >
                            {trimmed}
                          </Typography>
                        );
                      }

                      return (
                        <Typography
                          key={pIdx}
                          variant="body2"
                          sx={{ color: '#334155', lineHeight: 1.75, fontSize: '0.9375rem', mb: 1 }}
                        >
                          {trimmed}
                        </Typography>
                      );
                    })}
                  </Box>
                )}

                {/* Section Callout (if any) */}
                {section.callout && (
                  <Box
                    sx={{
                      p: 2,
                      my: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      backgroundColor:
                        section.callout.type === 'warning'
                          ? '#fffbeb'
                          : section.callout.type === 'tip'
                          ? '#f0fdf4'
                          : '#eff6ff',
                      border: `1px solid ${
                        section.callout.type === 'warning'
                          ? '#fde68a'
                          : section.callout.type === 'tip'
                          ? '#bbf7d0'
                          : '#bfdbfe'
                      }`,
                    }}
                  >
                    {section.callout.type === 'warning' ? (
                      <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 20, mt: 0.2 }} />
                    ) : section.callout.type === 'tip' ? (
                      <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: 20, mt: 0.2 }} />
                    ) : (
                      <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 20, mt: 0.2 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          section.callout.type === 'warning'
                            ? '#92400e'
                            : section.callout.type === 'tip'
                            ? '#166534'
                            : '#1e40af',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        fontWeight: 500,
                      }}
                    >
                      {section.callout.text}
                    </Typography>
                  </Box>
                )}

                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <Stack spacing={2.5} sx={{ pl: { xs: 1, sm: 2 }, mt: 2 }}>
                    {section.subsections.map((sub, subIdx) => (
                      <Box key={sub.id || subIdx} id={sub.id}>
                        <Typography
                          component="h3"
                          sx={{
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            color: '#1e293b',
                            lineHeight: 1.4,
                            mb: 1,
                          }}
                        >
                          {sub.title}
                        </Typography>
                        {sub.content && (
                          <Box sx={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.7 }}>
                            {sub.content.split('\n').map((subP, subPIdx) => {
                              const trimmedSub = subP.trim();
                              if (!trimmedSub) return null;
                              return (
                                <Typography
                                  key={subPIdx}
                                  variant="body2"
                                  sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.875rem', mb: 0.75 }}
                                >
                                  {trimmedSub}
                                </Typography>
                              );
                            })}
                          </Box>
                        )}
                        {sub.callout && (
                          <Box
                            sx={{
                              p: 1.75,
                              mt: 1.5,
                              borderRadius: 1.5,
                              backgroundColor: sub.callout.type === 'warning' ? '#fffbeb' : '#eff6ff',
                              border: `1px solid ${sub.callout.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: sub.callout.type === 'warning' ? '#92400e' : '#1e40af',
                                fontSize: '0.8125rem',
                                lineHeight: 1.6,
                                fontWeight: 500,
                              }}
                            >
                              {sub.callout.text}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />

          {/* Footer Contact & Company Info Box */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 2.5,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}
            >
              Mọi thắc mắc hoặc yêu cầu hỗ trợ về chính sách & dữ liệu cá nhân, vui lòng liên hệ:
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnOutlinedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
                  Trụ sở: <strong>29 Hòa Hảo, Phường 2, Quận 10, TP. Hồ Chí Minh, Việt Nam</strong>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneInTalkOutlinedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
                  Hotline hỗ trợ:{' '}
                  <a
                    href="tel:0987987733"
                    style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                  >
                    0987 987 733
                  </a>{' '}
                  |{' '}
                  <a
                    href="tel:02871082424"
                    style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                  >
                    (028) 7108 2424
                  </a>
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <MailOutlineIcon sx={{ color: '#64748b', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.875rem' }}>
                  Email:{' '}
                  <a
                    href="mailto:support@infohr.vn"
                    style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                  >
                    support@infohr.vn
                  </a>
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LegalPolicyViewer;

