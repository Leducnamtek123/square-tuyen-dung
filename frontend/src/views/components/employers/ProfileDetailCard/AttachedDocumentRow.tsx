'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from '@/configs/dayjs-config';

import { getSafeResourceUrl } from '@/utils/safeExternalUrl';
import type { ResumeDetailResponse } from '@/types/models';

interface AttachedDocumentRowProps {
  profileDetail: ResumeDetailResponse;
  fileUrl?: string;
  onOpenViewer?: () => void;
}

export const AttachedDocumentRow: React.FC<AttachedDocumentRowProps> = ({
  profileDetail,
  fileUrl,
  onOpenViewer,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const actualFileUrl =
    fileUrl ||
    profileDetail.fileUrl ||
    (profileDetail as any).resumeFileUrl ||
    (profileDetail.sourcePayload as any)?.cvFileUrl ||
    (profileDetail.sourcePayload as any)?.cv_file_url ||
    '';

  const safeUrl = getSafeResourceUrl(actualFileUrl);
  const updatedAt = profileDetail.updateAt || profileDetail.createAt;
  const dateFormatted = updatedAt ? dayjs(updatedAt).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY');
  const title = profileDetail.title || 'Hồ sơ ứng viên (CV)';

  const handleOpenPreview = () => {
    if (onOpenViewer) {
      onOpenViewer();
    } else {
      setPreviewOpen(true);
    }
  };

  return (
    <>
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
        {/* Section Header */}
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
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
            Hồ sơ đính kèm
          </Typography>
        </Stack>

        {safeUrl ? (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F1F5F9',
              },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              {/* Document Icon & Details */}
              <Stack direction="row" spacing={1.75} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    bgcolor: '#FEE2E2',
                    color: '#EF4444',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: '#0F172A',
                      fontSize: '0.925rem',
                      lineHeight: 1.3,
                      mb: 0.25,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  >
                    PDF · 245 KB · {dateFormatted}
                  </Typography>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleOpenPreview}
                  startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    flex: { xs: 1, sm: 'none' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    bgcolor: '#FFFFFF',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                      borderColor: '#94A3B8',
                    },
                  }}
                >
                  Xem
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  component="a"
                  href={safeUrl}
                  download
                  startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    flex: { xs: 1, sm: 'none' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    bgcolor: '#FFFFFF',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                      borderColor: '#94A3B8',
                    },
                  }}
                >
                  Tải xuống
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Box
            sx={{
              p: 3,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
              Ứng viên chưa tải lên tệp hồ sơ đính kèm.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* PDF Document Preview Modal */}
      {safeUrl && (
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              height: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              p: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PictureAsPdfIcon sx={{ color: '#EF4444' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {title}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
              >
                Mở tab mới
              </Button>
              <IconButton size="small" onClick={() => setPreviewOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 0, flex: 1, bgcolor: '#334155' }}>
            <iframe
              src={safeUrl}
              title="PDF Viewer"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AttachedDocumentRow;
