import React, { useMemo, useReducer } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tooltip,
  IconButton,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useDistricts } from './hooks/useDistricts';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDataTable, useDebounce } from '../../../hooks';
import { District, City } from '../../../types/models';
import type { DistrictPayload } from '../../../services/adminManagementService';

const EMPTY_FORM: Partial<DistrictPayload> = {
  name: '',
  code: '',
  city: undefined,
};

type DialogMode = 'add' | 'edit';

type State = {
  searchTerm: string;
  cityFilter: string | number;
  openDialog: boolean;
  dialogMode: DialogMode;
  currentDistrict: District | null;
  formData: Partial<DistrictPayload>;
  openDeleteDialog: boolean;
};

type Action =
  | { type: 'set_search'; value: string }
  | { type: 'set_city_filter'; value: string | number }
  | { type: 'open_add'; value: Partial<DistrictPayload> }
  | { type: 'open_edit'; district: District; value: Partial<DistrictPayload> }
  | { type: 'open_delete'; district: District }
  | { type: 'close_dialogs' }
  | { type: 'set_form_data'; value: Partial<DistrictPayload> };

const initialState: State = {
  searchTerm: '',
  cityFilter: '',
  openDialog: false,
  dialogMode: 'add',
  currentDistrict: null,
  formData: EMPTY_FORM,
  openDeleteDialog: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_search':
      return { ...state, searchTerm: action.value };
    case 'set_city_filter':
      return { ...state, cityFilter: action.value };
    case 'open_add':
      return { ...state, dialogMode: 'add', formData: action.value, openDialog: true };
    case 'open_edit':
      return { ...state, dialogMode: 'edit', currentDistrict: action.district, formData: action.value, openDialog: true };
    case 'open_delete':
      return { ...state, currentDistrict: action.district, openDeleteDialog: true };
    case 'close_dialogs':
      return { ...state, openDialog: false, openDeleteDialog: false, currentDistrict: null };
    case 'set_form_data':
      return { ...state, formData: action.value };
    default:
      return state;
  }
}

const DistrictsPage = () => {
  const { t } = useTranslation('admin');
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const {
    data,
    isLoading,
    createDistrict,
    updateDistrict,
    deleteDistrict,
    isMutating,
  } = useDistricts({
    page: page + 1,
    pageSize,
    kw: debouncedSearch,
    city: state.cityFilter ? Number(state.cityFilter) : undefined,
    ordering,
  });

  const { data: citiesData } = useCities({ pageSize: 100 });
  const cities = citiesData?.results || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'set_search', value: e.target.value });
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleCityFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'set_city_filter', value: e.target.value });
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleOpenAdd = () => {
    dispatch({
      type: 'open_add',
      value: { name: '', code: '', city: state.cityFilter ? Number(state.cityFilter) : undefined },
    });
  };

  const handleOpenEdit = (district: District) => {
    dispatch({
      type: 'open_edit',
      district,
      value: {
        name: district.name || '',
        code: district.code || '',
        city: district.city ? Number(typeof district.city === 'object' ? district.city?.id : district.city) : undefined,
      },
    });
  };

  const handleOpenDelete = (district: District) => {
    dispatch({ type: 'open_delete', district });
  };

  const handleCloseDialog = () => {
    dispatch({ type: 'close_dialogs' });
  };

  const handleSave = async () => {
    if (!state.formData.name || !state.formData.code || !state.formData.city) return;

    const payload: DistrictPayload = {
      name: state.formData.name,
      code: state.formData.code,
      city: Number(state.formData.city),
    };

    try {
      if (state.dialogMode === 'add') {
        await createDistrict(payload);
      } else if (state.currentDistrict) {
        await updateDistrict({ id: state.currentDistrict.id, data: payload });
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!state.currentDistrict) return;
    try {
      await deleteDistrict(state.currentDistrict.id);
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<District>[]>(() => [
    { accessorKey: 'id', header: 'ID', enableSorting: true },
    {
      accessorKey: 'name',
      header: t('pages.districts.table.name') as string,
      enableSorting: true,
      cell: (info) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{info.getValue() as string}</Typography>,
    },
    { accessorKey: 'code', header: t('pages.districts.table.code') as string, enableSorting: true },
    {
      accessorKey: 'cityDict.name',
      header: t('pages.districts.table.city') as string,
      cell: (info) => info.getValue() as string || '?',
    },
    {
      id: 'actions',
      header: t('pages.districts.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('pages.districts.table.edit')}>
            <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.districts.table.delete')}>
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
            {t('pages.districts.title')}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/admin">{t('pages.districts.breadcrumbAdmin')}</Link>
            <Typography color="text.primary">{t('pages.districts.breadcrumbLocations')}</Typography>
            <Typography color="text.primary">{t('pages.districts.breadcrumbDistricts')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          {t('pages.districts.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder={t('pages.districts.searchPlaceholder')}
            value={state.searchTerm}
            onChange={handleSearch}
            sx={{ width: 300 }}
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
          <TextField
            select
            size="small"
            label={t('pages.districts.filterByCity')}
            value={state.cityFilter}
            onChange={handleCityFilterChange}
            sx={{ width: 220 }}
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            {cities.map((city: City) => <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>)}
          </TextField>
        </Box>

        <DataTable
          columns={columns}
          data={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableSorting
          onSortingChange={onSortingChange}
          sorting={sorting}
        />
      </Paper>

      <Dialog open={state.openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{state.dialogMode === 'add' ? t('pages.districts.add') : t('pages.districts.edit')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <TextField
            label={t('pages.districts.table.name')}
            value={state.formData.name || ''}
            onChange={(e) => dispatch({ type: 'set_form_data', value: { ...state.formData, name: e.target.value } })}
            fullWidth
          />
          <TextField
            label={t('pages.districts.table.code')}
            value={state.formData.code || ''}
            onChange={(e) => dispatch({ type: 'set_form_data', value: { ...state.formData, code: e.target.value } })}
            fullWidth
          />
          <TextField
            select
            label={t('pages.districts.filterByCity')}
            value={state.formData.city || ''}
            onChange={(e) => dispatch({ type: 'set_form_data', value: { ...state.formData, city: e.target.value ? Number(e.target.value) : undefined } })}
            fullWidth
          >
            <MenuItem value="">{t('common.all')}</MenuItem>
            {cities.map((city: City) => <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={isMutating}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t('pages.districts.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('pages.districts.deleteConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isMutating}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DistrictsPage;
