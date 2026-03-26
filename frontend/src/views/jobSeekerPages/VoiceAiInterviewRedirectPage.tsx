import React from 'react';
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../configs/constants';

const VoiceAiInterviewRedirectPage = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const { t } = useTranslation('interview');

  const targetUrl = React.useMemo(() => {
    const safeId = encodeURIComponent(id || '');
    return `/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM.replace(':id', safeId)}`;
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    navigate.replace(targetUrl);
  }, [id, targetUrl, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0f172a',
        color: 'white',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 560,
          width: '100%',
          bgcolor: 'rgba(255,255,255,0.05)',
          color: 'white',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        elevation={0}
      >
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {t('redirectTitle')}
          </Typography>
          <Typography sx={{ color: '#cbd5e1' }}>
            {t('redirectBody')}
          </Typography>
          <Button variant="contained" onClick={() => navigate.push(targetUrl)}>
            {t('redirectCta')}
          </Button>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            URL: {targetUrl}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default VoiceAiInterviewRedirectPage;
