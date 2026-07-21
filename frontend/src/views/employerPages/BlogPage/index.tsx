'use client';
import React, { useCallback, useEffect, useReducer } from 'react';
import {
  Box, Button, Chip, IconButton, Stack, Tooltip, Typography,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import contentService, { Article, ArticleStatus } from '@/services/contentService';
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

type BlogListPagination = {
  pageIndex: number;
  pageSize: number;
};

type EmployerBlogListState = {
  statusFilter: ArticleStatus | 'all';
  searchInput: string;
  search: string;
  articles: Article[];
  total: number;
  isLoading: boolean;
  pagination: BlogListPagination;
};

type EmployerBlogListAction =
  | { type: 'patch'; patch: Partial<EmployerBlogListState> }
  | { type: 'loading' }
  | { type: 'loaded'; articles: Article[]; total: number }
  | { type: 'failed' }
  | { type: 'paginationChanged'; pagination: BlogListPagination };

const initialEmployerBlogListState: EmployerBlogListState = {
  statusFilter: 'all',
  searchInput: '',
  search: '',
  articles: [],
  total: 0,
  isLoading: false,
  pagination: { pageIndex: 0, pageSize: 10 },
};

const employerBlogListReducer = (
  state: EmployerBlogListState,
  action: EmployerBlogListAction
): EmployerBlogListState => {
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

const EmployerBlogListPage = () => {
  const { t } = useTranslation('employer');
  const { push } = useRouter();
  const [state, dispatch] = useReducer(employerBlogListReducer, initialEmployerBlogListState);
  const { statusFilter, searchInput, search, articles, total, isLoading, pagination } = state;

  const fetchArticles = useCallback(async () => {
    dispatch({ type: 'loading' });
    try {
      const res = await contentService.employerGetBlogs({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
      });
      dispatch({ type: 'loaded', articles: res.results || [], total: res.count || 0 });
    } catch {
      toastMessages.error(t('blog.messages.loadError'));
      dispatch({ type: 'failed' });
    }
  }, [statusFilter, search, pagination, t]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(t('blog.messages.deleteConfirm', { title }))) return;
    try {
      await contentService.employerDeleteBlog(id);
      toastMessages.success(t('blog.messages.deleteSuccess'));
      fetchArticles();
    } catch {
      toastMessages.error(t('blog.messages.deleteError'));
    }
  };

  const getStatusLabel = (status: ArticleStatus) => t(`blog.statuses.${status}`);

  const columns = [
    {
      accessorKey: 'title',
      header: t('blog.table.title'),
      cell: ({ row }: { row: { original: Article } }) => (
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
            {row.original.title}
          </Typography>
          <Typography variant="caption" color="text.secondary"
            sx={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.original.excerpt}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'status',
      header: t('blog.table.status'),
      cell: ({ row }: { row: { original: Article } }) => (
        <Chip
          label={getStatusLabel(row.original.status)}
          size="small"
          color={STATUS_COLOR[row.original.status]}
        />
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: t('blog.table.publishedAt'),
      cell: ({ row }: { row: { original: Article } }) => (
        <Typography variant="body2">
          {row.original.publishedAt ? dayjs(row.original.publishedAt).format('DD/MM/YYYY') : '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'viewCount',
      header: t('blog.table.viewCount'),
      cell: ({ row }: { row: { original: Article } }) => (
        <Typography variant="body2">{row.original.viewCount?.toLocaleString()}</Typography>
      ),
    },
    {
      id: 'actions',
      header: t('blog.table.actions'),
      cell: ({ row }: { row: { original: Article } }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('blog.actions.edit')}>
            <IconButton size="small" onClick={() => push(`/employer/blog/${row.original.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('blog.actions.delete')}>
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
            {t('blog.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {t('blog.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => push('/employer/blog/create')}
          sx={{ fontWeight: 700, px: 3 }}
        >
          {t('blog.newPost')}
        </Button>
      </Stack>

      {/* Info banner */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, bgcolor: 'info.main', color: 'white', p: 2, borderRadius: 2, mb: 3, fontSize: '0.85rem' }}>
        <LightbulbIcon sx={{ fontSize: 18, mt: 0.1, flexShrink: 0 }} />
        {t('blog.reviewNotice')}
      </Box>

      <FilterBar
        title={t('blog.filter.title')}
        searchValue={searchInput}
        searchPlaceholder={t('blog.filter.searchPlaceholder')}
        onSearchChange={(value) => dispatch({ type: 'patch', patch: { searchInput: value } })}
        onSearchSubmit={() => dispatch({ type: 'patch', patch: { search: searchInput.trim(), pagination: { ...pagination, pageIndex: 0 } } })}
        showSearchButton
        searchButtonLabel={t('blog.actions.search')}
        activeFilterCount={[statusFilter !== 'all', Boolean(search)].filter(Boolean).length}
        onReset={() => dispatch({
          type: 'patch',
          patch: {
            statusFilter: 'all',
            search: '',
            searchInput: '',
            pagination: { ...pagination, pageIndex: 0 },
          },
        })}
        resetDisabled={statusFilter === 'all' && !search && !searchInput}
        resetLabel={t('blog.actions.clearFilters')}
        advancedLabel={t('blog.actions.advancedFilters')}
        advancedDefaultOpen={statusFilter !== 'all'}
        advancedFilters={(
          <FormControl size="small" sx={statusFilterSx}>
            <InputLabel>{t('blog.filter.status')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('blog.filter.status')}
              onChange={(e) => dispatch({
                type: 'patch',
                patch: {
                  statusFilter: e.target.value as ArticleStatus | 'all',
                  pagination: { ...pagination, pageIndex: 0 },
                },
              })}
            >
              <MenuItem value="all">{t('blog.statuses.all')}</MenuItem>
              <MenuItem value="draft">{t('blog.statuses.draft')}</MenuItem>
              <MenuItem value="pending">{t('blog.statuses.pending')}</MenuItem>
              <MenuItem value="published">{t('blog.statuses.published')}</MenuItem>
            </Select>
          </FormControl>
        )}
      >
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

export default EmployerBlogListPage;
