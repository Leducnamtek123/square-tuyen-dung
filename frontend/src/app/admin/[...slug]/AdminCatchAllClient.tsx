'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useTranslation } from 'react-i18next';
import ProfileDetailPage from '@/views/adminPages/ProfileDetailPage';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { ROUTES } from '@/configs/constants';

const ADMIN_SLUG_MAP: Record<string, string> = {
  'tro-ly-agent': ROUTES.ADMIN.AGENT_ASSISTANTS,
  'tro-ly-agent-quan-tri': ROUTES.ADMIN.AGENT_ASSISTANTS,
  'agent-assistants': ROUTES.ADMIN.AGENT_ASSISTANTS,
  'cai-dat-he-thong': ROUTES.ADMIN.SETTINGS,
  'cai-dat': ROUTES.ADMIN.SETTINGS,
  'settings': ROUTES.ADMIN.SETTINGS,
  'ket-noi-voi-nha-tuyen-dung': ROUTES.ADMIN.CHAT,
  'ket-noi-voi-ung-vien': ROUTES.ADMIN.CHAT,
  'chat': ROUTES.ADMIN.CHAT,
  'nhat-ky-tin-tuyen-dung': ROUTES.ADMIN.JOB_ACTIVITY,
  'job-activity': ROUTES.ADMIN.JOB_ACTIVITY,
  'bang-dieu-khien': ROUTES.ADMIN.DASHBOARD,
  'dashboard': ROUTES.ADMIN.DASHBOARD,
  'quan-ly-nguoi-dung': ROUTES.ADMIN.USERS,
  'users': ROUTES.ADMIN.USERS,
  'quan-ly-tin-tuyen-dung': ROUTES.ADMIN.JOBS,
  'jobs': ROUTES.ADMIN.JOBS,
  'thong-bao-viec-lam': ROUTES.ADMIN.JOB_NOTIFICATIONS,
  'job-notifications': ROUTES.ADMIN.JOB_NOTIFICATIONS,
  'quan-ly-phong-van': ROUTES.ADMIN.INTERVIEWS,
  'interviews': ROUTES.ADMIN.INTERVIEWS,
  'quan-ly-giong-noi-ai': ROUTES.ADMIN.VOICE_PROFILES,
  'voice-profiles': ROUTES.ADMIN.VOICE_PROFILES,
  'quan-ly-cong-ty': ROUTES.ADMIN.COMPANIES,
  'companies': ROUTES.ADMIN.COMPANIES,
  'quan-ly-ho-so-ung-vien': ROUTES.ADMIN.PROFILES,
  'profiles': ROUTES.ADMIN.PROFILES,
  'quan-ly-cv-resume': ROUTES.ADMIN.RESUMES,
  'resumes': ROUTES.ADMIN.RESUMES,
  'quan-ly-banner': ROUTES.ADMIN.BANNERS,
  'banners': ROUTES.ADMIN.BANNERS,
  'quan-ly-loai-banner': ROUTES.ADMIN.BANNER_TYPES,
  'banner-types': ROUTES.ADMIN.BANNER_TYPES,
  'quan-ly-danh-gia': ROUTES.ADMIN.FEEDBACKS,
  'feedbacks': ROUTES.ADMIN.FEEDBACKS,
  'tin-nhan-lien-he': ROUTES.ADMIN.CONTACT_MESSAGES,
  'contact-messages': ROUTES.ADMIN.CONTACT_MESSAGES,
  'tin-tuc-blog': ROUTES.ADMIN.ARTICLES,
  'articles': ROUTES.ADMIN.ARTICLES,
  'xac-thuc-cong-ty': ROUTES.ADMIN.COMPANY_VERIFICATIONS,
  'company-verifications': ROUTES.ADMIN.COMPANY_VERIFICATIONS,
  'bao-cao-tin-cay': ROUTES.ADMIN.TRUST_REPORTS,
  'trust-reports': ROUTES.ADMIN.TRUST_REPORTS,
  'nhat-ky-he-thong': ROUTES.ADMIN.AUDIT_LOGS,
  'audit-logs': ROUTES.ADMIN.AUDIT_LOGS,
  'xem-truoc-giao-dien-phong-van': ROUTES.ADMIN.INTERVIEW_PREVIEW,
  'interview-preview': ROUTES.ADMIN.INTERVIEW_PREVIEW,
  'he-thong-giao-dien': ROUTES.ADMIN.COMPONENTS,
  'components': ROUTES.ADMIN.COMPONENTS,
  'component': ROUTES.ADMIN.COMPONENTS,
  'quan-ly-nganh-nghe': ROUTES.ADMIN.CAREERS,
  'careers': ROUTES.ADMIN.CAREERS,
  'quan-ly-tinh-thanh': ROUTES.ADMIN.CITIES,
  'cities': ROUTES.ADMIN.CITIES,
  'quan-ly-quan-huyen': ROUTES.ADMIN.DISTRICTS,
  'districts': ROUTES.ADMIN.DISTRICTS,
  'quan-ly-phuong-xa': ROUTES.ADMIN.WARDS,
  'wards': ROUTES.ADMIN.WARDS,
};

export default function AdminCatchAllClient() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const { t } = useTranslation('common');
  const lang = getPreferredLanguage();
  const adminPrefix = getPortalPrefix('admin', lang);

  const rawSlug = params?.slug;
  const slugArray = Array.isArray(rawSlug) ? rawSlug : typeof rawSlug === 'string' ? [rawSlug] : [];

  // 1. Fallback redirect for known admin top-level routes
  const firstSlug = slugArray[0];
  const targetRoute = slugArray.length === 1 ? ADMIN_SLUG_MAP[firstSlug] : undefined;

  React.useEffect(() => {
    if (targetRoute) {
      const resolved = localizeRoutePath(`/${targetRoute}`, lang);
      if (typeof router.replace === 'function') {
        router.replace(resolved);
      } else if (typeof router.push === 'function') {
        router.push(resolved);
      }
    }
  }, [targetRoute, router, lang]);

  if (targetRoute) {
    return null;
  }

  // 2. Article sub-routes redirect fallback
  if (slugArray.length === 2 && (slugArray[0] === 'tin-tuc-blog' || slugArray[0] === 'articles')) {
    if (slugArray[1] === 'tao-moi' || slugArray[1] === 'create') {
      const createPath = localizeRoutePath(`/${ROUTES.ADMIN.ARTICLE_CREATE}`, lang);
      if (typeof router.replace === 'function') {
        router.replace(createPath);
      } else if (typeof router.push === 'function') {
        router.push(createPath);
      }
      return null;
    }
    const detailPath = localizeRoutePath(`/admin/articles/${slugArray[1]}`, lang);
    if (typeof router.replace === 'function') {
      router.replace(detailPath);
    } else if (typeof router.push === 'function') {
      router.push(detailPath);
    }
    return null;
  }

  // 3. Render ProfileDetailPage ONLY when explicit prefix is provided:
  // profiles, quan-ly-ho-so-ung-vien, ho-so-ung-vien, ho-so
  if (
    slugArray.length === 2 &&
    (slugArray[0] === 'profiles' ||
      slugArray[0] === 'quan-ly-ho-so-ung-vien' ||
      slugArray[0] === 'ho-so-ung-vien' ||
      slugArray[0] === 'ho-so')
  ) {
    return <ProfileDetailPage id={slugArray[1]} />;
  }

  // 3. Otherwise render an Admin NotFound state within the Admin layout
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 540,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 72, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
          404
        </Typography>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
          {t('notFound.title', { defaultValue: 'Trang quản trị không tồn tại' })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 420 }}>
          {t('notFound.message', {
            defaultValue:
              'Đường dẫn trong khu vực Quản trị có thể đã bị thay đổi hoặc không tồn tại. Vui lòng kiểm tra lại URL.',
          })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={() => router.push(localizeRoutePath(`/${ROUTES.ADMIN.DASHBOARD}`, lang))}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Bảng điều khiển Quản trị
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
