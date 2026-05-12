'use client';

import React from 'react';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

type StaticPageKey = 'contact' | 'faq' | 'terms' | 'privacy';
type StaticSection = { title: string; body: string };

const fallback: Record<StaticPageKey, { title: string; subtitle: string; sections: StaticSection[] }> = {
  contact: {
    title: 'Contact',
    subtitle: 'Reach the Square recruitment support team.',
    sections: [
      { title: 'Support email', body: 'For account, job post, verification, or interview issues, contact support@square.vn.' },
      { title: 'Business hours', body: 'Support is available Monday to Friday during business hours.' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Answers to common questions from candidates and employers.',
    sections: [
      { title: 'How do candidates apply?', body: 'Candidates can create a profile, upload a CV, and apply directly from a job detail page.' },
      { title: 'How do employers verify a company?', body: 'Employers submit legal profile information and request a verification appointment from the employer portal.' },
      { title: 'How are reports handled?', body: 'Trust reports are reviewed by admins and moved through open, reviewing, resolved, or rejected statuses.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Baseline terms for using Square recruitment services.',
    sections: [
      { title: 'Account responsibility', body: 'Users are responsible for keeping account information accurate and protecting login credentials.' },
      { title: 'Recruitment content', body: 'Job posts, company profiles, resumes, and interview content must be accurate, lawful, and respectful.' },
      { title: 'Platform operations', body: 'Square may moderate content, suspend abusive activity, and adjust service availability to protect users.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How Square handles recruitment data.',
    sections: [
      { title: 'Data collected', body: 'Square stores account data, profile data, company data, applications, saved profiles, and interview records needed to operate recruitment workflows.' },
      { title: 'Data use', body: 'Data is used to provide job search, recruiting, matching, interview, notification, and support features.' },
      { title: 'Data control', body: 'Users can update account and profile information from their dashboard and contact support for privacy requests.' },
    ],
  },
};

interface Props {
  pageKey: StaticPageKey;
}

const StaticInfoPage = ({ pageKey }: Props) => {
  const { t } = useTranslation('public');

  const getSections = React.useCallback((key: string, defaultValue: StaticSection[]) => {
    const translated = t(key, { returnObjects: true, defaultValue });
    return Array.isArray(translated) ? (translated as StaticSection[]) : defaultValue;
  }, [t]);

  const page = React.useMemo(() => {
    switch (pageKey) {
      case 'faq':
        return {
          title: t('static.faq.title', { defaultValue: fallback.faq.title }),
          subtitle: t('static.faq.subtitle', { defaultValue: fallback.faq.subtitle }),
          sections: getSections('static.faq.sections', fallback.faq.sections),
        };
      case 'terms':
        return {
          title: t('static.terms.title', { defaultValue: fallback.terms.title }),
          subtitle: t('static.terms.subtitle', { defaultValue: fallback.terms.subtitle }),
          sections: getSections('static.terms.sections', fallback.terms.sections),
        };
      case 'privacy':
        return {
          title: t('static.privacy.title', { defaultValue: fallback.privacy.title }),
          subtitle: t('static.privacy.subtitle', { defaultValue: fallback.privacy.subtitle }),
          sections: getSections('static.privacy.sections', fallback.privacy.sections),
        };
      case 'contact':
      default:
        return {
          title: t('static.contact.title', { defaultValue: fallback.contact.title }),
          subtitle: t('static.contact.subtitle', { defaultValue: fallback.contact.subtitle }),
          sections: getSections('static.contact.sections', fallback.contact.sections),
        };
    }
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
