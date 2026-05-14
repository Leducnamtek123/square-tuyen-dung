import React from 'react';
import { Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import { SectionCard } from './SectionCard';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';

type Props = {
  resumeFileUrl: string;
  onlineProfileUrl?: string;
  canEmbedResume: boolean;
  isProcessing: boolean;
  scanLinePosition: number;
  t: TFunction;
};

const AIAnalysisDrawerResumeSection = ({
  resumeFileUrl,
  onlineProfileUrl,
  canEmbedResume,
  isProcessing,
  scanLinePosition,
  t,
}: Props) => {
  const theme = useTheme();

  // Show online profile link if no attached file
  if (!resumeFileUrl && onlineProfileUrl) {
    return (
      <SectionCard title={t('appliedResume.ai.resumeTitle')} icon={<DescriptionIcon fontSize="small" />} iconColor={theme.palette.primary.main}>
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.7 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
              {t('appliedResume.ai.onlineResumeLabel', { defaultValue: 'Hồ sơ trực tuyến' })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>
              {t('appliedResume.ai.onlineResumeHint', { defaultValue: 'AI sẽ phân tích hồ sơ trực tuyến của ứng viên.' })}
            </Typography>
          </Box>
          <Button
            href={onlineProfileUrl}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 900 }}
          >
            {t('appliedResume.ai.viewOnlineProfile', { defaultValue: 'Xem hồ sơ trực tuyến' })}
          </Button>
        </Stack>
      </SectionCard>
    );
  }

  if (!resumeFileUrl) return null;

  return (
    <SectionCard title={t('appliedResume.ai.resumeTitle')} icon={<DescriptionIcon fontSize="small" />} iconColor={theme.palette.info.main}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: pc.info( 0.2),
          borderRadius: 3,
          overflow: 'hidden',
          height: { xs: 260, sm: 380 },
          bgcolor: '#0f172a',
          position: 'relative',
          backgroundImage: `
            linear-gradient(${pc.info( 0.08)} 1px, transparent 1px),
            linear-gradient(90deg, ${pc.info( 0.08)} 1px, transparent 1px),
            radial-gradient(110% 90% at 10% 5%, rgba(15,23,42,0.55) 0%, rgba(2,6,23,0.98) 100%)
          `,
          backgroundSize: '22px 22px, 22px 22px, cover',
          boxShadow: (muiTheme) => muiTheme.customShadows?.z8,
        }}
      >
        {canEmbedResume ? (
          <iframe
            src={resumeFileUrl}
            title={t('appliedResume.ai.resumeTitle')}
            width="100%"
            height="100%"
            style={{ border: 'none', opacity: isProcessing ? 0.7 : 1, transition: 'opacity 0.3s' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: '100%', px: 4, textAlign: 'center', color: 'rgba(255,255,255,0.7)', gap: 2 }}
          >
            <DescriptionIcon sx={{ fontSize: 48, color: theme.palette.info.light, opacity: 0.8 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t('appliedResume.ai.cannotEmbed')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, maxWidth: 280 }}>
              {t('appliedResume.ai.cannotEmbedHint')}
            </Typography>
          </Stack>
        )}

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
          href={resumeFileUrl}
          target="_blank"
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
