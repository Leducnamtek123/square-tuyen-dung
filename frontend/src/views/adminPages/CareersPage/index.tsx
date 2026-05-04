'use client';

import React, { useReducer, useRef } from 'react';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable, useDebounce } from '../../../hooks';
import { Career } from '../../../types/models';
import type { CareerPayload } from '../../../services/adminManagementService';
import { useCareers } from './hooks/useCareers';

type CareersPageState = {
  searchTerm: string;
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentCareer: Career | null;
  formData: CareerPayload;
  openDeleteDialog: boolean;
  iconFile: File | null;
  iconPreview: string | null;
  existingIconUrl: string | null;
};

type CareersPageAction =
  | { type: 'set_search_term'; value: string }
  | { type: 'open_add' }
  | { type: 'open_edit'; career: Career }
  | { type: 'open_delete'; career: Career }
  | { type: 'close_dialogs' }
  | { type: 'set_form_name'; value: string }
  | { type: 'set_icon_file'; file: File | null; preview: string | null }
  | { type: 'clear_icon_file' };

const initialState: CareersPageState = {
  searchTerm: '',
  openDialog: false,
  dialogMode: 'add',
  currentCareer: null,
  formData: { name: '' },
  openDeleteDialog: false,
  iconFile: null,
  iconPreview: null,
  existingIconUrl: null,
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
        iconFile: null,
        iconPreview: null,
        existingIconUrl: null,
      };
    case 'open_edit':
      return {
        ...state,
        dialogMode: 'edit',
        currentCareer: action.career,
        formData: { name: action.career.name || '' },
        openDialog: true,
        openDeleteDialog: false,
        iconFile: null,
        iconPreview: action.career.iconUrl || null,
        existingIconUrl: action.career.iconUrl || null,
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
        currentCareer: null,
        iconFile: null,
        iconPreview: null,
        existingIconUrl: null,
      };
    case 'set_form_name':
      return {
        ...state,
        formData: { ...state.formData, name: action.value },
      };
    case 'set_icon_file':
      return {
        ...state,
        iconFile: action.file,
        iconPreview: action.preview,
      };
    case 'clear_icon_file':
      return {
        ...state,
        iconFile: null,
        iconPreview: state.existingIconUrl,
      };
    default:
      return state;
  }
};

const CareersPage = () => {
  const { t } = useTranslation('admin');
  const iconInputRef = useRef<HTMLInputElement>(null);

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

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = typeof event.target?.result === 'string' ? event.target.result : null;
      dispatch({ type: 'set_icon_file', file, preview });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearIcon = () => {
    dispatch({ type: 'clear_icon_file' });
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const name = state.formData.name.trim();
    if (!name) {
      return;
    }

    const payload = new FormData();
    payload.append('name', name);
    if (state.iconFile) {
      payload.append('iconFile', state.iconFile);
    }

    try {
      if (state.dialogMode === 'add') {
        await createCareer(payload);
      } else if (state.currentCareer) {
        await updateCareer({
          id: state.currentCareer.id,
          data: payload,
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

  const columns: ColumnDef<Career>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
    },
    {
      id: 'icon',
      header: t('pages.careers.table.symbol') as string,
      enableSorting: false,
      cell: (info) => {
        const iconUrl = info.row.original.iconUrl || '';
        return (
          <Avatar
            src={iconUrl || undefined}
            alt={info.row.original.name}
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'grey.100',
              color: 'text.secondary',
            }}
          >
            <ImageIcon fontSize="small" />
          </Avatar>
        );
      },
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
      id: 'hot',
      header: t('pages.careers.keyCareerLabel') as string,
      enableSorting: false,
      cell: (info) => {
        const isHot = Boolean(info.row.original.isHot);
        return isHot ? (
          <Chip
            size="small"
            color="primary"
            label={t('pages.careers.keyCareerBadge')}
            sx={{ fontWeight: 700 }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
    },
    {
      accessorKey: 'jobPostTotal',
      header: t('pages.careers.table.totalPosts') as string,
      enableSorting: true,
      cell: (info) => (
        <Typography variant="body2" color="text.secondary">
          {Number(info.getValue() || 0)}
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
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
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
            sx={{ width: 400, maxWidth: '100%' }}
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

      <Dialog open={state.openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {state.dialogMode === 'add' ? t('pages.careers.add') : t('pages.careers.edit')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label={t('pages.careers.form.name')}
              fullWidth
              value={state.formData.name}
              onChange={(e) => dispatch({ type: 'set_form_name', value: e.target.value })}
              required
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                {t('pages.careers.iconLabel')}
              </Typography>

              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleIconChange}
              />

              {state.iconPreview ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={state.iconPreview}
                      alt={state.formData.name}
                      variant="rounded"
                      sx={{ width: 72, height: 72, bgcolor: 'grey.100' }}
                    >
                      <ImageIcon />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {t('pages.careers.uploadIconBtn')}
                      </Typography>
                      <FormHelperText sx={{ m: 0 }}>
                        {state.iconFile
                          ? state.iconFile.name
                          : state.existingIconUrl
                            ? t('pages.careers.existingIconHint')
                            : t('pages.careers.noIconSelected')}
                      </FormHelperText>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => iconInputRef.current?.click()}>
                          {t('pages.careers.uploadIconBtn')}
                        </Button>
                        {state.iconFile && (
                          <Button color="inherit" onClick={handleClearIcon}>
                            {t('pages.careers.cancelBtn')}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.background', color: 'primary.main' }}>
                      <ImageIcon />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {t('pages.careers.noIconSelected')}
                    </Typography>
                    <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => iconInputRef.current?.click()}>
                      {t('pages.careers.uploadIconBtn')}
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            {t('pages.careers.cancelBtn')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isMutating || !state.formData.name.trim()}
          >
            {isMutating ? t('pages.careers.savingBtn') : t('pages.careers.saveBtn')}
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
          <Button onClick={handleCloseDialog} color="inherit">
            {t('pages.careers.cancelBtn')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isMutating}
          >
            {isMutating ? t('pages.careers.deletingBtn') : t('pages.careers.deleteBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CareersPage;
