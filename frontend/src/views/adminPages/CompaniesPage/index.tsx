'use client';

import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { Box, Paper, Button, Typography, Avatar, Chip, Tooltip, IconButton, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ColumnDef } from '@tanstack/react-table';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '@/components/Common/DataTable';
import { useDataTable } from '@/hooks';
import { useCompanies } from './hooks/useCompanies';
import type { Company } from '@/types/models';
import type { AdminCompanyPayload } from './hooks/useCompanies';
import CompanyFormDialog from './CompanyFormDialog';
import CompanyDeleteDialog from './CompanyDeleteDialog';
import { createEmptyCompanyFormData, type CompanyFormData } from './types';
import FilterBar from '@/components/Common/FilterBar';
import AdminDetailDrawer from '@/components/Common/AdminDetailDrawer';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';
import { ROUTES } from '@/configs/routeConfig';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';

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
  const { t, i18n } = useTranslation('admin');
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
  const [inspectingCompany, setInspectingCompany] = useState<Company | null>(null);

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
      if (inspectingCompany?.id === state.currentCompany.id) {
        setInspectingCompany(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [deleteCompany, inspectingCompany?.id, state.currentCompany]);

  const columns = useMemo<ColumnDef<Company>[]>(() => [
    {
      accessorKey: 'companyImageUrl',
      header: t('pages.companies.table.logo'),
      cell: (info) => (
        <Avatar
          src={(info.getValue() as string) || ''}
          variant="rounded"
          sx={{ width: 44, height: 44, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}
        />
      ),
    },
    {
      accessorKey: 'companyName',
      header: t('pages.companies.table.companyName'),
      enableSorting: true,
      cell: (info) => (
        <Box>
          <Typography
            variant="subtitle2"
            onClick={() => setInspectingCompany(info.row.original)}
            sx={{ fontWeight: 700, color: '#1E293B', cursor: 'pointer', '&:hover': { color: '#2563EB', textDecoration: 'underline' } }}
          >
            {info.getValue() as string}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            MST: {info.row.original.taxCode || 'Chưa cung cấp'}
          </Typography>
        </Box>
      ),
    },
    { accessorKey: 'employeeSize', header: t('pages.companies.table.scale'), enableSorting: true, cell: (info) => (info.getValue() as number | string) || '---' },
    { accessorKey: 'fieldOperation', header: t('pages.companies.table.field'), enableSorting: true, cell: (info) => (info.getValue() as string) || '---' },
    { accessorKey: 'locationDict.city', header: t('pages.companies.table.location'), cell: (info) => (info.getValue() as string) || '---' },
    { accessorKey: 'jobPostNumber', header: t('pages.companies.table.jobPosts'), meta: { align: 'center' }, cell: (info) => <Chip label={String((info.getValue() as number) || 0)} size="small" variant="outlined" sx={{ height: 22, fontWeight: 700 }} /> },
    { accessorKey: 'followNumber', header: t('pages.companies.table.followers'), meta: { align: 'center' }, cell: (info) => <Chip label={String((info.getValue() as number) || 0)} size="small" sx={{ height: 22, fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }} /> },
    {
      id: 'actions',
      header: t('pages.companies.table.actions'),
      meta: { align: 'right' },
      cell: (info) => {
        const company = info.row.original;

        return (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
            <Tooltip title={t('pages.companies.table.viewDetails')}>
              <IconButton aria-label="Xem chi tiết" size="small" onClick={() => setInspectingCompany(company)} sx={{ color: '#64748B' }}>
                <VisibilityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('pages.companies.table.edit')}>
              <IconButton aria-label="Thao tác" size="small" color="primary" onClick={() => handleOpenEdit(company)}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('pages.companies.table.delete')}>
              <IconButton aria-label="Thao tác" size="small" color="error" onClick={() => handleOpenDelete(company)}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [handleOpenDelete, handleOpenEdit, t]);

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' }, lineHeight: 1.2 }}>
            {t('pages.companies.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Quản lý hồ sơ công ty, quy mô nhân sự, mã số thuế và thông tin liên hệ của các nhà tuyển dụng.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 2.5 }}
        >
          {t('pages.companies.addCompany')}
        </Button>
      </Box>

      {/* Main Table Container */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
        <FilterBar
          title={t('pages.companies.filter.title')}
          searchValue={searchTerm}
          searchPlaceholder={t('pages.companies.searchPlaceholder')}
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

      {/* Detail Drawer */}
      <AdminDetailDrawer
        open={Boolean(inspectingCompany)}
        onClose={() => setInspectingCompany(null)}
        title={inspectingCompany?.companyName || 'Hồ sơ doanh nghiệp'}
        subtitle={`Mã doanh nghiệp: #${inspectingCompany?.id}`}
        footerAction={
          inspectingCompany && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  handleOpenEdit(inspectingCompany);
                  setInspectingCompany(null);
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Chỉnh sửa thông tin
              </Button>
              {inspectingCompany.slug && (
                <Button
                  size="small"
                  variant="outlined"
                  href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, inspectingCompany.slug)}`, i18n.language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Xem trang công khai
                </Button>
              )}
            </Stack>
          )
        }
      >
        {inspectingCompany && (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Avatar
                src={inspectingCompany.companyImageUrl || ''}
                variant="rounded"
                sx={{ width: 56, height: 56, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {inspectingCompany.companyName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  MST: {inspectingCompany.taxCode || 'Chưa cung cấp'}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                Thông tin liên hệ & Pháp lý
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Stack spacing={1.25}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Email:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingCompany.companyEmail || 'Chưa cung cấp'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Số điện thoại:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingCompany.companyPhone || 'Chưa cung cấp'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Quy mô nhân sự:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingCompany.employeeSize ? `${inspectingCompany.employeeSize} nhân viên` : 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Lĩnh vực hoạt động:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingCompany.fieldOperation || 'Chưa cập nhật'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>Website:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>
                      {getSafeExternalOpenUrl(inspectingCompany.websiteUrl) ? (
                        <a href={getSafeExternalOpenUrl(inspectingCompany.websiteUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {inspectingCompany.websiteUrl}
                        </a>
                      ) : (
                        inspectingCompany.websiteUrl || 'Chưa cung cấp'
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Stack>
        )}
      </AdminDetailDrawer>

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
