'use client';
import React, { Suspense, lazy, useState } from "react";
import { useParams } from 'next/navigation';
import {
  Box, Stack, Typography, Paper, Button, Chip, Divider, alpha, useTheme,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import { CV_TYPES } from "../../../../configs/constants";
import { useResumeDetail } from "../hooks/useEmployerQueries";
import { ResumeDetailResponse } from '@/types/models';

import PersonalInfoSection from './PersonalInfoSection';
import GeneralInfoSection from './GeneralInfoSection';
import CareerGoalsSection from './CareerGoalsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificateSection from './CertificateSection';
import LanguageSection from './LanguageSection';
import AdvancedSkillSection from './AdvancedSkillSection';
import type { ResumeDetailResponse as ModelsResumeDetailResponse } from '../../../../types/models';
import pc from '@/utils/muiColors';

const LazyPdf = lazy(() => import("../../../../components/Common/Pdf"));

const ProfileDetailCard: React.FC = () => {
  const { t } = useTranslation(['employer', 'common']);
  const theme = useTheme();
  const params = useParams();
  const slug = params?.slug as string;

  const { data: profileDetail, isLoading } = useResumeDetail(slug);
  const [showPdf, setShowPdf] = useState(true);

  if (isLoading) return <BackdropLoading open={true} />;
  if (!profileDetail) return null;

  const isOnlineCv = profileDetail?.type === CV_TYPES.cvWebsite;
  const fileUrl = profileDetail?.fileUrl || '';

  return (
    <Stack spacing={4}>
      {/* ── Personal / General / Goals ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (t) => t.customShadows?.z1,
        }}
      >
        <Stack spacing={6}>
          <PersonalInfoSection profileDetail={profileDetail as ResumeDetailResponse} />
          <GeneralInfoSection profileDetail={profileDetail as ModelsResumeDetailResponse} />
          <CareerGoalsSection profileDetail={profileDetail as ResumeDetailResponse} />
        </Stack>
      </Paper>

      {isOnlineCv ? (
        /* ── Online CV: all detail sections ── */
        <Stack spacing={4}>
          <ExperienceSection profileDetail={profileDetail as ResumeDetailResponse} />
          <EducationSection profileDetail={profileDetail as ResumeDetailResponse} />
          <CertificateSection profileDetail={profileDetail as ResumeDetailResponse} />
          <LanguageSection profileDetail={profileDetail as ResumeDetailResponse} />
          <AdvancedSkillSection profileDetail={profileDetail as ResumeDetailResponse} />
        </Stack>
      ) : (
        /* ── Attached CV: show PDF inline + download button ── */
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: (t) => t.customShadows?.z1,
          }}
        >
          {/* Header row */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: { xs: 3, md: 5 },
              py: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: pc.primary( 0.04),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: pc.error( 0.1),
                  color: 'error.main',
                  display: 'flex',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
                  {t('common:labels.attachedResume')}
                </Typography>
                {profileDetail.title && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {profileDetail.title}
                  </Typography>
                )}
              </Box>
              <Chip
                label="PDF"
                size="small"
                sx={{
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  height: 20,
                  bgcolor: pc.error( 0.08),
                  color: 'error.main',
                  border: '1px solid',
                  borderColor: pc.error( 0.15),
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                startIcon={<OpenInNewIcon fontSize="small" />}
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                disabled={!fileUrl}
                sx={{
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                }}
              >
                {t('common:actions.openNewTab')}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon fontSize="small" />}
                href={fileUrl}
                download
                disabled={!fileUrl}
                sx={{
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  boxShadow: theme.customShadows?.primary,
                }}
              >
                {t('common:actions.download')}
              </Button>
            </Stack>
          </Stack>

          {/* PDF viewer */}
          {fileUrl ? (
            <Box sx={{ minHeight: 700, bgcolor: '#f5f5f5' }}>
              <Suspense
                fallback={
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
                    <ArticleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {t('profileDetailCard.messages.loadingPdf')}
                    </Typography>
                  </Stack>
                }
              >
                <LazyPdf fileUrl={fileUrl} title={profileDetail?.title || ''} />
              </Suspense>
            </Box>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800 }}>
                {t('profileDetailCard.messages.noAttachedFile')}
              </Typography>
            </Stack>
          )}
        </Paper>
      )}
    </Stack>
  );
};

export default ProfileDetailCard;