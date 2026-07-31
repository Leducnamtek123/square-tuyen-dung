'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import contentService, { type Article } from '@/services/contentService';
import NoDataCard from '@/components/Common/NoDataCard';
import HtmlContent from '@/components/Common/HtmlContent';
import sanitizeHtml from '@/utils/sanitizeHtml';
import useSEO from '@/hooks/useSEO';
import useStructuredData from '@/hooks/useStructuredData';
import errorHandling from '@/utils/errorHandling';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { BLOG_IMAGES, getArticleImage } from './blogImages';

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

const ArticleDetailSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 3 }} />
    <Stack spacing={1}>
      <Skeleton variant="text" width="35%" />
      <Skeleton variant="text" width="82%" height={52} />
      <Skeleton variant="text" width="65%" />
    </Stack>
    <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
  </Stack>
);

type ArticleDetailState = {
  article: Article | null;
  isLoading: boolean;
};

type ArticleDetailAction =
  | { type: 'loading' }
  | { type: 'loaded'; article: Article }
  | { type: 'failed' };

const articleDetailReducer = (
  state: ArticleDetailState,
  action: ArticleDetailAction
): ArticleDetailState => {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        isLoading: true,
      };
    case 'loaded':
      return {
        article: action.article,
        isLoading: false,
      };
    case 'failed':
      return {
        article: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialArticleDetailState: ArticleDetailState = {
  article: null,
  isLoading: true,
};

const ArticleDetailPage = () => {
  const { push } = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation(['common', 'public']);
  const [state, dispatch] = React.useReducer(articleDetailReducer, initialArticleDetailState);
  const { article, isLoading } = state;

  const categoryLabels = React.useMemo<Record<Article['category'], string>>(() => ({
    news: t('news.category.news', { ns: 'public' }),
    blog: t('news.category.blog', { ns: 'public' }),
  }), [t]);

  const getCategoryLabel = React.useCallback(
    (category?: Article['category']) => (
      category === 'news' ? categoryLabels.news : categoryLabels.blog
    ),
    [categoryLabels]
  );

  React.useEffect(() => {
    let active = true;

    const loadArticle = async () => {
      dispatch({ type: 'loading' });
      try {
        const response = await contentService.getPublicArticleBySlug(slug);
        if (!active) return;
        dispatch({ type: 'loaded', article: response });
      } catch (error) {
        if (active) {
          errorHandling(error);
          dispatch({ type: 'failed' });
        }
      }
    };

    void loadArticle();

    return () => {
      active = false;
    };
  }, [slug]);

  const safeContent = React.useMemo(() => sanitizeHtml(article?.content || ''), [article?.content]);
  const description = React.useMemo(
    () => article?.excerpt || stripHtml(article?.content || ''),
    [article?.content, article?.excerpt]
  );
  const articleImage = React.useMemo(
    () => (article ? getArticleImage(article) : BLOG_IMAGES.hero),
    [article]
  );
  const newsListHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}`, i18n.language);
  const articleHref = localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL, slug)}`, i18n.language);
  const absoluteNewsListUrl = buildAbsoluteUrl(newsListHref);
  const absoluteArticleUrl = buildAbsoluteUrl(articleHref);

  useSEO({
    title: article?.title,
    description: article ? description : t('seo.articleDetail.description', { ns: 'public' }),
    image: article ? articleImage : undefined,
    url: absoluteArticleUrl,
    type: 'article',
    keywords: article ? `${article.title}, ${getCategoryLabel(article.category)}` : undefined,
  });

  useStructuredData(
    article
      ? [
          {
            type: 'BreadcrumbList' as const,
            items: [
              { name: t('seo.articleDetail.breadcrumb.home', { ns: 'public' }), url: typeof window !== 'undefined' ? window.location.origin : '' },
              { name: t('seo.newsList.title', { ns: 'public' }), url: absoluteNewsListUrl },
              { name: article.title, url: absoluteArticleUrl },
            ],
          },
        ]
      : []
  );

  if (isLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (!article) {
    return (
      <Box sx={{ py: 4 }}>
        <NoDataCard
          title={t('news.article.notFoundTitle', { ns: 'public' })}
          content={t('news.article.notFoundContent', { ns: 'public' })}
          buttonText={t('news.article.backToNews', { ns: 'public' })}
          onClick={() => push(newsListHref)}
        />
      </Box>
    );
  }

  const publishedDate = formatDate(article.publishedAt || article.createAt || article.updateAt);
  const categoryLabel = getCategoryLabel(article.category);

  return (
    <Box sx={{ py: { xs: 3, md: 5 } }}>
      <Button
        component={Link}
        href={newsListHref}
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 3,
          fontWeight: 700,
          color: '#475569',
          borderRadius: 2,
          '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
        }}
      >
        {t('news.article.backToList', { ns: 'public' })}
      </Button>

      {/* ── Unified Glassmorphic Hero Banner ────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: 3, md: 4 },
          minHeight: { xs: 420, md: 500 },
          mb: 4,
          display: 'flex',
          alignItems: 'flex-end',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.12)',
          border: '1px solid #e2e8f0',
          backgroundColor: '#0f172a',
        }}
      >
        {/* Full-bleed crisp featured image in background */}
        <Box
          component="img"
          src={articleImage}
          alt={article.title}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />

        {/* Soft, smooth gradient transition at bottom to guarantee 100% text legibility */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 20%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.85) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Frosted Glass Content Panel anchored at bottom */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            p: { xs: 3, md: 4.5 },
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: 960 }}>
            <Chip
              label={categoryLabel}
              icon={article.category === 'news' ? <NewspaperIcon fontSize="small" /> : <TagIcon fontSize="small" />}
              sx={{
                alignSelf: 'flex-start',
                borderRadius: 2,
                bgcolor: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                px: 0.5,
                '& .MuiChip-icon': { color: '#ffffff' },
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: 24, sm: 32, md: 40 },
                lineHeight: 1.25,
                letterSpacing: '-0.015em',
                color: '#ffffff !important',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                textWrap: 'balance',
              }}
            >
              {article.title}
            </Typography>

            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" sx={{ color: 'rgba(255, 255, 255, 0.92)', pt: 0.5 }}>
              {publishedDate && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#93c5fd' }} />
                  <Typography variant="body2" fontWeight={700} color="#ffffff">{publishedDate}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.75} alignItems="center">
                <VisibilityIcon sx={{ fontSize: 18, color: '#93c5fd' }} />
                <Typography variant="body2" fontWeight={700} color="#ffffff">{t('news.views', { count: article.viewCount || 0, ns: 'public' })}</Typography>
              </Stack>
              {article.authorName && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <PersonIcon sx={{ fontSize: 18, color: '#93c5fd' }} />
                  <Typography variant="body2" fontWeight={700} color="#ffffff">{article.authorName}</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#17488a', 0.12),
              boxShadow: '0 18px 44px rgba(15, 57, 127, 0.08)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Typography variant="body1" sx={{ fontSize: 19, lineHeight: 1.85, color: '#425672', fontWeight: 500 }}>
                  {article.excerpt || description}
                </Typography>

                <Box
                  sx={{
                    pt: 1,
                    '& .prose': {
                      color: '#26364f',
                      fontSize: 16.5,
                      lineHeight: 1.85,
                    },
                    '& h2': {
                      color: '#102f5e',
                      fontWeight: 850,
                      marginTop: '1.8em',
                      marginBottom: '0.55em',
                    },
                    '& p': { marginBottom: '1em' },
                  }}
                >
                  <HtmlContent
                    className="prose prose-slate max-w-none prose-headings:font-semibold prose-img:rounded-xl prose-img:shadow-md"
                    html={safeContent}
                    emptyFallback={<Typography color="text.secondary">{t('news.article.emptyContent', { ns: 'public' })}</Typography>}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#17488a', 0.14),
                boxShadow: '0 18px 44px rgba(15, 57, 127, 0.08)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.75}>
                  <Typography variant="h6" fontWeight={850} sx={{ color: '#102f5e' }}>
                    {t('news.article.infoTitle', { ns: 'public' })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#53657e', lineHeight: 1.7 }}>
                    {article.excerpt || description}
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      label={categoryLabel}
                      variant="outlined"
                      sx={{ borderRadius: 1.5, fontWeight: 750, borderColor: alpha('#17488a', 0.2) }}
                    />
                    {article.tagList?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          borderRadius: 1.5,
                          bgcolor: alpha('#dbeafe', 0.72),
                          color: '#17488a',
                          fontWeight: 700,
                        }}
                      />
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
                backgroundImage: `linear-gradient(135deg, rgba(15, 47, 89, 0.94), rgba(23, 72, 138, 0.75)), url(${BLOG_IMAGES.interview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 18px 44px rgba(15, 57, 127, 0.10)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.75}>
                  <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.22 }}>
                    {t('news.article.moreTitle', { ns: 'public' })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.86)', lineHeight: 1.7 }}>
                    {t('news.article.moreDescription', { ns: 'public' })}
                  </Typography>
                  <Button
                    component={Link}
                    href={newsListHref}
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
                    {t('news.article.newsHomeCta', { ns: 'public' })}
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

export default ArticleDetailPage;
