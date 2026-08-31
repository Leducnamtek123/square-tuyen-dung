'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import cvBuilderService from '@/services/cvBuilderService';
import { PublicCVRecord, CVData } from '@/types/cvBuilder';
import * as CountryFlags from 'country-flag-icons/react/3x2';
import { CVTemplateRenderer } from '../templates/CVTemplateRenderer';
import { printCVToPDF } from '../CVEditorPage/utils/pdfExport';
import { TabTitle } from '@/utils/generalFunction';
import toastMessages from '@/utils/toastMessages';

export const PublicCVPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const slug = String(params?.slug || '');
  const [cvLanguage, setCvLanguage] = React.useState<'vi' | 'en'>('vi');
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(850);

  React.useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        setContainerWidth(previewContainerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const a4WidthPx = 794; // 210mm in pixels at 96dpi
  const scaleRatio = Math.max(0.35, Math.min(1, (containerWidth - 24) / a4WidthPx));

  const {
    data: cvRecord,
    isLoading,
    isError,
  } = useQuery<PublicCVRecord>({
    queryKey: ['public-cv', slug],
    queryFn: () => cvBuilderService.getPublicCV(slug),
    enabled: Boolean(slug),
    retry: 1,
  });

  TabTitle(
    cvRecord
      ? `${cvRecord.title} - ${cvRecord.candidateName || cvRecord.candidate_name || 'Hồ sơ Ứng viên'} | InfoHR Tuyển Dụng`
      : 'Hồ Sơ CV Trực Tuyến | InfoHR Tuyển Dụng'
  );

  const handleDownloadPDF = () => {
    if (!cvRecord) return;
    const docTitle = `CV_${(cvRecord.candidateName || cvRecord.candidate_name || 'Ung_Vien').replace(/\s+/g, '_')}`;
    printCVToPDF('cv-print-area', docTitle);
    toastMessages.success('Đang chuẩn bị in bản CV PDF A4 chất lượng cao...');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toastMessages.success('Đã sao chép liên kết CV vào clipboard!');
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={36} sx={{ color: '#2563eb' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
          Đang tải hồ sơ CV trực tuyến...
        </Typography>
      </Box>
    );
  }

  if (isError || !cvRecord) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', textAlign: 'center', maxWidth: 450 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            CV không tồn tại hoặc đã ẩn
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.825rem', mb: 3 }}>
            Liên kết này có thể đã hết hạn, bị ứng viên đặt ở chế độ riêng tư hoặc đường dẫn không chính xác.
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: '10px',
              bgcolor: '#1e40af',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              py: 1,
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Về Trang chủ Tuyển dụng
          </Button>
        </Paper>
      </Box>
    );
  }

  const cvDataVal = (cvRecord.cvData || cvRecord.cv_data || {}) as Partial<CVData>;
  const themeConfigVal = cvRecord.themeConfig || cvRecord.theme_config || {};
  const templateCodeVal = cvRecord.templateCode || cvRecord.template_code || 'modern-navy';

  const cvData: CVData = {
    title: cvRecord.title || 'CV Ứng viên',
    templateId: templateCodeVal,
    theme: {
      primaryColor: '#1e40af',
      fontFamily: 'Inter',
      fontSize: 'medium',
      spacing: 'normal',
      avatarShape: 'circle',
      showAvatar: true,
      paperSize: 'A4',
      ...(cvDataVal.theme || {}),
      ...themeConfigVal,
    },
    personalInfo: {
      fullName: cvRecord.candidateName || cvRecord.candidate_name || '',
      title: '',
      email: '',
      phoneNumber: '',
      address: '',
      bio: '',
      ...(cvDataVal.personalInfo || {}),
    },
    experiences: cvDataVal.experiences || [],
    educations: cvDataVal.educations || [],
    skills: cvDataVal.skills || [],
    languages: cvDataVal.languages || [],
    certificates: cvDataVal.certificates || [],
    projects: cvDataVal.projects || [],
    ...cvDataVal,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Recruiter Action Bar ─────────────────────────────────────── */}
      <Paper
        elevation={0}
        className="no-print"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #cbd5e1',
          px: { xs: 2, sm: 4 },
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left Candidate Info */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            component={Link}
            href="/"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: '#475569',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: 1.5,
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            Trang chủ
          </Button>

          <Box sx={{ borderLeft: '1px solid #e2e8f0', pl: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
              {cvRecord.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#16a34a' }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem' }}>
                Hồ sơ ứng viên xác thực • Cập nhật {new Date((cvRecord.updateAt || cvRecord.update_at || Date.now()) as string).toLocaleDateString('vi-VN')}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            width: { xs: '100%', sm: 'auto' },
            gap: 1,
          }}
        >
          {cvData.personalInfo?.email && (
            <Button
              component="a"
              href={`mailto:${cvData.personalInfo.email}`}
              size="small"
              variant="outlined"
              startIcon={<MailOutlineIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              Gửi Email
            </Button>
          )}

          {cvData.personalInfo?.phoneNumber && (
            <Button
              component="a"
              href={`tel:${cvData.personalInfo.phoneNumber}`}
              size="small"
              variant="outlined"
              startIcon={<PhoneOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
              }}
            >
              Gọi điện
            </Button>
          )}

          {/* Language Switcher Pill */}
          {/* Language Switcher Pill with Vector Flag Icons */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ bgcolor: '#f1f5f9', p: 0.35, borderRadius: '8px', border: '1px solid #e2e8f0' }}
          >
            <Button
              size="small"
              onClick={() => setCvLanguage('vi')}
              startIcon={
                <Box sx={{ width: 17, height: 11, borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  <CountryFlags.VN style={{ display: 'block', width: '100%', height: '100%' }} />
                </Box>
              }
              sx={{
                py: 0.3,
                px: 1.25,
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 0,
                borderRadius: '6px',
                ...(cvLanguage === 'vi'
                  ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: '#64748b', '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' } }),
              }}
            >
              Việt
            </Button>
            <Button
              size="small"
              onClick={() => setCvLanguage('en')}
              startIcon={
                <Box sx={{ width: 17, height: 11, borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  <CountryFlags.GB style={{ display: 'block', width: '100%', height: '100%' }} />
                </Box>
              }
              sx={{
                py: 0.3,
                px: 1.25,
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 0,
                borderRadius: '6px',
                ...(cvLanguage === 'en'
                  ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: '#64748b', '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' } }),
              }}
            >
              Anh
            </Button>
          </Stack>

          <Button
            size="small"
            variant="outlined"
            onClick={handleCopyLink}
            startIcon={<ShareOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '8px',
              borderColor: '#cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
            }}
          >
            Chia sẻ
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleDownloadPDF}
            startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '8px',
              bgcolor: '#1e40af',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'none',
              px: 2,
              py: 0.7,
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Tải PDF A4
          </Button>
        </Stack>
      </Paper>

      {/* ── Main CV Sheet Render Area with Responsive Scaling ────────────── */}
      <Box
        ref={previewContainerRef}
        sx={{
          flex: 1,
          p: { xs: 1.5, sm: 3, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowX: 'hidden',
          overflowY: 'auto',
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: scaleRatio < 1 ? `${Math.round(a4WidthPx * scaleRatio)}px` : '210mm',
            minHeight: scaleRatio < 1 ? `${Math.round(1123 * scaleRatio)}px` : '297mm',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            mb: 4,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: '210mm',
              minHeight: '297mm',
              transform: scaleRatio < 1 ? `scale(${scaleRatio})` : 'none',
              transformOrigin: 'top left',
            }}
          >
            <div id="cv-print-area" style={{ width: '100%', background: '#ffffff' }}>
              <CVTemplateRenderer data={cvData} language={cvLanguage} />
            </div>
          </Box>
        </Box>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <Box className="no-print" sx={{ py: 2, textAlign: 'center', bgcolor: '#ffffff', borderTop: '1px solid #cbd5e1' }}>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Được tạo và bảo đảm bởi <strong>InfoHR Tuyển Dụng</strong> • Nền tảng tuyển dụng thông minh hàng đầu Việt Nam
        </Typography>
      </Box>
    </Box>
  );
};
