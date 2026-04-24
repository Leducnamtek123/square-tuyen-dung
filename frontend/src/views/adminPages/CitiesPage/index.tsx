'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useCities } from './hooks/useCities';
import { useDataTable, useDebounce } from '../../../hooks';
import { City } from '../../../types/models';
import type { CityPayload } from '../../../services/adminManagementService';

type CitiesState = {
  searchTerm: string;
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentCity: City | null;
  formData: CityPayload;
  openDeleteDialog: boolean;
};

type CitiesAction =
  | { type: 'search'; value: string }
  | { type: 'open-add' }
  | { type: 'open-edit'; city: City }
  | { type: 'open-delete'; city: City }
  | { type: 'close-dialogs' }
  | { type: 'set-form'; value: CityPayload }
  | { type: 'update-form'; value: Partial<CityPayload> };

const initialState: CitiesState = {
  searchTerm: '',
  openDialog: false,
  dialogMode: 'add',
  currentCity: null,
  formData: { name: '', code: '' },
  openDeleteDialog: false,
};

function reducer(state: CitiesState, action: CitiesAction): CitiesState {
  switch (action.type) {
    case 'search':
      return { ...state, searchTerm: action.value };
    case 'open-add':
      return { ...state, dialogMode: 'add', formData: { name: '', code: '' }, currentCity: null, openDialog: true };
    case 'open-edit':
      return {
        ...state,
        dialogMode: 'edit',
        currentCity: action.city,
        formData: { name: action.city.name || '', code: action.city.code || '' },
        openDialog: true,
      };
    case 'open-delete':
      return { ...state, currentCity: action.city, openDeleteDialog: true };
    case 'close-dialogs':
      return { ...state, openDialog: false, openDeleteDialog: false };
    case 'set-form':
      return { ...state, formData: action.value };
    case 'update-form':
      return { ...state, formData: { ...state.formData, ...action.value } };
    default:
      return state;
  }
}

const CitiesPage = () => {
  const { t } = useTranslation('admin');
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const debouncedSearch = useDebounce(state.searchTerm, 500);

  const { data, isLoading, createCity, updateCity, deleteCity, isMutating } = useCities({
    page: page + 1,
    pageSize,
    kw: debouncedSearch,
    ordering,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'search', value: e.target.value });
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleSave = async () => {
    try {
      if (state.dialogMode === 'add') {
        await createCity(state.formData);
      } else if (state.currentCity) {
        await updateCity({ id: state.currentCity.id, data: state.formData });
      }
      dispatch({ type: 'close-dialogs' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!state.currentCity) return;
    try {
      await deleteCity(state.currentCity.id);
      dispatch({ type: 'close-dialogs' });
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<City>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', enableSorting: true },
      {
        accessorKey: 'name',
        header: t('pages.cities.table.name') as string,
        enableSorting: true,
        cell: (info) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{info.getValue() as string}</Typography>,
      },
      { accessorKey: 'code', header: t('pages.cities.table.code') as string, enableSorting: true },
      {
        id: 'actions',
        header: t('pages.cities.table.actions') as string,
        meta: { align: 'right' },
        cell: (info) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title={t('pages.cities.table.edit')}>
              <IconButton size="small" onClick={() => dispatch({ type: 'open-edit', city: info.row.original })} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('pages.cities.table.delete')}>
              <IconButton size="small" onClick={() => dispatch({ type: 'open-delete', city: info.row.original })} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [t]
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {t('pages.cities.title')}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/admin">
              {t('pages.cities.breadcrumbAdmin')}
            </Link>
            <Typography color="text.primary">{t('pages.cities.breadcrumbLocations')}</Typography>
            <Typography color="text.primary">{t('pages.cities.breadcrumbCities')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => dispatch({ type: 'open-add' })}>
          {t('pages.cities.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder={t('pages.cities.searchPlaceholder')}
            value={state.searchTerm}
            onChange={handleSearch}
            sx={{ width: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

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

      <Dialog open={state.openDialog} onClose={() => dispatch({ type: 'close-dialogs' })} fullWidth maxWidth="xs">
        <DialogTitle>{state.dialogMode === 'add' ? t('pages.cities.add') : t('pages.cities.edit')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label={t('pages.cities.form.name')}
              fullWidth
              value={state.formData.name}
              onChange={(e) => dispatch({ type: 'update-form', value: { name: e.target.value } })}
              required
            />
            <TextField
              label={t('pages.cities.form.code')}
              fullWidth
              value={state.formData.code}
              onChange={(e) => dispatch({ type: 'update-form', value: { code: e.target.value } })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => dispatch({ type: 'close-dialogs' })} color="inherit">
            {t('pages.cities.cancel')}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isMutating || !state.formData.name || !state.formData.code}>
            {isMutating ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.openDeleteDialog} onClose={() => dispatch({ type: 'close-dialogs' })}>
        <DialogTitle>{t('pages.cities.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('pages.cities.deleteConfirm', { name: state.currentCity?.name })}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => dispatch({ type: 'close-dialogs' })} color="inherit">
            {t('pages.cities.cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
            {isMutating ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesPage;
