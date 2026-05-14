'use client';

import React, { useCallback, useMemo, useReducer } from 'react';
import { Box, Paper, Button, Typography, Avatar, Chip, Tooltip, IconButton, Breadcrumbs, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { useCompanies } from './hooks/useCompanies';
import type { Company } from '../../../types/models';
import type { AdminCompanyPayload } from './hooks/useCompanies';
import CompanyFormDialog from './CompanyFormDialog';
import CompanyDeleteDialog from './CompanyDeleteDialog';
import { createEmptyCompanyFormData, type CompanyFormData } from './types';
import FilterBar from '@/components/Common/FilterBar';

type CompanyPageState = {
  dialogOpen: boolean;
  dialogMode: 'add' | 'edit';
  currentCompany: Company | null;
  formData: CompanyFormData;
  logoPreview: string;
  openDeleteDialog: boolean;
};

type CompanyPageAction =
  | { type: 'open_add' }
  | { type: 'open_edit'; company: Company }
  | { type: 'close_form' }
  | { type: 'open_delete'; company: Company }
  | { type: 'close_delete' }
  | { type: 'set_field'; name: string; value: string }
  | { type: 'set_location_field'; name: keyof CompanyFormData['location']; value: string };

const initialState: CompanyPageState = {
  dialogOpen: false,
  dialogMode: 'add',
  currentCompany: null,
  formData: createEmptyCompanyFormData(),
  logoPreview: '',
  openDeleteDialog: false,
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const mapCompanyToFormData = (company: Company): CompanyFormData => ({
  ...createEmptyCompanyFormData(),
  companyName: company.companyName || '',
  taxCode: company.taxCode || '',
  companyEmail: company.companyEmail || '',
  companyPhone: company.companyPhone || '',
  employeeSize: company.employeeSize || 0,
  fieldOperation: company.fieldOperation || '',
  websiteUrl: company.websiteUrl || '',
  description: company.description || '',
  since: company.since || '',
  location: {
    city: toNumberOrNull(company.location?.city),
    district: toNumberOrNull(company.location?.district),
    ward: null,
    address: company.location?.address || '',
    lat: toNumberOrNull(company.location?.lat),
    lng: toNumberOrNull(company.location?.lng),
  },
});

function reducer(state: CompanyPageState, action: CompanyPageAction): CompanyPageState {
  switch (action.type) {
    case 'open_add':
      return {
        ...state,
        dialogOpen: true,
        dialogMode: 'add',
        currentCompany: null,
        formData: createEmptyCompanyFormData(),
        logoPreview: '',
      };
    case 'open_edit':
      return {
        ...state,
        dialogOpen: true,
        dialogMode: 'edit',
        currentCompany: action.company,
        formData: mapCompanyToFormData(action.company),
        logoPreview: action.company.companyImageUrl || '',
      };
    case 'close_form':
      return { ...state, dialogOpen: false };
    case 'open_delete':
      return { ...state, currentCompany: action.company, openDeleteDialog: true };
    case 'close_delete':
      return { ...state, openDeleteDialog: false };
    case 'set_field':
      return {
        ...state,
        formData:
          action.name === 'employeeSize'
            ? { ...state.formData, employeeSize: Number(action.value) }
            : { ...state.formData, [action.name]: action.value },
      };
    case 'set_location_field':
      return {
        ...state,
        formData: {
          ...state.formData,
          location: {
            ...state.formData.location,
            [action.name]:
              action.name === 'address' ? action.value : toNumberOrNull(action.value),
          },
        },
      };
    default:
      return state;
  }
}

const CompaniesPage = () => {
  const { t } = useTranslation('admin');
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
  } = useDataTable({ initialPageSize: 10 });

  const { data, isLoading, createCompany, updateCompany, deleteCompany, isMutating } = useCompanies({
    page: page + 1,
    pageSize,
    kw: debouncedSearchTerm,
    ordering,
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSearch = (value: string) => {
    onSearchChange(value);
  };

  const handleOpenAdd = useCallback(() => {
    dispatch({ type: 'open_add' });
  }, []);

  const handleOpenEdit = useCallback((company: Company) => {
    dispatch({ type: 'open_edit', company });
  }, []);

  const handleOpenDelete = useCallback((company: Company) => {
    dispatch({ type: 'open_delete', company });
  }, []);

  const handleSave = useCallback(async () => {
    const payload: AdminCompanyPayload = {
      companyName: state.formData.companyName.trim(),
      taxCode: state.formData.taxCode.trim(),
      companyEmail: state.formData.companyEmail.trim(),
      companyPhone: state.formData.companyPhone.trim(),
      employeeSize: Number(state.formData.employeeSize),
      fieldOperation: state.formData.fieldOperation.trim(),
      websiteUrl: state.formData.websiteUrl?.trim() || null,
      description: state.formData.description?.trim() || null,
      since: state.formData.since || null,
      location: {
        city: toNumberOrNull(state.formData.location.city),
        district: toNumberOrNull(state.formData.location.district),
        ward: toNumberOrNull(state.formData.location.ward),
        address: state.formData.location.address.trim(),
        lat: toNumberOrNull(state.formData.location.lat),
        lng: toNumberOrNull(state.formData.location.lng),
      },
    };

    try {
      if (state.dialogMode === 'add') {
        await createCompany(payload);
      } else if (state.currentCompany) {
        await updateCompany({ id: state.currentCompany.id, data: payload });
      }
      dispatch({ type: 'close_form' });
    } catch (error) {
      console.error(error);
    }
  }, [createCompany, state.currentCompany, state.dialogMode, state.formData, updateCompany]);

  const handleDelete = useCallback(async () => {
    if (!state.currentCompany) return;
    try {
      await deleteCompany(state.currentCompany.id);
      dispatch({ type: 'close_delete' });
    } catch (error) {
      console.error(error);
    }
  }, [deleteCompany, state.currentCompany]);

  const columns = useMemo<ColumnDef<Company>[]>(() => [
    {
      accessorKey: 'companyImageUrl',
      header: t('pages.companies.table.logo'),
      cell: (info) => (
        <Avatar
          src={(info.getValue() as string) || ''}
          variant="rounded"
          sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
        />
      ),
    },
    {
      accessorKey: 'companyName',
      header: t('pages.companies.table.companyName'),
      enableSorting: true,
      cell: (info) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {info.getValue() as string}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {info.row.original.taxCode || '---'}
          </Typography>
        </Box>
      ),
    },
    { accessorKey: 'employeeSize', header: t('pages.companies.table.scale'), enableSorting: true, cell: (info) => (info.getValue() as number | string) || '---' },
    { accessorKey: 'fieldOperation', header: t('pages.companies.table.field'), enableSorting: true, cell: (info) => (info.getValue() as string) || '---' },
    { accessorKey: 'locationDict.city', header: t('pages.companies.table.location'), cell: (info) => (info.getValue() as string) || '---' },
    { accessorKey: 'jobPostNumber', header: t('pages.companies.table.jobPosts'), meta: { align: 'center' }, cell: (info) => <Chip label={String((info.getValue() as number) || 0)} size="small" variant="outlined" /> },
    { accessorKey: 'followNumber', header: t('pages.companies.table.followers'), meta: { align: 'center' }, cell: (info) => <Chip label={String((info.getValue() as number) || 0)} size="small" /> },
    {
      id: 'actions',
      header: t('pages.companies.table.actions'),
      meta: { align: 'right' },
      cell: (info) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title={t('pages.companies.table.viewDetails')}>
            <IconButton size="small" component="a" href={`/companies/${info.row.original.slug}`} target="_blank">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.companies.table.edit')}>
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(info.row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('pages.companies.table.delete')}>
            <IconButton size="small" color="error" onClick={() => handleOpenDelete(info.row.original)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [handleOpenDelete, handleOpenEdit, t]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {t('pages.companies.title')}
          </Typography>
          <Breadcrumbs>
            <Link underline="hover" color="inherit" href="/admin">{t('pages.companies.breadcrumbAdmin')}</Link>
            <Typography color="text.primary">{t('pages.companies.breadcrumbList')}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} sx={{ textTransform: 'none' }}>
          {t('pages.companies.addCompany')}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
        <FilterBar
          title={t('pages.companies.filter.title', 'Bộ lọc công ty')}
          searchValue={searchTerm}
          searchPlaceholder={t('pages.companies.searchPlaceholder')}
          onSearchChange={handleSearch}
          onReset={() => handleSearch('')}
          resetDisabled={!searchTerm}
          resetLabel={t('common.clearFilters', 'Xóa lọc')}
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

      <CompanyFormDialog
        open={state.dialogOpen}
        mode={state.dialogMode}
        formData={state.formData}
        logoPreview={state.logoPreview}
        isMutating={isMutating}
        t={t}
        onClose={() => dispatch({ type: 'close_form' })}
        onSave={handleSave}
        onFieldChange={(name, value) => dispatch({ type: 'set_field', name, value })}
        onLocationChange={(name, value) => dispatch({ type: 'set_location_field', name, value })}
      />

      <CompanyDeleteDialog
        open={state.openDeleteDialog}
        company={state.currentCompany}
        loading={isMutating}
        t={t}
        onClose={() => dispatch({ type: 'close_delete' })}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default CompaniesPage;
