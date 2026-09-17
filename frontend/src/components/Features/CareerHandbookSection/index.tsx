'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import contentService, { type Article } from '@/services/contentService';
import { getArticleImage, withArticleImages } from '@/views/defaultPages/NewsPage/blogImages';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const formatViTimeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return 'Mới cập nhật';
  const now = dayjs();
  const past = dayjs(dateStr);
  const diffDays = now.diff(past, 'day');
  if (diffDays < 1) return 'Hôm nay';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

const cleanAuthorName = (name?: string | null): string => {
  if (!name) return 'InfoHR Tuyển Dụng';
  return name.replace(/Square/gi, 'InfoHR');
};

const CareerHandbookSection = () => {
  const { t } = useTranslation('common');
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['public-articles-handbook'],
    queryFn: async () => {
      const res = await contentService.getPublicArticles({ pageSize: 3 });
      return withArticleImages(res?.results || []);
    },
    staleTime: 5 * 60_000,
  });

  return (
    <Box>
      {/* -- Section Header ------------------------------------------------ */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
          {t('news.handbookTitle', 'Tin tức & Thông tin')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
          {t('news.handbookSubtitle', 'Cập nhật những thông tin, tin tức tuyển dụng và thị trường lao động mới nhất.')}
        </Typography>
      </Stack>

      {/* -- Articles Grid (3 Columns) ----------------------------------- */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from(Array(3).keys()).map((i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={340} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article: Article) => {
            const articleHref = `/tin-tuc/${article.slug}`;
            const publishedAgo = formatViTimeAgo(article.publishedAt);
            const author = cleanAuthorName(article.authorName);

            return (
              <Grid key={article.id} size={{ xs: 12, md: 4 }}>
                <Card
                  component={Link}
                  href={articleHref}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.10)',
                      borderColor: '#e11d48',
                      '& .article-title': { color: '#e11d48' },
                    },
                  }}
                >
                  {/* Article Thumbnail */}
                  <Box sx={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <CardMedia
                      component="img"
                      image={getArticleImage(article)}
                      alt={article.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                    <Chip
                      label={article.categoryName || t('news.defaultCategory', 'CẨM NANG')}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        height: 24,
                        fontSize: '0.675rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(225, 29, 72, 0.90)',
                        color: '#ffffff',
                      }}
                    />
                  </Box>

                  {/* Article Content */}
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      className="article-title"
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#0f172a',
                        lineHeight: 1.4,
                        mb: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {article.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.85rem',
                        lineHeight: 1.55,
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
                      {t('news.byAuthor', 'Bởi {{author}} • {{time}}', { author, time: publishedAgo })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* -- Bottom Button ----------------------------------------------- */}
      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <Button
          component={Link}
          href="/tin-tuc"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: '#e11d48',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9rem',
            borderRadius: '24px',
            px: 3.5,
            py: 1.2,
            textTransform: 'none',
            boxShadow: '0 8px 20px rgba(225, 29, 72, 0.28)',
            '&:hover': {
              backgroundColor: '#be123c',
              boxShadow: '0 10px 24px rgba(225, 29, 72, 0.38)',
            },
          }}
        >
          {t('news.viewMore', 'Xem thêm tin tức & thông tin')}
        </Button>
      </Stack>
    </Box>
  );
};

export default CareerHandbookSection;
