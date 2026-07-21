'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Grid2 as Grid,
  Pagination,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import contentService, { type Article, type ArticleCategory } from '@/services/contentService';
import useSEO from '@/hooks/useSEO';
import errorHandling from '@/utils/errorHandling';
import NoDataCard from '@/components/Common/NoDataCard';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import {
  BLOG_IMAGES,
  getArticleImage,
  withArticleImages,
} from './blogImages';

type NewsCategory = 'all' | ArticleCategory;

const PAGE_SIZE = 9;

type CategoryOption = {
  value: NewsCategory;
  label: string;
  icon: React.ReactElement;
};

const stripHtml = (html?: string | null) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : '';
};

const buildAbsoluteUrl = (path: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}${path}`;

const ArticleCard = ({
  article,
  featured = false,
  ctaLabel,
  categoryLabels,
  categoryFallbackLabel,
  formatViews,
  language,
}: {
  article: Article;
  featured?: boolean;
  ctaLabel: string;
  categoryLabels: Record<ArticleCategory, string>;
  categoryFallbackLabel: string;
  formatViews: (count: number) => string;
  language: string;
}) => {
  const href = localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL, article.slug)}`, language);
  const publishedDate = formatDate(article.publishedAt || article.createAt || article.updateAt);
  const badgeLabel = categoryLabels[article.category] || categoryFallbackLabel;
  const BadgeIcon = article.category === 'news' ? NewspaperIcon : ArticleIcon;
  const imageSrc = getArticleImage(article);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha('#0f3f7f', 0.12),
        bgcolor: 'common.white',
        boxShadow: featured ? '0 22px 60px rgba(15, 57, 127, 0.12)' : '0 14px 34px rgba(15, 57, 127, 0.08)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha('#17488a', 0.24),
          boxShadow: '0 24px 58px rgba(15, 57, 127, 0.16)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{
          height: '100%',
          alignItems: 'stretch',
          display: 'flex',
          flexDirection: { xs: 'column', md: featured ? 'row' : 'column' },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '100%', md: featured ? '48%' : '100%' },
            minHeight: { xs: featured ? 270 : 220, md: featured ? 390 : 220 },
            flexShrink: 0,
            overflow: 'hidden',
            bgcolor: '#dbe7f4',
          }}
        >
            <CardMedia
              component="img"
              image={imageSrc}
              alt={article.title}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: 'inherit',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 360ms ease',
                '.MuiCardActionArea-root:hover &': {
                  transform: 'scale(1.035)',
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(4, 18, 38, 0.04) 40%, rgba(4, 18, 38, 0.56) 100%)',
              }}
            />
            <Chip
              label={badgeLabel}
              size="small"
              icon={<BadgeIcon fontSize="small" />}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                height: 30,
                borderRadius: 1.5,
                bgcolor: 'rgba(15, 23, 42, 0.82)',
                color: 'common.white',
                fontWeight: 700,
                '& .MuiChip-icon': { color: 'common.white' },
              }}
            />
          </Box>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              flexGrow: 1,
              p: { xs: 2.25, md: featured ? 3.5 : 2.5 },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              {publishedDate && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#64748b' }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{publishedDate}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#64748b' }}>
                <VisibilityIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{formatViews(article.viewCount || 0)}</Typography>
              </Stack>
            </Stack>

            <Typography
              variant={featured ? 'h4' : 'h6'}
              fontWeight={800}
              sx={{
                color: '#102f5e',
                lineHeight: 1.18,
                fontSize: featured ? { xs: 28, md: 36 } : { xs: 21, md: 22 },
                letterSpacing: 0,
              }}
            >
              {article.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#53657e',
                lineHeight: 1.75,
                fontSize: featured ? 16 : 14.5,
                display: '-webkit-box',
                WebkitLineClamp: featured ? 4 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {article.excerpt || stripHtml(article.content || '')}
            </Typography>

            {article.tagList?.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 'auto' }}>
                {article.tagList.slice(0, 4).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      borderColor: alpha('#17488a', 0.18),
                      bgcolor: alpha('#dbeafe', 0.34),
                      color: '#17488a',
                      fontWeight: 650,
                    }}
                  />
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ pt: 0.5, color: '#17488a' }}>
              <Typography variant="body2" fontWeight={800}>
                {ctaLabel}
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Stack>
          </CardContent>
      </CardActionArea>
    </Card>
  );
};

const ArticleSkeleton = () => (
  <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="rectangular" height={220} />
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Skeleton variant="text" width="35%" />
      <Skeleton variant="text" width="90%" height={34} />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rounded" width={140} height={32} />
    </CardContent>
  </Card>
);

type NewsState = {
  category: NewsCategory;
  activeTag: string;
  inputValue: string;
  searchValue: string;
  page: number;
  articles: Article[];
  total: number;
  isLoading: boolean;
};

type NewsAction =
  | { type: 'categoryChanged'; category: NewsCategory }
  | { type: 'tagChanged'; tag: string }
  | { type: 'tagCleared' }
  | { type: 'inputChanged'; inputValue: string }
  | { type: 'searchCommitted'; searchValue: string }
  | { type: 'pageChanged'; page: number }
  | { type: 'loading' }
  | { type: 'loaded'; articles: Article[]; total: number }
  | { type: 'failed' };

const initialNewsState: NewsState = {
  category: 'all',
  activeTag: '',
  inputValue: '',
  searchValue: '',
  page: 1,
  articles: [],
  total: 0,
  isLoading: true,
};

const newsReducer = (state: NewsState, action: NewsAction): NewsState => {
  switch (action.type) {
    case 'categoryChanged':
      return {
        ...state,
        category: action.category,
        page: 1,
      };
    case 'tagChanged':
      return {
        ...state,
        activeTag: action.tag,
        page: 1,
      };
    case 'tagCleared':
      return {
        ...state,
        activeTag: '',
        page: 1,
      };
    case 'inputChanged':
      return {
        ...state,
        inputValue: action.inputValue,
      };
    case 'searchCommitted':
      return {
        ...state,
        searchValue: action.searchValue,
        page: 1,
      };
    case 'pageChanged':
      return {
        ...state,
        page: action.page,
      };
    case 'loading':
      return {
        ...state,
        isLoading: true,
      };
    case 'loaded':
      return {
        ...state,
        articles: action.articles,
        total: action.total,
        isLoading: false,
      };
    case 'failed':
      return {
        ...state,
        articles: [],
        total: 0,
        isLoading: false,
      };
    default:
      return state;
  }
};

const NewsPage = () => {
  const { t, i18n } = useTranslation(['common', 'public']);
  const [state, dispatch] = React.useReducer(newsReducer, initialNewsState);
  const { category, activeTag, inputValue, searchValue, page, articles, total, isLoading } = state;

  const categoryLabels = React.useMemo<Record<ArticleCategory, string>>(() => ({
    news: t('news.category.news', { ns: 'public' }),
    blog: t('news.category.blog', { ns: 'public' }),
  }), [t]);

  const categoryOptions = React.useMemo<CategoryOption[]>(() => [
    { value: 'all', label: t('news.category.all', { ns: 'public' }), icon: <ArticleIcon fontSize="small" /> },
    { value: 'news', label: categoryLabels.news, icon: <NewspaperIcon fontSize="small" /> },
    { value: 'blog', label: categoryLabels.blog, icon: <ArticleIcon fontSize="small" /> },
  ], [categoryLabels, t]);

  const topicOptions = React.useMemo(() => [
    { value: 'tuyển dụng', label: t('news.topic.recruitment', { ns: 'public' }) },
    { value: 'bất động sản', label: t('news.topic.realEstate', { ns: 'public' }) },
    { value: 'xây dựng', label: t('news.topic.construction', { ns: 'public' }) },
    { value: 'nội thất', label: t('news.topic.interior', { ns: 'public' }) },
    { value: 'kiến trúc', label: t('news.topic.architecture', { ns: 'public' }) },
    { value: 'portfolio', label: t('news.topic.portfolio', { ns: 'public' }) },
    { value: 'kỹ năng', label: t('news.topic.skills', { ns: 'public' }) },
  ], [t]);

  const formatViews = React.useCallback(
    (count: number) => t('news.views', { count, ns: 'public' }),
    [t]
  );

  const commitSearch = React.useCallback(() => {
    dispatch({ type: 'searchCommitted', searchValue: inputValue.trim() });
  }, [inputValue]);

  React.useEffect(() => {
    let active = true;

    const loadArticles = async () => {
      dispatch({ type: 'loading' });
      try {
        const response = await contentService.getPublicArticles({
          category: category === 'all' ? undefined : category,
          tag: activeTag || undefined,
          search: searchValue || undefined,
          page,
          page_size: PAGE_SIZE,
        });

        if (!active) return;

        const apiArticles = response.results || [];
        dispatch({
          type: 'loaded',
          articles: withArticleImages(apiArticles),
          total: response.count || 0,
        });
      } catch (error) {
        if (active) {
          errorHandling(error);
          dispatch({ type: 'failed' });
        }
      }
    };

    void loadArticles();

    return () => {
      active = false;
    };
  }, [activeTag, category, page, searchValue]);

  const featuredArticle = articles[0] || null;
  const remainingArticles = featuredArticle ? articles.slice(1) : articles;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const ctaLabel = t('viewDetails', { ns: 'common' });
  const selectedCategoryLabel = categoryOptions.find((option) => option.value === category)?.label || t('news.category.all', { ns: 'public' });
  const activeFilterText = [
    selectedCategoryLabel,
    activeTag ? `#${activeTag}` : '',
    searchValue ? `"${searchValue}"` : '',
  ].filter(Boolean).join(' · ');
  const numberLocale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US';
  const newsListHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}`, i18n.language);
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  useSEO({
    title: t('seo.newsList.title', { ns: 'public' }),
    description: t('seo.newsList.description', { ns: 'public' }),
    url: buildAbsoluteUrl(newsListHref),
    keywords: t('seo.newsList.keywords', { ns: 'public' }),
  });

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          minHeight: { xs: 520, md: 470 },
          px: { xs: 2.5, sm: 4, md: 6 },
          py: { xs: 4, md: 6 },
          mb: 4,
          color: 'common.white',
          backgroundImage: `linear-gradient(90deg, rgba(7, 24, 52, 0.92) 0%, rgba(12, 50, 94, 0.78) 48%, rgba(12, 50, 94, 0.22) 100%), url(${BLOG_IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 28px 70px rgba(15, 57, 127, 0.22)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Stack spacing={2.75} sx={{ position: 'relative', maxWidth: 720 }}>
          <Chip
            label={t('news.heroEyebrow', { ns: 'public' })}
            icon={<AutoStoriesIcon fontSize="small" />}
            sx={{
              alignSelf: 'flex-start',
              height: 34,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.14)',
              color: 'common.white',
              fontWeight: 800,
              border: '1px solid rgba(255,255,255,0.24)',
              '& .MuiChip-icon': { color: 'common.white' },
            }}
          />
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              fontSize: { xs: 38, sm: 48, md: 62 },
              lineHeight: 0.98,
              letterSpacing: 0,
              textWrap: 'balance',
              maxWidth: 680,
            }}
          >
            {t('news.heroTitle', { ns: 'public' })}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: 650,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 450,
              lineHeight: 1.65,
              fontSize: { xs: 17, md: 20 },
            }}
          >
            {t('news.heroSubtitle', { ns: 'public' })}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={Link}
              href={newsListHref}
              variant="contained"
              size="large"
              startIcon={<AutoStoriesIcon />}
              sx={{
                borderRadius: 1.5,
                bgcolor: '#f97316',
                color: 'common.white',
                fontWeight: 850,
                px: 2.5,
                '&:hover': { bgcolor: '#ea580c' },
              }}
            >
              {t('news.viewAllArticles', { ns: 'public' })}
            </Button>
            <Button
              component={Link}
              href={jobsHref}
              variant="outlined"
              size="large"
              startIcon={<WorkOutlineIcon />}
              sx={{
                borderRadius: 1.5,
                borderColor: 'rgba(255,255,255,0.58)',
                color: 'common.white',
                fontWeight: 800,
                px: 2.5,
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.85)',
                  bgcolor: 'rgba(255,255,255,0.10)',
                },
              }}
            >
              {t('news.exploreJobs', { ns: 'public' })}
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 1 }}>
            {topicOptions.slice(1, 5).map((topic) => (
              <Chip
                key={topic.value}
                label={topic.label}
                onClick={() => dispatch({ type: 'tagChanged', tag: topic.value })}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.13)',
                  color: 'common.white',
                  border: '1px solid rgba(255,255,255,0.18)',
                  fontWeight: 750,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={3} sx={{ mb: 4 }}>
        <Tabs
          value={category}
          onChange={(_, value) => {
            dispatch({ type: 'categoryChanged', category: value as NewsCategory });
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-flexContainer': {
              width: { xs: '100%', sm: 'auto' },
            },
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              minHeight: 42,
              minWidth: 0,
              flex: { xs: '1 1 0', sm: '0 0 auto' },
              mr: { xs: 0.75, sm: 1 },
              px: { xs: 1, sm: 2 },
              borderRadius: 1.5,
              fontWeight: 800,
              fontSize: { xs: 13, sm: 14 },
              textTransform: 'none',
              color: '#39516f',
              border: '1px solid',
              borderColor: alpha('#17488a', 0.12),
              bgcolor: 'common.white',
              '&.Mui-selected': {
                color: 'common.white',
                bgcolor: '#17488a',
                borderColor: '#17488a',
              },
            },
          }}
        >
          {categoryOptions.map((option) => (
            <Tab
              key={option.value}
              value={option.value}
              icon={option.icon}
              iconPosition="start"
              label={option.label}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'center',
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha('#17488a', 0.14),
            bgcolor: 'background.paper',
            boxShadow: '0 18px 44px rgba(15, 57, 127, 0.08)',
          }}
        >
          <TextField
            value={inputValue}
            onChange={(event) => dispatch({ type: 'inputChanged', inputValue: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch();
            }}
            placeholder={t('news.searchPlaceholder', { ns: 'public' })}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: alpha('#eff6ff', 0.62),
                '& fieldset': { borderColor: alpha('#17488a', 0.12) },
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={commitSearch}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: 124,
              borderRadius: 1.5,
              fontWeight: 850,
              bgcolor: '#17488a',
              '&:hover': { bgcolor: '#0f3f7f' },
            }}
          >
            {t('news.searchButton', { ns: 'public' })}
          </Button>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={t('news.topic.all', { ns: 'public' })}
            clickable
            color={!activeTag ? 'primary' : 'default'}
            variant={!activeTag ? 'filled' : 'outlined'}
            onClick={() => dispatch({ type: 'tagCleared' })}
            sx={{ borderRadius: 1.5, fontWeight: 750 }}
          />
          {topicOptions.map((tag) => (
            <Chip
              key={tag.value}
              label={tag.label}
              clickable
              color={activeTag === tag.value ? 'primary' : 'default'}
              variant={activeTag === tag.value ? 'filled' : 'outlined'}
              onClick={() => dispatch({ type: 'tagChanged', tag: tag.value })}
              sx={{ borderRadius: 1.5, fontWeight: 750 }}
            />
          ))}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {isLoading ? (
            <Stack spacing={3}>
              <ArticleSkeleton />
              <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Grid key={index} size={{ xs: 12, md: 6 }}>
                    <ArticleSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ) : articles.length === 0 ? (
            <NoDataCard
              title={t('news.emptyTitle', { ns: 'public' })}
              content={t('news.emptyContent', { ns: 'public' })}
            />
          ) : (
            <Stack spacing={3}>
              {featuredArticle && (
                <ArticleCard
                  article={featuredArticle}
                  featured
                  ctaLabel={ctaLabel}
                  categoryLabels={categoryLabels}
                  categoryFallbackLabel={t('news.categoryFallback', { ns: 'public' })}
                  formatViews={formatViews}
                  language={i18n.language}
                />
              )}

              <Grid container spacing={3}>
                {remainingArticles.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, md: 6 }}>
                    <ArticleCard
                      article={article}
                      ctaLabel={ctaLabel}
                        categoryLabels={categoryLabels}
                        categoryFallbackLabel={t('news.categoryFallback', { ns: 'public' })}
                        formatViews={formatViews}
                        language={i18n.language}
                      />
                    </Grid>
                  ))}
              </Grid>

              {pageCount > 1 && (
                <Stack direction="row" justifyContent="center" sx={{ pt: 2 }}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, nextPage) => dispatch({ type: 'pageChanged', page: nextPage })}
                    color="primary"
                  />
                </Stack>
              )}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#17488a', 0.14),
                bgcolor: 'background.paper',
                boxShadow: '0 18px 48px rgba(15, 57, 127, 0.08)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#17488a',
                        bgcolor: alpha('#dbeafe', 0.9),
                      }}
                    >
                      <TrendingUpIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={850} sx={{ color: '#102f5e' }}>
                      {t('news.quickReadTitle', { ns: 'public' })}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#53657e', lineHeight: 1.7 }}>
                    {t('news.quickReadDescription', {
                      count: total,
                      total: total.toLocaleString(numberLocale),
                      ns: 'public',
                    })}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: '#17488a',
                      bgcolor: alpha('#dbeafe', 0.7),
                      borderRadius: 1.25,
                      px: 1.25,
                      py: 0.75,
                    }}
                  >
                    {t('news.currentFilter', { filter: activeFilterText, ns: 'public' })}
                  </Typography>
                  <Stack spacing={1}>
                    {categoryOptions.map((option) => (
                      <Box
                        key={option.value}
                        role="button"
                        tabIndex={0}
                        onClick={() => dispatch({ type: 'categoryChanged', category: option.value })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            dispatch({ type: 'categoryChanged', category: option.value });
                          }
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.35,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: category === option.value ? '#17488a' : alpha('#17488a', 0.10),
                          bgcolor: category === option.value ? '#17488a' : alpha('#f8fafc', 0.96),
                          color: category === option.value ? 'common.white' : '#243b5a',
                          cursor: 'pointer',
                          transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease',
                          '&:hover': {
                            borderColor: category === option.value ? '#17488a' : alpha('#17488a', 0.24),
                            bgcolor: category === option.value ? '#17488a' : alpha('#dbeafe', 0.46),
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {option.icon}
                          <Typography variant="body2" fontWeight={600}>
                            {option.label}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: alpha('#f97316', 0.24),
                color: 'common.white',
                bgcolor: '#0f2f59',
                backgroundImage: `linear-gradient(135deg, rgba(15, 47, 89, 0.95), rgba(23, 72, 138, 0.78)), url(${BLOG_IMAGES.skills})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 18px 48px rgba(15, 57, 127, 0.14)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.75}>
                  <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                    {t('news.audienceTitle', { ns: 'public' })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)', lineHeight: 1.7 }}>
                    {t('news.audienceDescription', { ns: 'public' })}
                  </Typography>
                  <Button
                    component={Link}
                    href={jobsHref}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 1.5,
                      bgcolor: '#f97316',
                      color: 'common.white',
                      fontWeight: 850,
                      '&:hover': { bgcolor: '#ea580c' },
                    }}
                  >
                    {t('news.newJobsCta', { ns: 'public' })}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewsPage;
