'use client';
import React, { useCallback, useEffect, useReducer } from 'react';
import {
  Box, Button, Chip, IconButton, Stack, Tooltip, Typography,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import contentService, { Article, ArticleCategory, ArticleStatus } from '@/services/contentService';
import DataTable from '@/components/Common/DataTable';
import toastMessages from '@/utils/toastMessages';
import dayjs from '@/configs/dayjs-config';

const STATUS_COLOR: Record<ArticleStatus, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  draft: 'default',
  pending: 'warning',
  published: 'success',
  archived: 'info',
};

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: 'Bản nháp',
  pending: 'Chờ duyệt',
  published: 'Đã đăng',
  archived: 'Lưu trữ',
};

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
      toastMessages.error('Không thể tải danh sách bài viết');
      dispatch({ type: 'failed' });
    }
  }, [category, statusFilter, search, pagination]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${title}"?`)) return;
    try {
      await contentService.adminDeleteArticle(id);
      toastMessages.success('Đã xóa bài viết');
      fetchArticles();
    } catch {
      toastMessages.error('Không thể xóa bài viết');
    }
  };

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
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
      header: 'Danh mục',
      cell: ({ row }) => (
        <Chip
          icon={row.original.category === 'news' ? <NewspaperIcon fontSize="small" /> : <ArticleIcon fontSize="small" />}
          label={row.original.category === 'news' ? 'Tin tức' : 'Blog'}
          size="small"
          variant="outlined"
          color={row.original.category === 'news' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Chip
          label={STATUS_LABEL[row.original.status]}
          size="small"
          color={STATUS_COLOR[row.original.status]}
        />
      ),
    },
    {
      accessorKey: 'authorName',
      header: 'Tác giả',
      cell: ({ row }) => <Typography variant="body2">{row.original.authorName || '—'}</Typography>,
    },
    {
      accessorKey: 'publishedAt',
      header: 'Ngày đăng',
      cell: ({ row }) => (
        <Typography variant="body2">
          {row.original.publishedAt ? dayjs(row.original.publishedAt).format('DD/MM/YYYY HH:mm') : '—'}
        </Typography>
      ),
    },
    {
      accessorKey: 'viewCount',
      header: 'Lượt xem',
      cell: ({ row }) => <Typography variant="body2">{row.original.viewCount?.toLocaleString()}</Typography>,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => push(`/admin/articles/${row.original.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
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
            Tin tức & Blog
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Quản lý bài viết tin tức và blog tuyển dụng
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => push('/admin/articles/create')}
          sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
        >
          Viết bài mới
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3} alignItems="center">
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, v) => {
            if (v) dispatch({ type: 'patch', patch: { category: v } });
          }}
          size="small"
          sx={{ height: 40 }}
        >
          <ToggleButton value="all">Tất cả</ToggleButton>
          <ToggleButton value="news">Tin tức</ToggleButton>
          <ToggleButton value="blog">Blog</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái"
            onChange={(e) => dispatch({ type: 'patch', patch: { statusFilter: e.target.value as ArticleStatus | 'all' } })}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="draft">Bản nháp</MenuItem>
            <MenuItem value="pending">Chờ duyệt</MenuItem>
            <MenuItem value="published">Đã đăng</MenuItem>
            <MenuItem value="archived">Lưu trữ</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Tìm kiếm bài viết..."
          value={searchInput}
          onChange={(e) => dispatch({ type: 'patch', patch: { searchInput: e.target.value } })}
          onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'patch', patch: { search: searchInput } })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, maxWidth: 400 }}
        />
        <Button variant="outlined" onClick={() => dispatch({ type: 'patch', patch: { search: searchInput } })} sx={{ height: 40 }}>
          Tìm kiếm
        </Button>
      </Stack>

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
