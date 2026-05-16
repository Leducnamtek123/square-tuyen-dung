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
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ABOUT_IMAGES, IMAGES } from '@/configs/constants';
import contentService, { type Article, type ArticleCategory } from '@/services/contentService';
import useSEO from '@/hooks/useSEO';
import errorHandling from '@/utils/errorHandling';
import NoDataCard from '@/components/Common/NoDataCard';
import { ROUTES } from '@/configs/constants';

type NewsCategory = 'all' | ArticleCategory;

const PAGE_SIZE = 9;

const categoryOptions: Array<{
  value: NewsCategory;
  label: string;
  icon: React.ReactElement;
}> = [
  { value: 'all', label: 'Tất cả', icon: <ArticleIcon fontSize="small" /> },
  { value: 'news', label: 'Tin tức', icon: <NewspaperIcon fontSize="small" /> },
  { value: 'blog', label: 'Blog tuyển dụng', icon: <ArticleIcon fontSize="small" /> },
];

const topicOptions = [
  'tuyển dụng',
  'bất động sản',
  'xây dựng',
  'nội thất',
  'kiến trúc',
  'portfolio',
  'kỹ năng',
];

const categoryLabelMap: Record<ArticleCategory, string> = {
  news: 'Tin tức',
  blog: 'Blog tuyển dụng',
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

const ArticleCard = ({
  article,
  featured = false,
  ctaLabel,
}: {
  article: Article;
  featured?: boolean;
  ctaLabel: string;
}) => {
  const href = `/${ROUTES.JOB_SEEKER.NEWS}/${article.slug}`;
  const publishedDate = formatDate(article.publishedAt || article.create_at || article.update_at);
  const badgeLabel = categoryLabelMap[article.category] || 'Bài viết';
  const BadgeIcon = article.category === 'news' ? NewspaperIcon : ArticleIcon;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 16px 40px rgba(15, 57, 127, 0.12)',
        },
      }}
    >
      <CardActionArea component={Link} href={href} sx={{ height: '100%', alignItems: 'stretch' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height={featured ? 320 : 220}
              image={article.thumbnailUrl || IMAGES.coverImageDefault}
              alt={article.title}
              sx={{ objectFit: 'cover' }}
            />
            <Chip
              label={badgeLabel}
              size="small"
              icon={<BadgeIcon fontSize="small" />}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(15, 23, 42, 0.88)',
                color: 'common.white',
                '& .MuiChip-icon': { color: 'common.white' },
              }}
            />
          </Box>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              {publishedDate && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">{publishedDate}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                <VisibilityIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">{article.viewCount || 0} lượt xem</Typography>
              </Stack>
            </Stack>

            <Typography variant={featured ? 'h4' : 'h6'} fontWeight={700} lineHeight={1.25}>
              {article.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: featured ? 4 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.excerpt || stripHtml(article.content || '')}
            </Typography>

            {article.tagList?.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 'auto' }}>
                {article.tagList.slice(0, 4).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            )}

            <Box sx={{ pt: 0.5 }}>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {ctaLabel}
              </Typography>
            </Box>
          </CardContent>
        </Box>
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
  const { t } = useTranslation(['common', 'public']);
  const [state, dispatch] = React.useReducer(newsReducer, initialNewsState);
  const { category, activeTag, inputValue, searchValue, page, articles, total, isLoading } = state;

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

        dispatch({
          type: 'loaded',
          articles: response.results || [],
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
  const selectedCategoryLabel = categoryOptions.find((option) => option.value === category)?.label || 'Tất cả';
  const activeFilterText = [
    selectedCategoryLabel,
    activeTag ? `#${activeTag}` : '',
    searchValue ? `"${searchValue}"` : '',
  ].filter(Boolean).join(' · ');

  useSEO({
    title: t('seo.newsList.title', { ns: 'public' }),
    description: t('seo.newsList.description', { ns: 'public' }),
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/${ROUTES.JOB_SEEKER.NEWS}`,
    keywords: t('seo.newsList.keywords', { ns: 'public' }),
  });

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 5 },
          mb: 4,
          color: 'common.white',
          backgroundImage: `linear-gradient(90deg, rgba(10, 37, 82, 0.94) 0%, rgba(15, 68, 130, 0.82) 48%, rgba(20, 121, 177, 0.62) 100%), url(${ABOUT_IMAGES.JOB_POST})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 24px 60px rgba(15, 57, 127, 0.24)',
        }}
      >
        <Stack spacing={2.5} sx={{ position: 'relative', maxWidth: 760 }}>
          <Chip
            label="Tin tức & Blog tuyển dụng"
            sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: 'common.white' }}
          />
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.08 }}>
            Tin tức và blog tuyển dụng dành cho ứng viên, nhà tuyển dụng
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 720, color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
            Cập nhật xu hướng tuyển dụng, mẹo ứng tuyển và góc nhìn từ doanh nghiệp trong một trang công khai duy nhất.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={Link}
              href={`/${ROUTES.JOB_SEEKER.NEWS}`}
              variant="contained"
              color="secondary"
              size="large"
            >
              Xem tất cả bài viết
            </Button>
            <Button
              component={Link}
              href={`/${ROUTES.JOB_SEEKER.JOBS}`}
              variant="outlined"
              size="large"
              sx={{ borderColor: 'rgba(255,255,255,0.55)', color: 'common.white' }}
            >
              Khám phá việc làm
            </Button>
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
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' },
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
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            value={inputValue}
            onChange={(event) => dispatch({ type: 'inputChanged', inputValue: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch();
            }}
            placeholder="Tìm bài viết, chủ đề hoặc từ khóa"
            fullWidth
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={commitSearch}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Tìm
          </Button>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label="Tất cả chủ đề"
            clickable
            color={!activeTag ? 'primary' : 'default'}
            variant={!activeTag ? 'filled' : 'outlined'}
            onClick={() => dispatch({ type: 'tagCleared' })}
          />
          {topicOptions.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              clickable
              color={activeTag === tag ? 'primary' : 'default'}
              variant={activeTag === tag ? 'filled' : 'outlined'}
              onClick={() => dispatch({ type: 'tagChanged', tag })}
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
              title="Chưa có bài viết phù hợp"
              content="Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm."
            />
          ) : (
            <Stack spacing={3}>
              {featuredArticle && <ArticleCard article={featuredArticle} featured ctaLabel={ctaLabel} />}

              <Grid container spacing={3}>
                {remainingArticles.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, md: 6 }}>
                    <ArticleCard article={article} ctaLabel={ctaLabel} />
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
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    Góc đọc nhanh
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {total.toLocaleString('vi-VN')} bài viết đang hiển thị trong kho nội dung công khai.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Bộ lọc hiện tại: {activeFilterText}
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
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: category === option.value ? 'primary.light' : 'action.hover',
                          color: category === option.value ? 'primary.contrastText' : 'text.primary',
                          cursor: 'pointer',
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
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    Dành cho ứng viên và nhà tuyển dụng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bài viết được biên tập để hỗ trợ cả hai phía: tìm việc tốt hơn và tuyển người hiệu quả hơn.
                  </Typography>
                  <Button
                    component={Link}
                    href={`/${ROUTES.JOB_SEEKER.JOBS}`}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Xem việc làm mới
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
