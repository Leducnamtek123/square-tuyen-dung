'use client';

import React, { useMemo, useReducer, useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Stack,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../../components/Common/DataTable';
import { BannerType } from '../../../types/models';
import { useDataTable, useDebounce } from '../../../hooks';
import { useBannerTypes } from './hooks/useBannerTypes';
import FilterBar from '@/components/Common/FilterBar';
import {
  getBannerTypeFormValidationErrors,
  type BannerTypeFormData,
  type BannerTypeFormValidationErrors,
} from './bannerTypeFormValidation';

const defaultForm: BannerTypeFormData = {
  code: '',
  name: '',
  value: 1,
  web_aspect_ratio: '',
  mobile_aspect_ratio: '',
  is_active: true,
};

type BannerTypesDialogState = {
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  current: BannerType | null;
  formData: BannerTypeFormData;
  openDelete: boolean;
};

type BannerTypesDialogAction =
  | { type: 'open-add' }
  | { type: 'open-edit'; item: BannerType }
  | { type: 'open-delete'; item: BannerType }
  | { type: 'close' }
  | {
      type: 'set-field';
      field: keyof BannerTypeFormData;
      value: BannerTypeFormData[keyof BannerTypeFormData];
    };

const defaultDialogState: BannerTypesDialogState = {
  openDialog: false,
  dialogMode: 'add',
  current: null,
  formData: defaultForm,
  openDelete: false,
};

const bannerTypesDialogReducer = (
  state: BannerTypesDialogState,
  action: BannerTypesDialogAction
): BannerTypesDialogState => {
  switch (action.type) {
    case 'open-add':
      return {
        ...defaultDialogState,
        openDialog: true,
      };
    case 'open-edit':
      return {
        ...state,
        openDialog: true,
        dialogMode: 'edit',
        current: action.item,
        formData: {
          code: action.item.code || '',
          name: action.item.name || '',
          value: action.item.value || 1,
          web_aspect_ratio: action.item.webAspectRatio || '',
          mobile_aspect_ratio: action.item.mobileAspectRatio || '',
          is_active: action.item.isActive !== false,
        },
      };
    case 'open-delete':
      return {
        ...state,
        current: action.item,
        openDelete: true,
      };
    case 'close':
      return {
        ...state,
        openDialog: false,
        openDelete: false,
      };
    case 'set-field':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };
    default:
      return state;
  }
};

const BannerTypesPage = () => {
  const { t } = useTranslation('admin');
  const [dialogState, dispatchDialog] = useReducer(bannerTypesDialogReducer, defaultDialogState);
  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { openDialog, dialogMode, current, formData, openDelete } = dialogState;
  const validationErrors = useMemo(
    () => getBannerTypeFormValidationErrors(formData),
    [formData],
  );
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const getValidationText = (field: keyof BannerTypeFormValidationErrors) => (
    validationErrors[field]
      ? t(`pages.bannerTypes.validation.${validationErrors[field]}`)
      : undefined
  );

  const {
    data,
    isLoading,
    createBannerType,
    updateBannerType,
    deleteBannerType,
    isMutating,
  } = useBannerTypes({
    page: page + 1,
    pageSize,
    kw: debouncedSearch,
    ordering,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleOpenAdd = () => {
    dispatchDialog({ type: 'open-add' });
  };

  const handleOpenEdit = (item: BannerType) => {
    dispatchDialog({ type: 'open-edit', item });
  };

  const handleClose = () => {
    dispatchDialog({ type: 'close' });
  };

  const handleSave = async () => {
    if (hasValidationErrors) return;
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      web_aspect_ratio: formData.web_aspect_ratio.trim(),
      mobile_aspect_ratio: formData.mobile_aspect_ratio.trim(),
    };
    try {
      if (dialogMode === 'add') {
        await createBannerType(payload);
      } else if (current) {
        await updateBannerType({ id: current.id, data: payload });
      }
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      await deleteBannerType(current.id);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRequest = (item: BannerType) => {
    dispatchDialog({ type: 'open-delete', item });
  };

  const columns = useMemo<ColumnDef<BannerType>[]>(() => [
    { accessorKey: 'id', header: t('pages.bannerTypes.table.id'), enableSorting: true },
    { accessorKey: 'code', header: t('pages.bannerTypes.table.code'), enableSorting: true },
    { accessorKey: 'name', header: t('pages.bannerTypes.table.name'), enableSorting: true },
    { accessorKey: 'value', header: t('pages.bannerTypes.table.value'), enableSorting: true },
    {
      id: 'web_aspect_ratio',
      accessorFn: (row) => row.webAspectRatio,
      header: t('pages.bannerTypes.table.webAspectRatio'),
      cell: (info) => (info.getValue() as string) || '-',
    },
    {
      id: 'is_active',
      accessorFn: (row) => row.isActive,
      header: t('pages.bannerTypes.table.status'),
      cell: (info) => (
        <Chip
          size="small"
          label={info.getValue() ? t('common.active') : t('common.inactive')}
          color={info.getValue() ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton size="small" color="error" onClick={() => handleDeleteRequest(info.row.original)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('pages.bannerTypes.title')}</Typography>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" href="/admin">{t('pages.bannerTypes.breadcrumbAdmin')}</Link>
            <Typography color="text.primary">{t('pages.bannerTypes.breadcrumbList')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          {t('pages.bannerTypes.addButton')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <FilterBar
          title={t('pages.bannerTypes.filter.title')}
          searchValue={searchTerm}
          searchPlaceholder={t('pages.bannerTypes.searchPlaceholder')}
          onSearchChange={handleSearch}
          onReset={() => handleSearch('')}
          resetDisabled={!searchTerm}
          resetLabel={t('common.clearFilters')}
        />

        <DataTable
          columns={columns}
          data={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>
          {dialogMode === 'add' ? t('pages.bannerTypes.addTitle') : t('pages.bannerTypes.editTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('pages.bannerTypes.fields.code')}
              value={formData.code}
              onChange={(e) => dispatchDialog({ type: 'set-field', field: 'code', value: e.target.value })}
              error={Boolean(validationErrors.code)}
              helperText={getValidationText('code')}
              required
            />
            <TextField
              label={t('pages.bannerTypes.fields.name')}
              value={formData.name}
              onChange={(e) => dispatchDialog({ type: 'set-field', field: 'name', value: e.target.value })}
              error={Boolean(validationErrors.name)}
              helperText={getValidationText('name')}
              required
            />
            <TextField
              label={t('pages.bannerTypes.fields.value')}
              type="number"
              value={formData.value}
              onChange={(e) => dispatchDialog({ type: 'set-field', field: 'value', value: e.target.value === '' ? 0 : Number(e.target.value) })}
              error={Boolean(validationErrors.value)}
              helperText={getValidationText('value')}
              required
            />
            <TextField
              label={t('pages.bannerTypes.fields.webAspectRatio')}
              value={formData.web_aspect_ratio}
              onChange={(e) => dispatchDialog({ type: 'set-field', field: 'web_aspect_ratio', value: e.target.value })}
              error={Boolean(validationErrors.web_aspect_ratio)}
              helperText={getValidationText('web_aspect_ratio')}
            />
            <TextField
              label={t('pages.bannerTypes.fields.mobileAspectRatio')}
              value={formData.mobile_aspect_ratio}
              onChange={(e) => dispatchDialog({ type: 'set-field', field: 'mobile_aspect_ratio', value: e.target.value })}
              error={Boolean(validationErrors.mobile_aspect_ratio)}
              helperText={getValidationText('mobile_aspect_ratio')}
            />
            <FormControlLabel
              control={<Switch checked={formData.is_active} onChange={(e) => dispatchDialog({ type: 'set-field', field: 'is_active', value: e.target.checked })} />}
              label={t('pages.bannerTypes.fields.isActive')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">{t('common.cancel')}</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isMutating || hasValidationErrors}
          >
            {isMutating ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={handleClose}>
        <DialogTitle>{t('pages.bannerTypes.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('pages.bannerTypes.deleteConfirm', { name: current?.name || '' })}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">{t('common.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannerTypesPage;
