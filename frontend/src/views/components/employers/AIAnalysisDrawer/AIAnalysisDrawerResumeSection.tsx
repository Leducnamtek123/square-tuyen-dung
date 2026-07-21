import React from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import Pdf from '@/components/Common/Pdf';
import { SectionCard } from './SectionCard';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import { getSafeExternalOpenUrl, getSafeResourceUrl } from '@/utils/safeExternalUrl';

type Props = {
  resumeFileUrl: string;
  onlineProfileUrl?: string;
  isProcessing: boolean;
  scanLinePosition: number;
  t: TFunction;
};

const AIAnalysisDrawerResumeSection = ({
  resumeFileUrl,
  onlineProfileUrl,
  isProcessing,
  scanLinePosition,
  t,
}: Props) => {
  const theme = useTheme();
  const safeResumeFileUrl = getSafeResourceUrl(resumeFileUrl);
  const safeOnlineProfileUrl = getSafeExternalOpenUrl(onlineProfileUrl);

  // Show online profile link if no attached file
  if (!safeResumeFileUrl && safeOnlineProfileUrl) {
    return (
      <SectionCard title={t('appliedResume.ai.resumeTitle')} icon={<DescriptionIcon fontSize="small" />} iconColor={theme.palette.primary.main}>
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
              {t('appliedResume.ai.onlineResumeLabel')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>
              {t('appliedResume.ai.onlineResumeHint')}
            </Typography>
          </Box>
          <Button
            href={safeOnlineProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 900 }}
          >
            {t('appliedResume.ai.viewOnlineProfile')}
          </Button>
        </Stack>
      </SectionCard>
    );
  }

  if (!safeResumeFileUrl) return null;

  return (
    <SectionCard title={t('appliedResume.ai.resumeTitle')} icon={<DescriptionIcon fontSize="small" />} iconColor={theme.palette.info.main}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: pc.info( 0.2),
          borderRadius: 3,
          overflow: 'hidden',
          height: { xs: 420, sm: 560 },
          bgcolor: '#fff',
          position: 'relative',
          boxShadow: (muiTheme) => muiTheme.customShadows?.z8,
        }}
      >
        <Pdf
          fileUrl={safeResumeFileUrl}
          title={t('appliedResume.ai.resumeTitle')}
          containerSx={{
            height: '100%',
            border: 0,
            borderRadius: 0,
            opacity: isProcessing ? 0.72 : 1,
            transition: 'opacity 0.3s ease',
          }}
          toolbarSx={{
            bgcolor: '#1f3f83',
            px: 1.25,
            py: 0.75,
            '& .MuiIconButton-root': { color: '#fff', p: 0.75 },
            '& .MuiButton-root': { fontSize: '0.72rem', px: 1.25, py: 0.5 },
          }}
          viewerSx={{
            height: { xs: 356, sm: 494 },
            minHeight: 0,
            bgcolor: '#f8fafc',
          }}
        />

        <Box sx={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: `2px solid ${pc.info( 0.5)}`, borderLeft: `2px solid ${pc.info( 0.5)}`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: `2px solid ${pc.info( 0.5)}`, borderRight: `2px solid ${pc.info( 0.5)}`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: `2px solid ${pc.info( 0.5)}`, borderLeft: `2px solid ${pc.info( 0.5)}`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: `2px solid ${pc.info( 0.5)}`, borderRight: `2px solid ${pc.info( 0.5)}`, pointerEvents: 'none' }} />

        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `calc(${scanLinePosition}% - 18px)`,
              height: 34,
              background: `linear-gradient(180deg, transparent 0%, ${pc.info( 0.4)} 45%, transparent 100%)`,
              boxShadow: `0 0 20px ${pc.info( 0.4)}, 0 0 40px ${pc.info( 0.2)}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          {isProcessing ? t('appliedResume.ai.scanStatusScanning') : t('appliedResume.ai.scanStatusIdle')}
        </Typography>
        <Button
          href={safeResumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          size="small"
          startIcon={<OpenInNewIcon fontSize="small" />}
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 900 }}
        >
          {t('appliedResume.ai.openCV')}
        </Button>
      </Stack>
    </SectionCard>
  );
};

export default AIAnalysisDrawerResumeSection;
