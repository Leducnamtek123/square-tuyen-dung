'use client';

import React, { Suspense, lazy } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { getSafeResourceUrl } from '@/utils/safeExternalUrl';
import type { ResumeDetailResponse } from '@/types/models';

const LazyPdf = lazy(() => import('../../../../components/Common/Pdf'));

interface CandidateDocumentsTabProps {
  profileDetail: ResumeDetailResponse;
  fileUrl?: string;
}

export const CandidateDocumentsTab: React.FC<CandidateDocumentsTabProps> = ({
  profileDetail,
  fileUrl,
}) => {
  const actualFileUrl =
    fileUrl ||
    profileDetail.fileUrl ||
    (profileDetail as any).resumeFileUrl ||
    (profileDetail.sourcePayload as any)?.cvFileUrl ||
    (profileDetail.sourcePayload as any)?.cv_file_url ||
    '';
  const safeFileUrl = getSafeResourceUrl(actualFileUrl);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
              Tài liệu & Hồ sơ đính kèm (CV)
            </Typography>
          </Stack>

          {safeFileUrl && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={safeFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                }}
              >
                Mở tab mới
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                component="a"
                href={safeFileUrl}
                download
                startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  bgcolor: '#2563EB',
                }}
              >
                Tải xuống
              </Button>
            </Stack>
          )}
        </Stack>

        {safeFileUrl ? (
          <Box
            sx={{
              width: '100%',
              minHeight: 650,
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #CBD5E1',
              bgcolor: '#F8FAFC',
            }}
          >
            <Suspense
              fallback={
                <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 400 }}>
                  <CircularProgress size={36} />
                </Box>
              }
            >
              <LazyPdf fileUrl={safeFileUrl} />
            </Suspense>
          </Box>
        ) : (
          <Box
            sx={{
              py: 6,
              px: 2,
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              textAlign: 'center',
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ color: '#334155', fontWeight: 700 }}>
              Chưa có tài liệu đính kèm
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
              Ứng viên chưa đính kèm tệp CV dạng PDF hoặc Word.
            </Typography>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default CandidateDocumentsTab;
