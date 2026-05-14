'use client';

import React from 'react';
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
  MenuItem,
  Tooltip,
  IconButton,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import DataTable from '../../../components/Common/DataTable';
import { useWards } from './hooks/useWards';
import { useDistricts } from '../DistrictsPage/hooks/useDistricts';
import { useCities } from '../CitiesPage/hooks/useCities';
import { useDataTable, useDebounce } from '../../../hooks';
import type { Ward, District, City } from '../../../types/models';
import type { WardPayload } from '../../../services/adminManagementService';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';
import type { SxProps, Theme } from '@mui/material/styles';

type WardFormData = Partial<WardPayload>;
const cityFilterSx = [{ width: { xs: '100%', sm: 220 } }, filterControlSx] as SxProps<Theme>;
const districtFilterSx = [{ width: { xs: '100%', sm: 260 } }, filterControlSx] as SxProps<Theme>;

type UiState = {
  searchTerm: string;
  cityFilter: string | number;
  districtFilter: string | number;
  openDialog: boolean;
  dialogMode: 'add' | 'edit';
  currentWard: Ward | null;
  formData: WardFormData;
  openDeleteDialog: boolean;
};

type UiAction =
  | { type: 'set_search_term'; payload: string }
  | { type: 'set_city_filter'; payload: string | number }
  | { type: 'set_district_filter'; payload: string | number }
  | { type: 'open_add'; payload: WardFormData }
  | { type: 'open_edit'; payload: { ward: Ward; formData: WardFormData } }
  | { type: 'open_delete'; payload: Ward }
  | { type: 'close_dialogs' }
  | { type: 'set_form_data'; payload: WardFormData };

const initialState: UiState = {
  searchTerm: '',
  cityFilter: '',
  districtFilter: '',
  openDialog: false,
  dialogMode: 'add',
  currentWard: null,
  formData: {
    name: '',
    code: '',
    district: undefined,
  },
  openDeleteDialog: false,
};

const reducer = (state: UiState, action: UiAction): UiState => {
  switch (action.type) {
    case 'set_search_term':
      return { ...state, searchTerm: action.payload };
    case 'set_city_filter':
      return { ...state, cityFilter: action.payload, districtFilter: '' };
    case 'set_district_filter':
      return { ...state, districtFilter: action.payload };
    case 'open_add':
      return {
        ...state,
        dialogMode: 'add',
        formData: action.payload,
        currentWard: null,
        openDialog: true,
        openDeleteDialog: false,
      };
    case 'open_edit':
      return {
        ...state,
        dialogMode: 'edit',
        currentWard: action.payload.ward,
        formData: action.payload.formData,
        openDialog: true,
        openDeleteDialog: false,
      };
    case 'open_delete':
      return {
        ...state,
        currentWard: action.payload,
        openDeleteDialog: true,
        openDialog: false,
      };
    case 'close_dialogs':
      return { ...state, openDialog: false, openDeleteDialog: false, currentWard: null };
    case 'set_form_data':
      return { ...state, formData: action.payload };
    default:
      return state;
  }
};

const WardFilters = ({
  t,
  searchTerm,
  cityFilter,
  districtFilter,
  cities,
  districts,
  onSearchChange,
  onCityChange,
  onDistrictChange,
}: {
  t: ReturnType<typeof useTranslation>['t'];
  searchTerm: string;
  cityFilter: string | number;
  districtFilter: string | number;
  cities: City[];
  districts: District[];
  onSearchChange: (value: string) => void;
  onCityChange: (value: string | number) => void;
  onDistrictChange: (value: string | number) => void;
}) => (
  <FilterBar
    title={t('pages.wards.filter.title', 'Bộ lọc phường/xã')}
    searchValue={searchTerm}
    searchPlaceholder={t('pages.wards.searchPlaceholder')}
    onSearchChange={onSearchChange}
    activeFilterCount={[cityFilter, districtFilter].filter(Boolean).length}
    onReset={() => {
      onSearchChange('');
      onCityChange('');
      onDistrictChange('');
    }}
    resetDisabled={!searchTerm && !cityFilter && !districtFilter}
    resetLabel={t('common.clearFilters', 'Xóa lọc')}
    advancedLabel={t('common.advancedFilters', 'Bộ lọc nâng cao')}
    advancedDefaultOpen={Boolean(cityFilter || districtFilter)}
    advancedFilters={(
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <TextField
        select
        size="small"
        label={t('pages.wards.filterByCity')}
        value={cityFilter}
        onChange={(e) => onCityChange(e.target.value)}
        sx={cityFilterSx}
      >
        <MenuItem value="">{t('common.all')}</MenuItem>
        {cities.map((city) => (
          <MenuItem key={city.id} value={city.id}>
            {city.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label={t('pages.wards.filterByDistrict')}
        value={districtFilter}
        onChange={(e) => onDistrictChange(e.target.value)}
        sx={districtFilterSx}
        disabled={!cityFilter}
      >
        <MenuItem value="">{t('common.all')}</MenuItem>
        {districts.map((district) => (
          <MenuItem key={district.id} value={district.id}>
            {district.name}
          </MenuItem>
        ))}
      </TextField>
      </Stack>
    )}
  />
);

const WardDialogs = ({
  t,
  dialogMode,
  openDialog,
  openDeleteDialog,
  currentWard,
  formData,
  districts,
  isMutating,
  onClose,
  onSave,
  onDelete,
  onFormDataChange,
}: {
  t: ReturnType<typeof useTranslation>['t'];
  dialogMode: 'add' | 'edit';
  openDialog: boolean;
  openDeleteDialog: boolean;
  currentWard: Ward | null;
  formData: WardFormData;
  districts: District[];
  isMutating: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormDataChange: (next: WardFormData) => void;
}) => (
  <>
    <Dialog open={openDialog} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{dialogMode === 'add' ? t('pages.wards.add') : t('pages.wards.edit')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            label={t('pages.wards.form.district')}
            fullWidth
            value={formData.district || ''}
            onChange={(e) => onFormDataChange({ ...formData, district: Number(e.target.value) })}
            required
          >
            {districts.map((district) => (
              <MenuItem key={district.id} value={district.id}>
                {district.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('pages.wards.form.name')}
            fullWidth
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            label={t('pages.wards.form.code')}
            fullWidth
            value={formData.code}
            onChange={(e) => onFormDataChange({ ...formData, code: e.target.value })}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('pages.wards.cancel')}
        </Button>
        <Button onClick={onSave} variant="contained" disabled={isMutating || !formData.name || !formData.code || !formData.district}>
          {isMutating ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={openDeleteDialog} onClose={onClose}>
      <DialogTitle>{t('pages.wards.deleteTitle')}</DialogTitle>
      <DialogContent>
        <Typography>{t('pages.wards.deleteConfirm', { name: currentWard?.name })}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('pages.wards.cancel')}
        </Button>
        <Button onClick={onDelete} color="error" variant="contained" disabled={isMutating}>
          {isMutating ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  </>
);

const WardsPage = () => {
  const { t } = useTranslation('admin');
  const [uiState, dispatch] = React.useReducer(reducer, initialState);

  const { page, pageSize, sorting, onSortingChange, ordering, pagination, onPaginationChange } = useDataTable({ initialPageSize: 10 });

  const debouncedSearch = useDebounce(uiState.searchTerm, 500);

  const { data, isLoading, createWard, updateWard, deleteWard, isMutating } = useWards({
    page: page + 1,
    pageSize,
    kw: debouncedSearch,
    district: uiState.districtFilter ? Number(uiState.districtFilter) : undefined,
    ordering,
  });

  const { data: citiesData } = useCities({ pageSize: 100 });
  const { data: districtsData } = useDistricts({
    pageSize: 500,
    city: uiState.cityFilter ? Number(uiState.cityFilter) : undefined,
  });

  const cities = citiesData?.results || [];
  const districts = districtsData?.results || [];

  const handleOpenAdd = () => {
    dispatch({
      type: 'open_add',
      payload: {
        name: '',
        code: '',
        district: uiState.districtFilter ? Number(uiState.districtFilter) : undefined,
      },
    });
  };

  const handleOpenEdit = (ward: Ward) => {
    dispatch({
      type: 'open_edit',
      payload: {
        ward,
        formData: {
          name: ward.name || '',
          code: ward.code || '',
          district: typeof ward.district === 'object' ? (ward.district as District)?.id : ward.district,
        },
      },
    });
  };

  const handleOpenDelete = (ward: Ward) => {
    dispatch({ type: 'open_delete', payload: ward });
  };

  const handleCloseDialog = () => {
    dispatch({ type: 'close_dialogs' });
  };

  const handleSave = async () => {
    if (!uiState.formData.name || !uiState.formData.code || !uiState.formData.district) return;

    const payload: WardPayload = {
      name: uiState.formData.name,
      code: uiState.formData.code,
      district: Number(uiState.formData.district),
    };

    try {
      if (uiState.dialogMode === 'add') {
        await createWard(payload);
      } else if (uiState.currentWard) {
        await updateWard({ id: uiState.currentWard.id, data: payload });
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!uiState.currentWard) return;
    try {
      await deleteWard(uiState.currentWard.id);
      handleCloseDialog();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = React.useMemo<ColumnDef<Ward>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: true,
      },
      {
        accessorKey: 'name',
        header: t('pages.wards.table.name') as string,
        enableSorting: true,
        cell: (info) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: 'code',
        header: t('pages.wards.table.code') as string,
        enableSorting: true,
      },
      {
        accessorKey: 'districtDict.name',
        header: t('pages.wards.table.district') as string,
        cell: (info) => (info.getValue() as string) || '—',
      },
      {
        accessorKey: 'districtDict.cityDict.name',
        header: t('pages.wards.table.city') as string,
        cell: (info) => (info.getValue() as string) || '—',
      },
      {
        id: 'actions',
        header: t('pages.wards.table.actions') as string,
        meta: { align: 'right' },
        cell: (info) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title={t('pages.wards.table.edit')}>
              <IconButton size="small" onClick={() => handleOpenEdit(info.row.original)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('pages.wards.table.delete')}>
              <IconButton size="small" onClick={() => handleOpenDelete(info.row.original)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [t],
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {t('pages.wards.title')}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/admin">
              {t('pages.wards.breadcrumbAdmin')}
            </Link>
            <Typography color="text.primary">{t('pages.wards.breadcrumbLocations')}</Typography>
            <Typography color="text.primary">{t('pages.wards.breadcrumbWards')}</Typography>
          </Breadcrumbs>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
          {t('pages.wards.add')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <WardFilters
          t={t}
          searchTerm={uiState.searchTerm}
          cityFilter={uiState.cityFilter}
          districtFilter={uiState.districtFilter}
          cities={cities}
          districts={districts}
          onSearchChange={(value) => {
            dispatch({ type: 'set_search_term', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          onCityChange={(value) => {
            dispatch({ type: 'set_city_filter', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
          onDistrictChange={(value) => {
            dispatch({ type: 'set_district_filter', payload: value });
            onPaginationChange({ pageIndex: 0, pageSize });
          }}
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

      <WardDialogs
        t={t}
        dialogMode={uiState.dialogMode}
        openDialog={uiState.openDialog}
        openDeleteDialog={uiState.openDeleteDialog}
        currentWard={uiState.currentWard}
        formData={uiState.formData}
        districts={districts}
        isMutating={isMutating}
        onClose={handleCloseDialog}
        onSave={handleSave}
        onDelete={handleDelete}
        onFormDataChange={(next) => dispatch({ type: 'set_form_data', payload: next })}
      />
    </Box>
  );
};

export default WardsPage;
