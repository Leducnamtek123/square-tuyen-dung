'use client';

import React, { useMemo, useReducer } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, IconButton, Stack } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useCareers } from './hooks/useCareers';
import { useDataTable, useDebounce } from '../../../hooks';
import { Career } from '../../../types/models';
import type { CareerPayload } from '../../../services/adminManagementService';

type CareersPageState = {
  searchTerm: string;
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentCareer: Career | null;
  formData: CareerPayload;
  openDeleteDialog: boolean;
};

type CareersPageAction =
  | { type: 'set_search_term'; value: string }
  | { type: 'open_add' }
  | { type: 'open_edit'; career: Career }
  | { type: 'open_delete'; career: Career }
  | { type: 'close_dialogs' }
  | { type: 'set_form_name'; value: string };

const initialState: CareersPageState = {
  searchTerm: '',
  openDialog: false,
  dialogMode: 'add',
  currentCareer: null,
  formData: { name: '' },
  openDeleteDialog: false,
};

const reducer = (state: CareersPageState, action: CareersPageAction): CareersPageState => {
  switch (action.type) {
    case 'set_search_term':
      return { ...state, searchTerm: action.value };
    case 'open_add':
      return {
        ...state,
        dialogMode: 'add',
        currentCareer: null,
        formData: { name: '' },
        openDialog: true,
        openDeleteDialog: false,
      };
    case 'open_edit':
      return {
        ...state,
        dialogMode: 'edit',
        currentCareer: action.career,
        formData: { name: action.career.name || '' },
        openDialog: true,
      };
    case 'open_delete':
      return {
        ...state,
        currentCareer: action.career,
        openDeleteDialog: true,
      };
    case 'close_dialogs':
      return {
        ...state,
        openDialog: false,
        openDeleteDialog: false,
      };
    case 'set_form_name':
      return {
        ...state,
        formData: { ...state.formData, name: action.value },
      };
    default:
      return state;
  }
};

const CareersPage = () => {
  const { t } = useTranslation('admin');

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const [state, dispatch] = useReducer(reducer, initialState);
  const debouncedSearch = useDebounce(state.searchTerm, 500);

  const {
    data,
    isLoading,
    createCareer,
    updateCareer,
    deleteCareer,
    isMutating,
  } = useCareers({
    page: page + 1,
    pageSize,
    kw: debouncedSearch,
    ordering,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'set_search_term', value: e.target.value });
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleOpenAdd = () => dispatch({ type: 'open_add' });
  const handleOpenEdit = (career: Career) => dispatch({ type: 'open_edit', career });
  const handleOpenDelete = (career: Career) => dispatch({ type: 'open_delete', career });
  const handleCloseDialog = () => dispatch({ type: 'close_dialogs' });

  const handleSave = async () => {
    try {
      if (state.dialogMode === 'add') {
        await createCareer(state.formData);
      } else if (state.currentCareer) {
        await updateCareer({
          id: state.currentCareer.id,
          data: state.formData,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!state.currentCareer) return;
    try {
      await deleteCareer(state.currentCareer.id);
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<Career>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
    },
    {
      accessorKey: 'name',
      header: t('pages.careers.table.name') as string,
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {info.getValue() as string}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: t('pages.careers.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('pages.careers.table.edit')}>
            <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.careers.table.delete')}>
            <IconButton size="small" onClick={() => handleOpenDelete(info.row.original)} color="error">
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
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {t('pages.careers.title')}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/admin">
              {t('pages.careers.breadcrumbAdmin')}
            </Link>
            <Typography color="text.primary">{t('pages.careers.breadcrumbResources')}</Typography>
            <Typography color="text.primary">{t('pages.careers.breadcrumbCareers')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          {t('pages.careers.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder={t('pages.careers.searchPlaceholder')}
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
              }
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

      <Dialog open={state.openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>
          {state.dialogMode === 'add' ? t('pages.careers.add') : t('pages.careers.edit')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label={t('pages.careers.form.name')}
              fullWidth
              value={state.formData.name}
              onChange={(e) => dispatch({ type: 'set_form_name', value: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">{t('pages.careers.cancel')}</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isMutating || !state.formData.name}
          >
            {isMutating ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t('pages.careers.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.careers.deleteConfirm', { name: state.currentCareer?.name })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">{t('pages.careers.cancel')}</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isMutating}
          >
            {isMutating ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CareersPage;
