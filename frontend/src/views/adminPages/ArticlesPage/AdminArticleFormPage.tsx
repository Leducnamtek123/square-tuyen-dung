'use client';
import React, { useEffect, useReducer, useRef } from 'react';
import {
  Box, Button, TextField, Stack, Typography, MenuItem, Select,
  FormControl, InputLabel, Chip, Paper, CircularProgress, IconButton,
  FormHelperText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import contentService, { ArticlePayload, ArticleCategory, ArticleStatus } from '@/services/contentService';
import toastMessages from '@/utils/toastMessages';
import {
  getAdminArticleFormValidationErrors,
  type AdminArticleFormValidationErrors,
} from './articleFormValidation';

import SimpleRichEditor from '@/components/Common/Controls/SimpleRichEditor';

interface Props {
  mode: 'create' | 'edit';
  articleId?: number;
}

type AdminArticleFormState = {
  loading: boolean;
  saving: boolean;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  articleStatus: ArticleStatus;
  tags: string;
  tagInput: string;
  tagList: string[];
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  existingThumbnailUrl: string | null;
};

type AdminArticleFormAction =
  | { type: 'patch'; patch: Partial<AdminArticleFormState> }
  | {
      type: 'loaded';
      article: {
        title: string;
        excerpt: string;
        content?: string | null;
        category: ArticleCategory;
        status: ArticleStatus;
        tags?: string | null;
        tagList?: string[];
        thumbnailUrl?: string | null;
      };
    }
  | { type: 'loadFailed' }
  | { type: 'addTag'; tag: string }
  | { type: 'removeTag'; tag: string }
  | { type: 'clearThumbnail' };

const initialAdminArticleFormState: AdminArticleFormState = {
  loading: false,
  saving: false,
  title: '',
  excerpt: '',
  content: '',
  category: 'news',
  articleStatus: 'draft',
  tags: '',
  tagInput: '',
  tagList: [],
  thumbnailFile: null,
  thumbnailPreview: null,
  existingThumbnailUrl: null,
};

const ARTICLE_VALIDATION_I18N_KEYS: Record<string, string> = {
  titleRequired: 'pages.articles.validation.titleRequired',
  titleMax: 'pages.articles.validation.titleMax',
  excerptMax: 'pages.articles.validation.excerptMax',
  contentRequired: 'pages.articles.validation.contentRequired',
  categoryInvalid: 'pages.articles.validation.categoryInvalid',
  statusInvalid: 'pages.articles.validation.statusInvalid',
  tagsMax: 'pages.articles.validation.tagsMax',
};

const adminArticleFormReducer = (
  state: AdminArticleFormState,
  action: AdminArticleFormAction
): AdminArticleFormState => {
  switch (action.type) {
    case 'patch':
      return {
        ...state,
        ...action.patch,
      };
    case 'loaded':
      return {
        ...state,
        loading: false,
        title: action.article.title,
        excerpt: action.article.excerpt,
        content: action.article.content || '',
        category: action.article.category,
        articleStatus: action.article.status,
        tags: action.article.tags || '',
        tagList: action.article.tagList || [],
        existingThumbnailUrl: action.article.thumbnailUrl || null,
      };
    case 'loadFailed':
      return {
        ...state,
        loading: false,
      };
    case 'addTag': {
      const tag = action.tag.trim();
      const tagList = tag && !state.tagList.includes(tag) ? [...state.tagList, tag] : state.tagList;

      return {
        ...state,
        tagInput: '',
        tagList,
        tags: tagList.join(','),
      };
    }
    case 'removeTag': {
      const tagList = state.tagList.filter((tag) => tag !== action.tag);

      return {
        ...state,
        tagList,
        tags: tagList.join(','),
      };
    }
    case 'clearThumbnail':
      return {
        ...state,
        thumbnailFile: null,
        thumbnailPreview: null,
        existingThumbnailUrl: null,
      };
    default:
      return state;
  }
};

const AdminArticleFormPage = ({ mode, articleId }: Props) => {
  const { push } = useRouter();
  const { t } = useTranslation('admin');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(adminArticleFormReducer, initialAdminArticleFormState);
  const {
    loading,
    saving,
    title,
    excerpt,
    content,
    category,
    articleStatus,
    tags,
    tagInput,
    tagList,
    thumbnailFile,
    thumbnailPreview,
    existingThumbnailUrl,
  } = state;

  const validationErrors = React.useMemo(
    () => getAdminArticleFormValidationErrors({
      title,
      excerpt,
      content,
      category,
      articleStatus,
      tags,
    }),
    [articleStatus, category, content, excerpt, tags, title],
  );
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const getArticleValidationText = (field: keyof AdminArticleFormValidationErrors) => {
    const validationKey = validationErrors[field];
    return validationKey ? t(ARTICLE_VALIDATION_I18N_KEYS[validationKey]) : undefined;
  };

  useEffect(() => {
    if (mode === 'edit' && articleId) {
      dispatch({ type: 'patch', patch: { loading: true } });
      contentService.adminGetArticle(articleId)
        .then((article) => {
          dispatch({ type: 'loaded', article });
        })
        .catch(() => toastMessages.error(t('pages.articles.messages.formLoadError')))
        .finally(() => dispatch({ type: 'loadFailed' }));
    }
  }, [mode, articleId, t]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: 'patch', patch: { thumbnailFile: file } });
    const reader = new FileReader();
    reader.onload = (ev) => dispatch({ type: 'patch', patch: { thumbnailPreview: ev.target?.result as string } });
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    dispatch({ type: 'addTag', tag: tagInput });
  };

  const removeTag = (tag: string) => {
    dispatch({ type: 'removeTag', tag });
  };

  const handleSave = async (targetStatus?: ArticleStatus) => {
    const submitStatus = targetStatus || articleStatus;
    const submitValidationErrors = getAdminArticleFormValidationErrors({
      title,
      excerpt,
      content,
      category,
      articleStatus: submitStatus,
      tags,
    });
    const firstValidationKey = Object.values(submitValidationErrors)[0];
    if (firstValidationKey) {
      toastMessages.error(t(ARTICLE_VALIDATION_I18N_KEYS[firstValidationKey]));
      return;
    }

    dispatch({ type: 'patch', patch: { saving: true } });
    const payload: ArticlePayload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      category,
      status: submitStatus,
      tags,
    };

    try {
      if (mode === 'create') {
        const created = await contentService.adminCreateArticle(payload, thumbnailFile || undefined);
        toastMessages.success(t('pages.articles.messages.createSuccess'));
        push(`/admin/articles/${created.id}`);
      } else if (articleId) {
        await contentService.adminUpdateArticle(articleId, payload, thumbnailFile || undefined);
        toastMessages.success(t('pages.articles.messages.updateSuccess'));
        if (targetStatus) dispatch({ type: 'patch', patch: { articleStatus: targetStatus } });
      }
    } catch {
      toastMessages.error(t('pages.articles.messages.saveError'));
    } finally {
      dispatch({ type: 'patch', patch: { saving: false } });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <IconButton onClick={() => push('/admin/articles')} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={900}>
            {mode === 'create' ? t('pages.articles.form.createTitle') : t('pages.articles.form.editTitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave()}
            disabled={saving || hasValidationErrors}
            sx={{ fontWeight: 700 }}
          >
            {saving ? t('pages.articles.actions.saving') : t('pages.articles.actions.saveDraft')}
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={() => handleSave('published')}
            disabled={saving || hasValidationErrors}
            color="success"
            sx={{ fontWeight: 700 }}
          >
            {t('pages.articles.actions.publish')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Main Content Area */}
        <Box flex={1}>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <TextField
              fullWidth
              label={t('pages.articles.form.titleLabel')}
              value={title}
              onChange={(e) => dispatch({ type: 'patch', patch: { title: e.target.value } })}
              placeholder={t('pages.articles.form.titlePlaceholder')}
              error={Boolean(validationErrors.title)}
              helperText={getArticleValidationText('title')}
              sx={{ mb: 2 }}
              slotProps={{ htmlInput: { style: { fontSize: '1.1rem', fontWeight: 700 } } }}
            />
            <TextField
              fullWidth
              label={t('pages.articles.form.excerptLabel')}
              value={excerpt}
              onChange={(e) => dispatch({ type: 'patch', patch: { excerpt: e.target.value } })}
              placeholder={t('pages.articles.form.excerptPlaceholder')}
              multiline
              rows={2}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              error={Boolean(validationErrors.excerpt)}
              helperText={getArticleValidationText('excerpt') || `${excerpt.length}/500`}
            />
          </Paper>

          {/* Rich Text Editor */}
          <Paper sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
              {t('pages.articles.form.contentTitle')}
            </Typography>
            <SimpleRichEditor
              value={content}
              onChange={(nextContent) => dispatch({ type: 'patch', patch: { content: nextContent } })}
              minHeight={400}
            />
            {validationErrors.content ? (
              <FormHelperText error>{getArticleValidationText('content')}</FormHelperText>
            ) : null}
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: { xs: '100%', lg: 320 } }}>
          {/* Publish Settings */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              {t('pages.articles.form.publishSettings')}
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }} error={Boolean(validationErrors.category)}>
              <InputLabel>{t('pages.articles.form.categoryLabel')}</InputLabel>
              <Select value={category} label={t('pages.articles.form.categoryLabel')} onChange={(e) => dispatch({ type: 'patch', patch: { category: e.target.value as ArticleCategory } })}>
                <MenuItem value="news" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ArticleIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> {t('pages.articles.categories.news')}
                </MenuItem>
                <MenuItem value="blog" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditNoteIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> {t('pages.articles.categories.blog')}
                </MenuItem>
              </Select>
              {validationErrors.category ? (
                <FormHelperText>{getArticleValidationText('category')}</FormHelperText>
              ) : null}
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }} error={Boolean(validationErrors.articleStatus)}>
              <InputLabel>{t('pages.articles.form.statusLabel')}</InputLabel>
              <Select value={articleStatus} label={t('pages.articles.form.statusLabel')} onChange={(e) => dispatch({ type: 'patch', patch: { articleStatus: e.target.value as ArticleStatus } })}>
                <MenuItem value="draft">{t('pages.articles.statuses.draft')}</MenuItem>
                <MenuItem value="pending">{t('pages.articles.statuses.pending')}</MenuItem>
                <MenuItem value="published">{t('pages.articles.statuses.published')}</MenuItem>
                <MenuItem value="archived">{t('pages.articles.statuses.archived')}</MenuItem>
              </Select>
              {validationErrors.articleStatus ? (
                <FormHelperText>{getArticleValidationText('articleStatus')}</FormHelperText>
              ) : null}
            </FormControl>
          </Paper>

          {/* Thumbnail */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              {t('pages.articles.form.thumbnailTitle')}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              aria-label={t('pages.articles.form.thumbnailAria')}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleThumbnailChange}
            />
            {(thumbnailPreview || existingThumbnailUrl) ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={thumbnailPreview || existingThumbnailUrl!}
                  alt={t('pages.articles.form.thumbnailAlt')}
                  sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 1.5 }}
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={() => dispatch({ type: 'clearThumbnail' })}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Button size="small" fullWidth startIcon={<ImageIcon />} onClick={() => fileInputRef.current?.click()} sx={{ mt: 1 }}>
                  {t('pages.articles.actions.changeImage')}
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ImageIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ height: 100, borderStyle: 'dashed' }}
              >
                {t('pages.articles.actions.chooseImage')}
              </Button>
            )}
          </Paper>

          {/* Tags */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              {t('pages.articles.form.tagsTitle')}
            </Typography>
            <Stack direction="row" spacing={1} mb={1.5}>
              <TextField
                size="small"
                placeholder={t('pages.articles.form.tagPlaceholder')}
                value={tagInput}
                onChange={(e) => dispatch({ type: 'patch', patch: { tagInput: e.target.value } })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                error={Boolean(validationErrors.tags)}
                helperText={getArticleValidationText('tags')}
                fullWidth
              />
              <Button size="small" variant="outlined" onClick={addTag}>{t('pages.articles.actions.addTag')}</Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {tagList.map((tag) => (
                <Chip key={tag} label={tag} size="small" onDelete={() => removeTag(tag)} />
              ))}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default AdminArticleFormPage;
