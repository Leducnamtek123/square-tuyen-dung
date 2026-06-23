'use client';

import React from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import contactMessageService from '@/services/contactMessageService';
import toastMessages from '@/utils/toastMessages';
import { useAppSelector } from '@/redux/hooks';

type StaticPageKey = 'contact' | 'faq' | 'terms' | 'privacy';
type StaticSection = { title: string; body: string };

interface Props {
  pageKey: StaticPageKey;
}

const StaticInfoPage = ({ pageKey }: Props) => {
  const { t } = useTranslation('public');
  const { currentUser } = useAppSelector((state) => state.user);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    category: 'bug_report',
    subject: '',
    pageUrl: '',
    name: '',
    email: '',
    phone: '',
    content: '',
  });

  const getSections = React.useCallback((key: string) => {
    const translated = t(key, { returnObjects: true });
    return Array.isArray(translated) ? (translated as StaticSection[]) : [];
  }, [t]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setFormData((prev) => (prev.pageUrl ? prev : { ...prev, pageUrl: window.location.href }));
  }, []);

  React.useEffect(() => {
    if (!currentUser) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || currentUser.fullName || '',
      email: prev.email || currentUser.email || '',
    }));
  }, [currentUser]);

  const page = React.useMemo(() => {
    const keyPrefix = `static.${pageKey}`;

    return {
      title: t(`${keyPrefix}.title`),
      subtitle: t(`${keyPrefix}.subtitle`),
      sections: getSections(`${keyPrefix}.sections`),
    };
  }, [getSections, pageKey, t]);

  const isContactPage = pageKey === 'contact';

  const handleChange = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: String(value) }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.content.trim()) {
      toastMessages.error(t('static.contact.validation.required'));
      return;
    }

    setIsSubmitting(true);
    try {
      await contactMessageService.create({
        category: formData.category as 'bug_report' | 'feedback' | 'support',
        subject: formData.subject.trim(),
        pageUrl: formData.pageUrl.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        content: formData.content.trim(),
      });
      toastMessages.success(t('static.contact.success'));
      setFormData((prev) => ({
        category: 'bug_report',
        subject: '',
        pageUrl: prev.pageUrl,
        name: currentUser?.fullName || '',
        email: currentUser?.email || '',
        phone: '',
        content: '',
      }));
    } catch (error) {
      console.error(error);
      toastMessages.error(t('static.contact.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

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

          {isContactPage && (
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
                    {t('static.contact.form.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('static.contact.form.subtitle')}
                  </Typography>
                </Box>
                <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
                  <FormControl fullWidth>
                    <InputLabel>{t('static.contact.form.category')}</InputLabel>
                    <Select
                      label={t('static.contact.form.category')}
                      value={formData.category}
                      onChange={(event) => setFormData((prev) => ({ ...prev, category: String(event.target.value) }))}
                    >
                      <MenuItem value="bug_report">{t('static.contact.categories.bugReport')}</MenuItem>
                      <MenuItem value="feedback">{t('static.contact.categories.feedback')}</MenuItem>
                      <MenuItem value="support">{t('static.contact.categories.support')}</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label={t('static.contact.form.subject')}
                    value={formData.subject}
                    onChange={handleChange('subject')}
                  />
                </Stack>
                <TextField
                  fullWidth
                  label={t('static.contact.form.pageUrl')}
                  value={formData.pageUrl}
                  onChange={handleChange('pageUrl')}
                />
                <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
                  <TextField
                    fullWidth
                    label={t('static.contact.form.name')}
                    value={formData.name}
                    onChange={handleChange('name')}
                  />
                  <TextField
                    fullWidth
                    label={t('static.contact.form.email')}
                    value={formData.email}
                    onChange={handleChange('email')}
                  />
                </Stack>
                <TextField
                  fullWidth
                  label={t('static.contact.form.phone')}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  label={t('static.contact.form.content')}
                  value={formData.content}
                  onChange={handleChange('content')}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 180 }}>
                    {isSubmitting ? t('static.contact.form.sending') : t('static.contact.form.submit')}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default StaticInfoPage;
