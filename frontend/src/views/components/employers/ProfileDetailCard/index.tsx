'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Breadcrumbs,
  Grid2 as Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTranslation } from 'react-i18next';

import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';
import { useResumeDetail } from '../hooks/useEmployerQueries';
import { getSafeResourceUrl } from '@/utils/safeExternalUrl';

import CandidateHeader from './CandidateHeader';
import CandidateTabs, { type CandidateTabKey } from './CandidateTabs';
import CandidateOverview from './CandidateOverview';
import CandidateSidebar from './CandidateSidebar';
import CandidateExperienceTab from './CandidateExperienceTab';
import CandidateSkillsTab from './CandidateSkillsTab';
import CandidateInterviewTab from './CandidateInterviewTab';
import CandidateDocumentsTab from './CandidateDocumentsTab';
import CandidateActivityTab from './CandidateActivityTab';

const ProfileDetailCard: React.FC = () => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const params = useParams();
  const slug = params?.slug as string;
  const { allConfig } = useConfig();
  const [activeTab, setActiveTab] = useState<CandidateTabKey>('overview');

  const { data, isLoading } = useResumeDetail(slug);

  if (isLoading) return <BackdropLoading open={true} />;

  if (!data) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 7 },
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          textAlign: 'center',
          bgcolor: '#FFFFFF',
        }}
      >
        <AccountCircleIcon sx={{ fontSize: 58, color: '#94A3B8', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
          {t('profileDetailCard.title.profileNotFound', { defaultValue: 'Không tìm thấy hồ sơ ứng viên' })}
        </Typography>
        <Typography sx={{ mt: 1, color: '#64748B', fontWeight: 500 }}>
          {t('profileDetailCard.title.privateProfile', {
            defaultValue: 'Hồ sơ này có thể đã bị ẩn hoặc không còn khả dụng trên hệ thống.',
          })}
        </Typography>
      </Paper>
    );
  }

  const profileDetail = data as ResumeDetailResponse;
  const sourcePayload = (profileDetail.sourcePayload || {}) as Record<string, any>;

  const fileUrl =
    profileDetail.fileUrl ||
    (profileDetail as any).resumeFileUrl ||
    sourcePayload.cvFileUrl ||
    sourcePayload.cv_file_url ||
    sourcePayload.detail_page?.cv_file_url ||
    sourcePayload.detail_api?.attached_file?.url ||
    '';

  const notUpdated = t('common:labels.notUpdated', { defaultValue: 'Chưa cập nhật' });
  const candidateName =
    profileDetail.user?.fullName ||
    profileDetail.userDict?.fullName ||
    profileDetail.jobSeekerProfile?.userDict?.fullName ||
    profileDetail.jobSeekerProfileDict?.fullName ||
    notUpdated;

  const avatarUrl =
    profileDetail.user?.avatarUrl ||
    profileDetail.userDict?.avatarUrl ||
    profileDetail.jobSeekerProfile?.userDict?.avatarUrl ||
    undefined;

  const locationText =
    (typeof profileDetail.city === 'object' && profileDetail.city?.name) ||
    tConfig(allConfig?.cityDict?.[String(profileDetail.city ?? '')]) ||
    tConfig(allConfig?.cityDict?.[String(profileDetail.jobSeekerProfile?.location?.city ?? '')]);

  // Salary format preservation for test and display
  const salaryText = formatLocalizedSalaryRange(profileDetail.salaryMin, profileDetail.salaryMax, i18n.language);

  const safeFileUrl = getSafeResourceUrl(fileUrl);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. BREADCRUMB */}
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16, color: '#94A3B8' }} />}
        aria-label="breadcrumb"
        sx={{ mb: 2.5 }}
      >
        <Link href="/employer/dashboard" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem', '&:hover': { color: '#2563EB' } }}>
            Nhà tuyển dụng
          </Typography>
        </Link>
        <Link href="/employer/resumes" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem', '&:hover': { color: '#2563EB' } }}>
            Quản lý ứng viên
          </Typography>
        </Link>
        <Link href="/employer/candidates" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.8125rem', '&:hover': { color: '#2563EB' } }}>
            Tìm kiếm ứng viên
          </Typography>
        </Link>
        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.8125rem' }}>
          Thông tin ứng viên
        </Typography>
      </Breadcrumbs>

      <Stack spacing={2.5}>
        {/* 2. CANDIDATE HEADER HERO */}
        <CandidateHeader
          profileDetail={profileDetail}
          candidateName={candidateName}
          avatarUrl={avatarUrl}
          locationText={locationText}
          fileUrl={safeFileUrl}
        />

        {/* 3. TAB NAVIGATION */}
        <CandidateTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          experienceCount={profileDetail.experiencesDetails?.length}
          skillsCount={profileDetail.advancedSkills?.length}
        />

        {/* 4. MAIN LAYOUT: CONTENT + SIDEBAR */}
        <Grid container spacing={3} alignItems="flex-start">
          {/* Left / Main Section (72%) */}
          <Grid size={{ xs: 12, lg: 8.5 }}>
            {activeTab === 'overview' && (
              <CandidateOverview
                profileDetail={profileDetail}
                onOpenDocumentTab={() => setActiveTab('documents')}
              />
            )}

            {activeTab === 'experience' && (
              <CandidateExperienceTab profileDetail={profileDetail} />
            )}

            {activeTab === 'skills' && (
              <CandidateSkillsTab profileDetail={profileDetail} />
            )}

            {activeTab === 'interview' && (
              <CandidateInterviewTab profileDetail={profileDetail} />
            )}

            {activeTab === 'documents' && (
              <CandidateDocumentsTab profileDetail={profileDetail} fileUrl={safeFileUrl} />
            )}

            {activeTab === 'activity' && (
              <CandidateActivityTab profileDetail={profileDetail} />
            )}
          </Grid>

          {/* Right / Sidebar Section (28%) */}
          <Grid size={{ xs: 12, lg: 3.5 }}>
            <CandidateSidebar profileDetail={profileDetail} fileUrl={safeFileUrl} />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );

};

export default ProfileDetailCard;
