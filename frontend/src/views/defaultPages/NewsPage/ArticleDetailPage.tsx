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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';
import contentService, { type Article } from '@/services/contentService';
import NoDataCard from '@/components/Common/NoDataCard';
import HtmlContent from '@/components/Common/HtmlContent';
import sanitizeHtml from '@/utils/sanitizeHtml';
import useSEO from '@/hooks/useSEO';
import useStructuredData from '@/hooks/useStructuredData';
import errorHandling from '@/utils/errorHandling';
import { ROUTES } from '@/configs/constants';

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
  const { t } = useTranslation(['common', 'public']);
  const [state, dispatch] = React.useReducer(articleDetailReducer, initialArticleDetailState);
  const { article, isLoading } = state;

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

  useSEO({
    title: article?.title,
    description: article ? description : t('seo.articleDetail.description', { ns: 'public' }),
    image: article?.thumbnailUrl || undefined,
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}/${slug}`,
    type: 'article',
    keywords: article ? `${article.title}, ${t('nav.blog', { ns: 'common' })}` : undefined,
  });

  useStructuredData(
    article
      ? [
          {
            type: 'BreadcrumbList' as const,
            items: [
              { name: t('seo.articleDetail.breadcrumb.home', { ns: 'public' }), url: typeof window !== 'undefined' ? window.location.origin : '' },
              { name: t('nav.blog', { ns: 'common' }), url: `${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}` },
              { name: article.title, url: `${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}/${slug}` },
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
          title="Không tìm thấy bài viết"
          content="Bài viết có thể đã bị xoá hoặc đường dẫn đã thay đổi."
          buttonText="Quay lại tin tức"
          onClick={() => push(`/${ROUTES.JOB_SEEKER.NEWS}`)}
        />
      </Box>
    );
  }

  const publishedDate = formatDate(article.publishedAt || article.create_at || article.update_at);
  const categoryLabel = t('nav.blog', { ns: 'common' });

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Button
        component={Link}
        href={`/${ROUTES.JOB_SEEKER.NEWS}`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Quay về danh sách
      </Button>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              component="img"
              src={article.thumbnailUrl || '/square-icons/logo.svg'}
              alt={article.title}
              sx={{
                width: '100%',
                height: { xs: 240, md: 420 },
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Chip
                  label={categoryLabel}
                  icon={article.category === 'news' ? <TagIcon fontSize="small" /> : <TagIcon fontSize="small" />}
                  sx={{ alignSelf: 'flex-start' }}
                />

                <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: 30, md: 48 }, lineHeight: 1.12 }}>
                  {article.title}
                </Typography>

                <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                  {publishedDate && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{publishedDate}</Typography>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{article.viewCount || 0} lượt xem</Typography>
                  </Stack>
                  {article.authorName && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PersonIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{article.authorName}</Typography>
                    </Stack>
                  )}
                </Stack>

                <Typography variant="body1" color="text.secondary" sx={{ fontSize: 18, lineHeight: 1.8 }}>
                  {article.excerpt || description}
                </Typography>

                <Box sx={{ pt: 1 }}>
                  <HtmlContent
                    className="prose prose-slate max-w-none prose-headings:font-semibold prose-img:rounded-xl prose-img:shadow-md"
                    html={safeContent}
                    emptyFallback={<Typography color="text.secondary">Nội dung đang được cập nhật.</Typography>}
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
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    Thông tin bài viết
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {article.excerpt || description}
                  </Typography>
                  <Stack spacing={1}>
                    <Chip label={categoryLabel} variant="outlined" />
                    {article.tagList?.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    Khám phá thêm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mở rộng góc nhìn với danh sách bài viết public dành cho ứng viên và nhà tuyển dụng.
                  </Typography>
                  <Button
                    component={Link}
                    href={`/${ROUTES.JOB_SEEKER.NEWS}`}
                    variant="contained"
                  >
                    Về trang tin tức
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
