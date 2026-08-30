'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid2 as Grid,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import contentService, { type ArticleCategoryInfo } from '@/services/contentService';
import commonService from '@/services/commonService';
import useSEO from '@/hooks/useSEO';
import NoDataCard from '@/components/Common/NoDataCard';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { getArticleImage, withArticleImages } from './blogImages';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PAGE_SIZE = 9;

const FIXED_NEWS_KEYS = [
  'news.category.all',
  'news.category.news',
  'news.category.blog',
  'news.categoryFallback',
  'news.topic.all',
  'news.topic.recruitment',
  'news.topic.realEstate',
  'news.topic.construction',
  'news.topic.interior',
  'news.topic.architecture',
  'news.topic.portfolio',
  'news.topic.skills',
  'news.views',
  'news.heroEyebrow',
  'news.heroTitle',
  'news.heroSubtitle',
  'news.viewAllArticles',
  'news.exploreJobs',
  'news.searchPlaceholder',
  'news.searchButton',
  'news.emptyTitle',
  'news.emptyContent',
  'news.quickReadTitle',
  'news.quickReadDescription',
  'news.currentFilter',
  'news.audienceTitle',
  'news.audienceDescription',
  'news.newJobsCta',
] as const;

const FALLBACK_POPULAR_KEYWORDS: string[] = [
  'Đơn xin việc', 'Hồ sơ xin việc', 'BHXH 1 lần', 'Thủ tục nghỉ việc', 'Cách viết CV',
  'Mẫu CV chuẩn', 'Câu hỏi phỏng vấn', 'Lương Gross sang Net', 'Thuế TNCN', 'Việc làm Xây dựng',
  'Tuyển dụng Bất động sản', 'Kỹ sư Giám sát', 'Kiến trúc sư', 'Thiết kế Nội thất',
  'Cách tính trợ cấp', 'Quy trình thôi việc', 'Môi trường làm việc', 'Văn hóa doanh nghiệp',
  'Bảng lương 2026', 'Kỹ năng phỏng vấn', 'Thủ tục quyết toán thuế', 'Mẫu hợp đồng lao động',
  'Tuyển dụng việc làm', 'Kinh nghiệm tìm việc', 'Cách deal lương', 'Tạo CV miễn phí'
];

const SubHeaderCategoryBar = ({
  categories,
  activeCategorySlug,
  onSelectCategory,
}: {
  categories: ArticleCategoryInfo[];
  activeCategorySlug: string;
  onSelectCategory: (slug: string) => void;
}) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: 56, sm: 64 },
        zIndex: 9,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        width: '100%',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: 'flex-start', md: 'space-between' }}
          spacing={{ xs: 1, md: 0 }}
          sx={{
            py: 1,
            width: '100%',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {categories.length > 0
            ? categories.map((cat) => {
                const isSelected = activeCategorySlug === cat.slug;
                return (
                  <Button
                    key={cat.id}
                    variant="text"
                    onClick={() => onSelectCategory(cat.slug)}
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.875rem',
                  color: isSelected ? '#e11d48' : '#475569',
                  px: 2.5,
                  py: 0.85,
                  borderRadius: '999px',
                  backgroundColor: isSelected ? 'rgba(225, 29, 72, 0.08)' : 'transparent',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(225, 29, 72, 0.06)',
                    color: '#e11d48',
                  },
                }}
              >
                {cat.name}
              </Button>
            );
          }) : null}
        </Stack>
      </Container>
    </Box>
  );
};

const NewsContent = () => {
  const { t, i18n } = useTranslation(['common', 'public']);
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || 'all';

  const [activeCategorySlug, setActiveCategorySlug] = React.useState<string>(initialCategoryParam);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategorySlug(cat);
    }
  }, [searchParams]);

  // Fetch dynamic Categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['public-article-categories'],
    queryFn: async () => {
      const res = await contentService.getPublicArticleCategories();
      return res || [];
    },
    staleTime: 5 * 60_000,
  });

  // Fetch Top Featured Articles from API (fixed top 4 published across site)
  const { data: featuredData } = useQuery({
    queryKey: ['public-featured-articles'],
    queryFn: async () => {
      const response = await contentService.getPublicArticles({
        page: 1,
        page_size: 4,
      });
      return withArticleImages(response.results || []);
    },
    staleTime: 5 * 60_000,
  });

  // Fetch Articles from API for active category & page
  const { data: articleData, isLoading } = useQuery({
    queryKey: ['public-articles', activeCategorySlug, page],
    queryFn: async () => {
      const response = await contentService.getPublicArticles({
        category: activeCategorySlug === 'all' ? undefined : activeCategorySlug,
        page,
        page_size: PAGE_SIZE,
      });
      return {
        articles: withArticleImages(response.results || []),
        total: response.count || 0,
      };
    },
    staleTime: 2 * 60_000,
  });

  // Fetch Popular Keywords from API
  const { data: popularKeywordsApi = [] } = useQuery({
    queryKey: ['popular-keywords'],
    queryFn: async () => {
      const res = await commonService.getPopularKeywords();
      return res || [];
    },
    staleTime: 5 * 60_000,
  });

  const popularKeywords = React.useMemo(() => {
    if (Array.isArray(popularKeywordsApi) && popularKeywordsApi.length > 0) {
      return popularKeywordsApi
        .map((k: unknown) => {
          if (typeof k === 'string') return k;
          if (k && typeof k === 'object') {
            const obj = k as { title?: string; kw?: string; name?: string };
            return obj.title || obj.kw || obj.name || '';
          }
          return '';
        })
        .filter(Boolean);
    }
    return FALLBACK_POPULAR_KEYWORDS;
  }, [popularKeywordsApi]);

  const featuredArticles = featuredData || [];
  const mainFeaturedArticle = featuredArticles[0] || null;
  const sideFeaturedArticles = featuredArticles.slice(1, 4);

  const articles = React.useMemo(() => articleData?.articles || [], [articleData?.articles]);
  const total = articleData?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Determine articles for "Bài viết mới nhất" grid
  const displayLatestArticles = React.useMemo(() => {
    if (activeCategorySlug === 'all') {
      if (page === 1 && articles.length > 4) {
        return articles.slice(4);
      }
      return articles;
    }
    return articles;
  }, [activeCategorySlug, page, articles]);

  const newsListHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.NEWS}`, i18n.language);
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  useSEO({
    title: t('seo.newsList.title', { defaultValue: 'Cẩm Nang Nghề Nghiệp | Info HR' }),
    description: t('seo.newsList.description', { defaultValue: 'Cập nhật tin tức, thủ tục lao động, BHXH, thuế TNCN và cẩm nang phỏng vấn mới nhất.' }),
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}${newsListHref}`,
  });

  const handleSelectCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    setPage(1);
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100dvh', pb: 8 }}>
      {/* ── Sub-header Navigation Bar ──────────────────────────────────────── */}
      <SubHeaderCategoryBar
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        onSelectCategory={handleSelectCategory}
      />

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* ── Featured Articles Section ──────────────────────────────────────── */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ mb: 3, letterSpacing: '-0.01em' }}>
            Bài viết nổi bật
          </Typography>

          {isLoading && featuredArticles.length === 0 ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rectangular" height={380} sx={{ borderRadius: 3 }} />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {/* Left Side: 3 Side Featured Cards */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Stack spacing={2}>
                  {sideFeaturedArticles.map((item) => {
                    const itemHref = localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL, item.slug)}`, i18n.language);
                    return (
                      <Card
                        key={item.id}
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
                            borderColor: '#e11d48',
                          },
                        }}
                      >
                        <CardActionArea component={Link} href={itemHref} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CardMedia
                            component="img"
                            image={getArticleImage(item)}
                            alt={item.title}
                            sx={{ width: 130, height: 90, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Chip
                              label={item.categoryName || 'CẨM NANG'}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.675rem',
                                fontWeight: 800,
                                bgcolor: 'rgba(225, 29, 72, 0.10)',
                                color: '#e11d48',
                                mb: 1,
                              }}
                            />
                            <Typography fontWeight={700} fontSize="0.95rem" color="#0f172a" sx={{ lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.title}
                            </Typography>
                          </Box>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Stack>
              </Grid>

              {/* Right Side: Large Hero Featured Card */}
              {mainFeaturedArticle && (
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3.5,
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 16px 36px rgba(225, 29, 72, 0.14)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL, mainFeaturedArticle.slug)}`, i18n.language)}
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardMedia
                        component="img"
                        image={getArticleImage(mainFeaturedArticle)}
                        alt={mainFeaturedArticle.title}
                        sx={{ height: 260, objectFit: 'cover' }}
                      />
                      <Box sx={{ p: 3, bgcolor: '#e11d48', color: '#ffffff', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Chip
                          label={mainFeaturedArticle.categoryName || 'LA BÀN SỰ NGHIỆP'}
                          size="small"
                          sx={{
                            alignSelf: 'flex-start',
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: 'rgba(255, 255, 255, 0.20)',
                            color: '#ffffff',
                            mb: 1.5,
                          }}
                        />
                        <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.25, mb: 1.5 }}>
                          {mainFeaturedArticle.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {mainFeaturedArticle.excerpt}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Box>

        {/* ── Latest Articles Section with Filter Tabs ────────────────────────── */}
        <Box sx={{ mb: 6 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ letterSpacing: '-0.01em' }}>
              Bài viết mới nhất
            </Typography>

            {/* Category Filter Pills */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              <Chip
                label="TẤT CẢ"
                clickable
                onClick={() => handleSelectCategory('all')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  bgcolor: activeCategorySlug === 'all' ? '#e11d48' : 'transparent',
                  color: activeCategorySlug === 'all' ? '#ffffff' : '#64748b',
                  border: '1px solid',
                  borderColor: activeCategorySlug === 'all' ? '#e11d48' : '#cbd5e1',
                  '&:hover': { bgcolor: activeCategorySlug === 'all' ? '#be123c' : 'rgba(225, 29, 72, 0.08)' },
                }}
              />
              {categories.slice(0, 5).map((cat) => {
                const isSelected = activeCategorySlug === cat.slug;
                return (
                  <Chip
                    key={cat.id}
                    label={cat.name.toUpperCase()}
                    clickable
                    onClick={() => handleSelectCategory(cat.slug)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      bgcolor: isSelected ? '#e11d48' : 'transparent',
                      color: isSelected ? '#ffffff' : '#64748b',
                      border: '1px solid',
                      borderColor: isSelected ? '#e11d48' : '#cbd5e1',
                      '&:hover': { bgcolor: isSelected ? '#be123c' : 'rgba(225, 29, 72, 0.08)' },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          {/* 3-Column Articles Grid */}
          {isLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : displayLatestArticles.length === 0 ? (
            <NoDataCard title={t('news.emptyTitle')} content={t('news.emptyContent')} />
          ) : (
            <Grid container spacing={3}>
              {displayLatestArticles.map((article) => {
                const articleHref = localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.NEWS_DETAIL, article.slug)}`, i18n.language);
                const articleTimestamp = article.publishedAt || article.createAt || article.updateAt;
                const publishedAgo = articleTimestamp ? dayjs(articleTimestamp).fromNow() : 'Mới cập nhật';

                return (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 16px 36px rgba(15, 23, 42, 0.10)',
                          borderColor: '#e11d48',
                        },
                      }}
                    >
                      <CardActionArea
                        component={Link}
                        href={articleHref}
                        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        <CardMedia
                          component="img"
                          image={getArticleImage(article)}
                          alt={article.title}
                          sx={{ height: 190, objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: '#0f172a',
                              fontSize: '1rem',
                              lineHeight: 1.35,
                              mb: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              '&:hover': { color: '#e11d48' },
                            }}
                          >
                            {article.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#64748b',
                              fontSize: '0.825rem',
                              lineHeight: 1.5,
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {article.excerpt}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 'auto', fontWeight: 600 }}>
                            Bởi {article.authorName || 'Admin'} • {publishedAgo}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, nextPage) => setPage(nextPage)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root.Mui-selected': {
                    bgcolor: '#e11d48',
                    color: '#ffffff',
                  },
                }}
              />
            </Stack>
          )}
        </Box>

        {/* ── In-feed Banner Promotion ───────────────────────────────────────── */}
        <Box
          sx={{
            borderRadius: '16px',
            p: { xs: 3, md: 4 },
            mb: 6,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#ffffff', mb: 0.5 }}>
              Khám phá 10.000+ việc làm đang tuyển dụng
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Ứng tuyển nhanh chóng, kết nối trực tiếp với nhà tuyển dụng hàng đầu.
            </Typography>
          </Box>
          <Button
            component={Link}
            href={jobsHref}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#e11d48',
              color: '#ffffff',
              fontWeight: 800,
              px: 3,
              py: 1.25,
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#be123c' },
            }}
          >
            Tìm việc ngay
          </Button>
        </Box>

        {/* ── Popular Keywords Tag Cloud ────────────────────────────────────── */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 3, bgcolor: '#ffffff' }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
            Từ khoá nổi bật
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {popularKeywords.map((item, index) => {
              const labelText = typeof item === 'string' ? item : (item as { title?: string; kw?: string })?.title || (item as { title?: string; kw?: string })?.kw || '';
              if (!labelText) return null;
              const itemKey = `kw-${labelText}-${index}`;
              const searchHref = `${jobsHref}?kw=${encodeURIComponent(labelText)}`;

              return (
                <Chip
                  key={itemKey}
                  label={labelText}
                  clickable
                  component={Link}
                  href={searchHref}
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      bgcolor: '#ffffff',
                      color: '#e11d48',
                      borderColor: '#e11d48',
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

const NewsPage = () => {
  return (
    <React.Suspense fallback={<Box sx={{ py: 6, textAlign: 'center' }}><Skeleton height={400} /></Box>}>
      <NewsContent />
    </React.Suspense>
  );
};

export default NewsPage;
