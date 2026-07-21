'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Rating,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import DataTable from '../../../components/Common/DataTable';
import FilterBar, { filterControlSx } from '../../../components/Common/FilterBar';
import { useDataTable } from '../../../hooks';
import { Feedback } from '../../../types/models';
import { useFeedbacks } from './hooks/useFeedbacks';
import dayjs from '../../../configs/dayjs-config';
import toastMessages from '../../../utils/toastMessages';

type EvidenceFilter = 'all' | 'with' | 'without';
type StatusFilter = 'all' | 'active' | 'hidden';
type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';
type FeedbackFormMode = 'add' | 'edit';

type FeedbackFormState = {
  content: string;
  rating: string;
  isActive: boolean;
  userId: string;
  evidenceImageFile: File | null;
  evidenceImageUrl: string;
};

const createInitialFormState = (): FeedbackFormState => ({
  content: '',
  rating: '5',
  isActive: false,
  userId: '',
  evidenceImageFile: null,
  evidenceImageUrl: '',
});

const FeedbacksPage = () => {
  const { t } = useTranslation('admin');
  const [openDelete, setOpenDelete] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [dialogMode, setDialogMode] = useState<FeedbackFormMode>('add');
  const [current, setCurrent] = useState<Feedback | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [formState, setFormState] = useState<FeedbackFormState>(() => createInitialFormState());

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
    searchTerm,
    debouncedSearchTerm,
    onSearchChange,
    setPage,
  } = useDataTable({ initialPageSize: 10, initialSorting: [{ id: 'create_at', desc: true }] });

  const {
    data,
    isLoading,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    isMutating,
  } = useFeedbacks({
    page: page + 1,
    pageSize,
    ordering,
    search: debouncedSearchTerm || undefined,
    user: userFilter.trim() || undefined,
    isActive:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active',
    hasEvidence:
      evidenceFilter === 'all'
        ? undefined
        : evidenceFilter === 'with',
    rating:
      ratingFilter === 'all'
        ? undefined
        : Number(ratingFilter),
  });

  const feedbacks = data?.results || [];
  const totalFeedbacks = data?.count || 0;

  const clearFormPreview = useCallback((url?: string) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const openAddDialog = useCallback(() => {
    setDialogMode('add');
    setCurrent(null);
    setFormState(createInitialFormState());
    setOpenForm(true);
  }, []);

  const openEditDialog = useCallback((feedback: Feedback) => {
    setDialogMode('edit');
    setCurrent(feedback);
    setFormState({
      content: feedback.content || '',
      rating: String(feedback.rating || 5),
      isActive: !!(feedback.isActive ?? feedback.is_active),
      userId: String(feedback.userId ?? feedback.userDict?.id ?? ''),
      evidenceImageFile: null,
      evidenceImageUrl: feedback.evidenceImageUrl || '',
    });
    setOpenForm(true);
  }, []);

  const closeFormDialog = useCallback(() => {
    setOpenForm(false);
    setCurrent(null);
    setFormState((prev) => {
      clearFormPreview(prev.evidenceImageUrl);
      return createInitialFormState();
    });
  }, [clearFormPreview]);

  useEffect(() => {
    return () => {
      clearFormPreview(formState.evidenceImageUrl);
    };
  }, [clearFormPreview, formState.evidenceImageUrl]);

  const handleToggleActive = useCallback(async (fb: Feedback) => {
    try {
      await updateFeedback({
        id: fb.id,
        data: {
          isActive: !Boolean(fb.isActive ?? fb.is_active),
        },
      });
    } catch (e) {
      console.error(e);
    }
  }, [updateFeedback]);

  const handleDelete = async () => {
    if (!current) return;
    try {
      await deleteFeedback(current.id);
      setOpenDelete(false);
      setCurrent(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormState((prev) => {
      clearFormPreview(prev.evidenceImageUrl);
      return {
        ...prev,
        evidenceImageFile: file,
        evidenceImageUrl: URL.createObjectURL(file),
      };
    });
    event.target.value = '';
  };

  const handleSave = async () => {
    if (!formState.content.trim()) {
      toastMessages.error(t('pages.feedbacks.validation.contentRequired'));
      return;
    }

    const ratingValue = Number(formState.rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      toastMessages.error(t('pages.feedbacks.validation.ratingInvalid'));
      return;
    }

    const payload = new FormData();
    payload.append('content', formState.content.trim());
    payload.append('rating', String(ratingValue));
    payload.append('isActive', String(formState.isActive));
    if (formState.userId.trim()) {
      payload.append('userId', String(Number(formState.userId)));
    }
    if (formState.evidenceImageFile) {
      payload.append('evidenceImageFile', formState.evidenceImageFile);
    }

    try {
      if (dialogMode === 'add') {
        await createFeedback(payload);
      } else if (current) {
        await updateFeedback({ id: current.id, data: payload });
      }
      closeFormDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const activeFilterCount = [
    Boolean(searchTerm.trim()),
    Boolean(userFilter.trim()),
    statusFilter !== 'all',
    evidenceFilter !== 'all',
    ratingFilter !== 'all',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setUserFilter('');
    setStatusFilter('all');
    setEvidenceFilter('all');
    setRatingFilter('all');
    onSearchChange('');
    setPage(0);
  };

  const columns = useMemo<ColumnDef<Feedback>[]>(() => [
    {
      accessorKey: 'id',
      header: t('pages.feedbacks.table.id') as string,
      enableSorting: true,
    },
    {
      accessorKey: 'userDict.fullName',
      header: t('pages.feedbacks.table.user') as string,
      enableSorting: true,
      cell: (info) => {
        const user = info.row.original.userDict;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={user?.avatarUrl || ''}
              alt=""
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.style.display = 'none';
              }}
              sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
            />
            <Box>
              <Typography variant="body2" fontWeight={600}>{user?.fullName || '—'}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email || ''}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      accessorKey: 'content',
      header: t('pages.feedbacks.table.content') as string,
      cell: (info) => (
        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {info.getValue() as string}
        </Typography>
      ),
    },
    {
      accessorKey: 'evidenceImageUrl',
      header: t('pages.feedbacks.table.evidence') as string,
      cell: (info) => {
        const feedback = info.row.original;
        const evidenceImageUrl = feedback.evidenceImageUrl;
        if (!evidenceImageUrl) {
          return <Typography variant="body2" color="text.secondary">—</Typography>;
        }

        return (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ImageIcon fontSize="small" />}
            onClick={() => setEvidencePreview({
              url: evidenceImageUrl,
              title: feedback.userDict?.fullName || `#${feedback.id}`,
            })}
            sx={{ textTransform: 'none' }}
          >
            {t('pages.feedbacks.table.viewEvidence')}
          </Button>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: t('pages.feedbacks.table.rating') as string,
      enableSorting: true,
      cell: (info) => <Rating value={info.getValue() as number} readOnly size="small" />,
    },
    {
      id: 'is_active',
      accessorFn: (row) => row.isActive ?? row.is_active,
      header: t('pages.feedbacks.table.status') as string,
      cell: (info) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Switch
            checked={!!info.getValue()}
            onChange={() => handleToggleActive(info.row.original)}
            size="small"
            color="success"
            disabled={isMutating}
          />
          <Chip
            label={info.getValue() ? t('pages.feedbacks.show') : t('pages.feedbacks.hide')}
            size="small"
            color={info.getValue() ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>
      ),
    },
    {
      id: 'create_at',
      accessorFn: (row) => row.createAt || row.create_at,
      header: t('pages.feedbacks.table.createdAt') as string,
      enableSorting: true,
      cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '—',
    },
    {
      id: 'actions',
      header: t('pages.feedbacks.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('pages.feedbacks.table.editTooltip')}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => openEditDialog(info.row.original)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.feedbacks.table.deleteTooltip')}>
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setCurrent(info.row.original);
                setOpenDelete(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [handleToggleActive, isMutating, openEditDialog, t]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {t('pages.feedbacks.title')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{ textTransform: 'none' }}
        >
          {t('pages.feedbacks.addBtn')}
        </Button>
      </Box>

      <FilterBar
        title={t('pages.feedbacks.filter.title')}
        description={t('pages.feedbacks.filter.description')}
        searchValue={searchTerm}
        searchPlaceholder={t('pages.feedbacks.searchPlaceholder')}
        onSearchChange={onSearchChange}
        onReset={resetFilters}
        resetLabel={t('pages.feedbacks.filter.reset')}
        activeFilterCount={activeFilterCount}
        advancedLabel={t('pages.feedbacks.filter.advanced')}
        advancedFilters={(
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t('pages.feedbacks.filter.user')}
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                fullWidth
                sx={filterControlSx}
                placeholder={t('pages.feedbacks.filter.userPlaceholder')}
              />
              <FormControl fullWidth sx={filterControlSx}>
                <InputLabel>{t('pages.feedbacks.filter.status')}</InputLabel>
                <Select
                  label={t('pages.feedbacks.filter.status')}
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                >
                  <MenuItem value="all">{t('pages.feedbacks.filter.all')}</MenuItem>
                  <MenuItem value="active">{t('pages.feedbacks.filter.active')}</MenuItem>
                  <MenuItem value="hidden">{t('pages.feedbacks.filter.hidden')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth sx={filterControlSx}>
                <InputLabel>{t('pages.feedbacks.filter.evidence')}</InputLabel>
                <Select
                  label={t('pages.feedbacks.filter.evidence')}
                  value={evidenceFilter}
                  onChange={(event) => setEvidenceFilter(event.target.value as EvidenceFilter)}
                >
                  <MenuItem value="all">{t('pages.feedbacks.filter.all')}</MenuItem>
                  <MenuItem value="with">{t('pages.feedbacks.filter.withEvidence')}</MenuItem>
                  <MenuItem value="without">{t('pages.feedbacks.filter.withoutEvidence')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={filterControlSx}>
                <InputLabel>{t('pages.feedbacks.filter.rating')}</InputLabel>
                <Select
                  label={t('pages.feedbacks.filter.rating')}
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value as RatingFilter)}
                >
                  <MenuItem value="all">{t('pages.feedbacks.filter.all')}</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="1">1</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        )}
        advancedDefaultOpen
        sx={{ mb: 3 }}
      />

      <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={0}>
        <DataTable
          columns={columns}
          data={feedbacks}
          isLoading={isLoading}
          rowCount={totalFeedbacks}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          paginationMode="visible"
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
          emptyMessage={t('pages.feedbacks.empty')}
        />
      </Paper>

      <Dialog open={openForm} onClose={closeFormDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {dialogMode === 'add' ? t('pages.feedbacks.addTitle') : t('pages.feedbacks.editTitle')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={t('pages.feedbacks.form.userId')}
              value={formState.userId}
              onChange={(event) => setFormState((prev) => ({ ...prev, userId: event.target.value }))}
              fullWidth
              type="number"
              sx={filterControlSx}
              helperText={t('pages.feedbacks.form.userIdHelp')}
            />
            <TextField
              label={t('pages.feedbacks.form.content')}
              value={formState.content}
              onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
              fullWidth
              multiline
              minRows={4}
              required
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>{t('pages.feedbacks.form.rating')}</InputLabel>
                <Select
                  label={t('pages.feedbacks.form.rating')}
                  value={formState.rating}
                  onChange={(event) => setFormState((prev) => ({ ...prev, rating: String(event.target.value) }))}
                >
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="1">1</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2, py: 1 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {t('pages.feedbacks.form.isActive')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formState.isActive ? t('pages.feedbacks.show') : t('pages.feedbacks.hide')}
                  </Typography>
                </Box>
                <Switch
                  checked={formState.isActive}
                  onChange={(event) => setFormState((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
              </Box>
            </Stack>

            <Box>
              <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
                {t('pages.feedbacks.form.evidenceImage')}
                <input hidden type="file" accept="image/*" onChange={handleFileChange} />
              </Button>
              <FormHelperText sx={{ mt: 1 }}>
                {t('pages.feedbacks.form.evidenceHint')}
              </FormHelperText>
              <FormHelperText sx={{ mt: 0.5 }}>
                {formState.evidenceImageFile?.name || t('pages.feedbacks.form.noFile')}
              </FormHelperText>
              {formState.evidenceImageUrl && (
                <Box
                  component="img"
                  src={formState.evidenceImageUrl}
                  alt={formState.evidenceImageFile?.name || t('pages.feedbacks.form.evidenceImage')}
                  sx={{
                    mt: 2,
                    width: '100%',
                    maxHeight: 320,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeFormDialog} color="inherit">
            {t('pages.feedbacks.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isMutating}>
            {isMutating ? t('pages.feedbacks.saving') : t('pages.feedbacks.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.feedbacks.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.feedbacks.deleteConfirm', { name: current?.userDict?.fullName || 'N/A' })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.feedbacks.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('pages.feedbacks.deleting') : t('pages.feedbacks.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!evidencePreview}
        onClose={() => setEvidencePreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('pages.feedbacks.evidencePreviewTitle', { name: evidencePreview?.title || '' })}
        </DialogTitle>
        <DialogContent>
          {evidencePreview?.url && (
            <Box
              component="img"
              src={evidencePreview.url}
              alt={evidencePreview.title}
              sx={{
                display: 'block',
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEvidencePreview(null)} variant="contained">
            {t('pages.feedbacks.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbacksPage;
