'use client';
import React, { useCallback, useEffect, useReducer } from 'react';
import {
  Box, Button, Chip, IconButton, Stack, Tooltip, Typography,
  MenuItem, Select, FormControl, InputLabel,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArticleIcon from '@mui/icons-material/Article';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import contentService, { Article, ArticleCategory, ArticleStatus } from '@/services/contentService';
import DataTable from '@/components/Common/DataTable';
import toastMessages from '@/utils/toastMessages';
import dayjs from '@/configs/dayjs-config';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import type { SxProps, Theme } from '@mui/material/styles';

const STATUS_COLOR: Record<ArticleStatus, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  draft: 'default',
  pending: 'warning',
  published: 'success',
  archived: 'info',
};

const statusFilterSx = [{ width: { xs: '100%', sm: 220 } }, filterControlSx] as SxProps<Theme>;

type ArticleListPagination = {
  pageIndex: number;
  pageSize: number;
};

type AdminArticlesState = {
  category: ArticleCategory | 'all';
  statusFilter: ArticleStatus | 'all';
  search: string;
  searchInput: string;
  articles: Article[];
  total: number;
  isLoading: boolean;
  pagination: ArticleListPagination;
};

type AdminArticlesAction =
  | { type: 'patch'; patch: Partial<AdminArticlesState> }
  | { type: 'loading' }
  | { type: 'loaded'; articles: Article[]; total: number }
  | { type: 'failed' }
  | { type: 'paginationChanged'; pagination: ArticleListPagination };

const initialAdminArticlesState: AdminArticlesState = {
  category: 'all',
  statusFilter: 'all',
  search: '',
  searchInput: '',
  articles: [],
  total: 0,
  isLoading: false,
  pagination: { pageIndex: 0, pageSize: 10 },
};

const adminArticlesReducer = (
  state: AdminArticlesState,
  action: AdminArticlesAction
): AdminArticlesState => {
  switch (action.type) {
    case 'patch':
      return {
        ...state,
        ...action.patch,
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
        isLoading: false,
      };
    case 'paginationChanged':
      return {
        ...state,
        pagination: action.pagination,
      };
    default:
      return state;
  }
};

const AdminArticlesPage = () => {
  const { push } = useRouter();
  const { t } = useTranslation('admin');
  const [state, dispatch] = useReducer(adminArticlesReducer, initialAdminArticlesState);
  const { category, statusFilter, search, searchInput, articles, total, isLoading, pagination } = state;

  const fetchArticles = useCallback(async () => {
    dispatch({ type: 'loading' });
    try {
      const res = await contentService.adminGetArticles({
        category: category === 'all' ? undefined : category,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
      });
      dispatch({ type: 'loaded', articles: res.results || [], total: res.count || 0 });
    } catch {
      toastMessages.error(t('pages.articles.messages.loadError'));
      dispatch({ type: 'failed' });
    }
  }, [category, statusFilter, search, pagination, t]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(t('pages.articles.messages.deleteConfirm', { title }))) return;
    try {
      await contentService.adminDeleteArticle(id);
      toastMessages.success(t('pages.articles.messages.deleteSuccess'));
      fetchArticles();
    } catch {
      toastMessages.error(t('pages.articles.messages.deleteError'));
    }
  };

  const getStatusLabel = (status: ArticleStatus) => t(`pages.articles.statuses.${status}`);
  const getCategoryLabel = (articleCategory: ArticleCategory) => t(`pages.articles.categories.${articleCategory}`);

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: 'title',
      header: t('pages.articles.table.title'),
      cell: ({ row }) => (
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
            {row.original.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.original.excerpt}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'category',
      header: t('pages.articles.table.category'),
      cell: ({ row }) => (
        <Chip
          icon={row.original.category === 'news' ? <NewspaperIcon fontSize="small" /> : <ArticleIcon fontSize="small" />}
          label={getCategoryLabel(row.original.category)}
          size="small"
          variant="outlined"
          color={row.original.category === 'news' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: t('pages.articles.table.status'),
      cell: ({ row }) => (
        <Chip
          label={getStatusLabel(row.original.status)}
          size="small"
          color={STATUS_COLOR[row.original.status]}
        />
      ),
    },
    {
      accessorKey: 'authorName',
      header: t('pages.articles.table.author'),
      cell: ({ row }) => <Typography variant="body2">{row.original.authorName || '—'}</Typography>,
    },
    {
      accessorKey: 'publishedAt',
      header: t('pages.articles.table.publishedAt'),
      cell: ({ row }) => (
        <Typography variant="body2">
          {row.original.publishedAt ? dayjs(row.original.publishedAt).format('DD/MM/YYYY HH:mm') : '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'viewCount',
      header: t('pages.articles.table.viewCount'),
      cell: ({ row }) => <Typography variant="body2">{row.original.viewCount?.toLocaleString()}</Typography>,
    },
    {
      id: 'actions',
      header: t('pages.articles.table.actions'),
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('pages.articles.actions.edit')}>
            <IconButton size="small" onClick={() => push(`/admin/articles/${row.original.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.articles.actions.delete')}>
            <IconButton size="small" color="error" onClick={() => handleDelete(row.original.id, row.original.title)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={900} letterSpacing="-0.5px">
            {t('pages.articles.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {t('pages.articles.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => push('/admin/articles/create')}
          sx={{ fontWeight: 700, px: 3 }}
        >
          {t('pages.articles.newArticle')}
        </Button>
      </Stack>

      <FilterBar
        title={t('pages.articles.filter.title')}
        searchValue={searchInput}
        searchPlaceholder={t('pages.articles.filter.searchPlaceholder')}
        onSearchChange={(value) => dispatch({ type: 'patch', patch: { searchInput: value } })}
        onSearchSubmit={() => dispatch({ type: 'patch', patch: { search: searchInput.trim(), pagination: { ...pagination, pageIndex: 0 } } })}
        showSearchButton
        searchButtonLabel={t('pages.articles.actions.search')}
        activeFilterCount={[category !== 'all', statusFilter !== 'all', Boolean(search)].filter(Boolean).length}
        onReset={() => dispatch({
          type: 'patch',
          patch: {
            category: 'all',
            statusFilter: 'all',
            search: '',
            searchInput: '',
            pagination: { ...pagination, pageIndex: 0 },
          },
        })}
        resetDisabled={category === 'all' && statusFilter === 'all' && !search && !searchInput}
        resetLabel={t('pages.articles.actions.clearFilters')}
        advancedLabel={t('pages.articles.actions.advancedFilters')}
        advancedDefaultOpen={statusFilter !== 'all'}
        advancedFilters={(
          <FormControl size="small" sx={statusFilterSx}>
            <InputLabel>{t('pages.articles.filter.status')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('pages.articles.filter.status')}
              onChange={(e) => dispatch({
                type: 'patch',
                patch: {
                  statusFilter: e.target.value as ArticleStatus | 'all',
                  pagination: { ...pagination, pageIndex: 0 },
                },
              })}
            >
              <MenuItem value="all">{t('pages.articles.statuses.all')}</MenuItem>
              <MenuItem value="draft">{t('pages.articles.statuses.draft')}</MenuItem>
              <MenuItem value="pending">{t('pages.articles.statuses.pending')}</MenuItem>
              <MenuItem value="published">{t('pages.articles.statuses.published')}</MenuItem>
              <MenuItem value="archived">{t('pages.articles.statuses.archived')}</MenuItem>
            </Select>
          </FormControl>
        )}
      >
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, v) => {
            if (v) dispatch({ type: 'patch', patch: { category: v, pagination: { ...pagination, pageIndex: 0 } } });
          }}
          size="small"
          sx={{
            height: 42,
            '& .MuiToggleButton-root': {
              px: 2,
              borderRadius: '8px',
              fontWeight: 800,
              textTransform: 'none',
            },
          }}
        >
          <ToggleButton value="all">{t('pages.articles.categories.all')}</ToggleButton>
          <ToggleButton value="news">{t('pages.articles.categories.news')}</ToggleButton>
          <ToggleButton value="blog">{t('pages.articles.categories.blog')}</ToggleButton>
        </ToggleButtonGroup>
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={articles}
        isLoading={isLoading}
        pagination={pagination}
        rowCount={total}
        onPaginationChange={(nextPagination) => dispatch({ type: 'paginationChanged', pagination: nextPagination })}
      />
    </Box>
  );
};

export default AdminArticlesPage;
