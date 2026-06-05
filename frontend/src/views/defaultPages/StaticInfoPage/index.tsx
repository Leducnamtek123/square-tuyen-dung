'use client';

import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type StaticPageKey = 'contact' | 'faq' | 'terms' | 'privacy';
type StaticSection = { title: string; body: string };

interface Props {
  pageKey: StaticPageKey;
}

const StaticInfoPage = ({ pageKey }: Props) => {
  const { t } = useTranslation('public');

  const getSections = React.useCallback((key: string) => {
    const translated = t(key, { returnObjects: true });
    return Array.isArray(translated) ? (translated as StaticSection[]) : [];
  }, [t]);

  const page = React.useMemo(() => {
    const keyPrefix = `static.${pageKey}`;

    return {
      title: t(`${keyPrefix}.title`),
      subtitle: t(`${keyPrefix}.subtitle`),
      sections: getSections(`${keyPrefix}.sections`),
    };
  }, [getSections, pageKey, t]);

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              {page.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {page.subtitle}
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Stack spacing={3}>
              {page.sections.map((section) => (
                <Box key={section.title}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {section.body}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default StaticInfoPage;
