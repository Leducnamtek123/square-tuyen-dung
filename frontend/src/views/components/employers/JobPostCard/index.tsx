'use client';
import React, { useMemo, useCallback, useReducer } from 'react';
import dayjs from '@/configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Stack, Typography, Paper, type Theme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '../../../../utils/editorUtils';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import JobPostForm from '../JobPostForm';
import type { JobPostFormValues } from '../JobPostForm/JobPostSchema';
import jobService from '../../../../services/jobService';
import JobPostsTable from '../JobPostsTable';
import { useDataTable } from '../../../../hooks';
import { useCompanyProfile, useEmployerJobPosts, useJobPostMutations } from '../hooks/useEmployerQueries';
import type { JobPostInput } from '../../../../services/jobService';
import type { RowSelectionState } from '@tanstack/react-table';
import { useConfig } from '@/hooks/useConfig';
import { useForm } from 'react-hook-form';
import {
  GlobalFilterBar,
  ActiveFilterChips,
  GlobalFilterDrawer,
  jobPostFilterConfig,
  useGlobalFilter,
} from '@/components/Common/Filters';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';
import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import AiCandidateRecommendationModal from '../AiCandidateRecommendationModal';

type JobPostEditData = Partial<JobPostFormValues> & { id?: string | number; slug?: string };

const getSelectId = (
  value: number | string | { id?: number | string | null } | null | undefined,
) => (value && typeof value === 'object' ? value.id ?? '' : value ?? '');

const toNullableNumber = (value: number | string | null | undefined) => (
  value === undefined || value === null || value === '' ? null : Number(value)
);

type JobPostCardState = {
  openPopup: boolean;
  editData: JobPostEditData | null;
  serverErrors: Record<string, string[]> | null;
  isProcessing: boolean;
};

type JobPostCardAction =
  | { type: 'openAdd' }
  | { type: 'openEdit'; value: JobPostEditData }
  | { type: 'closePopup' }
  | { type: 'setErrors'; value: Record<string, string[]> | null }
  | { type: 'setProcessing'; value: boolean };

const initialState: JobPostCardState = {
  openPopup: false,
  editData: null,
  serverErrors: null,
  isProcessing: false,
};

function reducer(state: JobPostCardState, action: JobPostCardAction): JobPostCardState {
  switch (action.type) {
    case 'openAdd':
      return { ...state, openPopup: true, editData: null, serverErrors: null };
    case 'openEdit':
      return { ...state, openPopup: true, editData: action.value };
    case 'closePopup':
      return { ...state, openPopup: false };
    case 'setErrors':
      return { ...state, serverErrors: action.value };
    case 'setProcessing':
      return { ...state, isProcessing: action.value };
    default:
      return state;
  }
}

const JobPostCard = () => {
  const { t, i18n } = useTranslation('employer');
  const { allConfig } = useConfig();
  const verificationHref = localizeRoutePath(`/${ROUTES.EMPLOYER.VERIFICATION}`, i18n.language);
  const [aiModalOpen, setAiModalOpen] = React.useState(false);
  const [selectedAiJob, setSelectedAiJob] = React.useState<any>(null);

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ 
    initialSorting: [{ id: 'createAt', desc: true }],
    initialPageSize: 10
  });

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const filter = useGlobalFilter({
    config: jobPostFilterConfig,
    allConfig,
    onApply: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
    onReset: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
  });

  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: filter.appliedValues,
  });

  // Sync react-hook-form when filter values change externally (e.g. URL param or chip removal)
  React.useEffect(() => {
    reset(filter.appliedValues);
  }, [filter.appliedValues, reset]);

  const activeUrgentVal = useMemo(() => {
    const raw = filter.appliedValues.isUrgent;
    if (raw === 'true' || raw === true || raw === 1 || raw === '1') return true;
    if (raw === 'false' || raw === false || raw === 2 || raw === '2') return false;
    return undefined;
  }, [filter.appliedValues.isUrgent]);

  // Data Fetching & Mutations
  const { data, isLoading } = useEmployerJobPosts({
    page: page + 1,
    pageSize,
    ordering,
    kw: filter.appliedValues.kw || undefined,
    isUrgent: activeUrgentVal,
    status: filter.appliedValues.statusId === '' ? undefined : filter.appliedValues.statusId,
  });

  const { addJobPost, updateJobPost, deleteJobPost, isMutating } = useJobPostMutations();
  const { data: companyProfile } = useCompanyProfile();
  const isCompanyVerified = Boolean(companyProfile?.isVerified);
  const isCreateBlocked = Boolean(companyProfile) && !isCompanyVerified;

  const handleShowUpdate = useCallback(async (slugOrId: string | number) => {
    dispatch({ type: 'setProcessing', value: true });
    try {
      const resData = await jobService.getEmployerJobPostDetailById(slugOrId);
      const data: JobPostEditData = {
        ...resData,
        career: getSelectId(resData.career),
        position: resData.position ?? '',
        experience: resData.experience ?? '',
        typeOfWorkplace: resData.typeOfWorkplace ?? '',
        jobType: resData.jobType ?? '',
        academicLevel: resData.academicLevel ?? '',
        genderRequired: resData.genderRequired ?? '',
        jobDescription: createEditorStateFromHTMLString(resData.jobDescription || ''),
        jobRequirement: createEditorStateFromHTMLString(resData.jobRequirement || ''),
        benefitsEnjoyed: createEditorStateFromHTMLString(resData.benefitsEnjoyed || ''),
        location: {
          city: getSelectId(resData.location?.city),
          district: getSelectId(resData.location?.district),
          address: resData.location?.address || '',
          lat: resData.location?.lat ?? '',
          lng: resData.location?.lng ?? '',
        },
      };
      dispatch({ type: 'openEdit', value: data });
    } catch (error) {
      errorHandling(error);
    } finally {
      dispatch({ type: 'setProcessing', value: false });
    }
  }, []);

  const handleShowAdd = useCallback(() => {
    if (isCreateBlocked) return;
    dispatch({ type: 'openAdd' });
  }, [isCreateBlocked]);

  const handleAddOrUpdate = async (formData: JobPostFormValues) => {
    dispatch({ type: 'setErrors', value: null });
    const editLookup = state.editData?.slug ?? state.editData?.id;
    const payload: JobPostInput = {
      jobName: formData.jobName || '',
      deadline: formData.deadline ? (typeof formData.deadline === 'string' ? formData.deadline : (formData.deadline as any).toISOString()) : '',
      quantity: Number(formData.quantity),
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      isHot: formData.isHot,
      isUrgent: formData.isUrgent,
      career: Number(formData.career),
      position: Number(formData.position),
      experience: Number(formData.experience),
      academicLevel: Number(formData.academicLevel),
      jobType: Number(formData.jobType),
      interviewTemplate: formData.interviewTemplate ? Number(formData.interviewTemplate) : null,
      typeOfWorkplace: Number(formData.typeOfWorkplace),
      genderRequired: formData.genderRequired,
      jobDescription: convertEditorStateToHTMLString(formData.jobDescription as ReturnType<typeof createEditorStateFromHTMLString>),
      jobRequirement: convertEditorStateToHTMLString(formData.jobRequirement as ReturnType<typeof createEditorStateFromHTMLString>),
      benefitsEnjoyed: convertEditorStateToHTMLString(formData.benefitsEnjoyed as ReturnType<typeof createEditorStateFromHTMLString>),
      contactPersonName: formData.contactPersonName,
      contactPersonPhone: formData.contactPersonPhone,
      contactPersonEmail: formData.contactPersonEmail,
      location: {
        city: Number(formData.location.city),
        district: Number(formData.location.district),
        address: formData.location.address,
        lat: toNullableNumber(formData.location.lat),
        lng: toNullableNumber(formData.location.lng),
      },
    };

    try {
      if (editLookup != null) {
        await updateJobPost({ id: editLookup, data: payload });
        toastMessages.success(t('jobPost.messages.updateSuccess'));
      } else {
        await addJobPost(payload);
        toastMessages.success(t('jobPost.messages.addSuccess'));
      }
      dispatch({ type: 'closePopup' });
    } catch (error) {
      errorHandling(error, (errs) => dispatch({ type: 'setErrors', value: errs as Record<string, string[]> }));
    }
  };

  const handleDelete = useCallback((slugOrId: string | number) => {
    confirmModal(
      async () => {
        try {
          await deleteJobPost(slugOrId);
          toastMessages.success(t('jobPost.delete.success'));
        } catch (error) {
          // Error handled by mutation hook
        }
      },
      t('jobPost.delete.title'),
      t('jobPost.delete.confirm'),
      'warning'
    );
  }, [deleteJobPost, t]);

  const [exportModalOpen, setExportModalOpen] = React.useState(false);

  const jobPostExportColumns: ExportColumn[] = React.useMemo(() => [
    {
      id: 'title',
      label: t('jobPost.table.title'),
      checked: true,
      getValue: (row) => row['Chức Danh'] || row.jobName || row.title || '---',
    },
    {
      id: 'createdDate',
      label: t('jobPost.table.createdDate'),
      checked: true,
      getValue: (row) => {
        const val = row['Ngày Đăng'] || row.createAt || row.createdDate;
        return val ? dayjs(val).format('DD/MM/YYYY') : '---';
      },
    },
    {
      id: 'deadline',
      label: t('jobPost.table.deadline'),
      checked: true,
      getValue: (row) => {
        const val = row['Ngày Hết Hạn'] || row.deadline;
        return val ? dayjs(val).format('DD/MM/YYYY') : '---';
      },
    },
    {
      id: 'status',
      label: t('jobPost.table.status'),
      checked: true,
      getValue: (row) => row['Trạng thái'] || row.status || '---',
    },
    {
      id: 'applicationsCount',
      label: t('jobPost.table.applications'),
      checked: true,
      getValue: (row) => (row['Số Hồ Sơ Ứng Tuyển'] != null ? String(row['Số Hồ Sơ Ứng Tuyển']) : row.appliedNumber != null ? String(row.appliedNumber) : row.applicationsCount != null ? String(row.applicationsCount) : '0'),
    },
    {
      id: 'creator',
      label: t('jobPost.table.creator'),
      checked: true,
      getValue: (row) => row['Người tạo'] || row.creator || '---',
    },
  ], [t]);

  const handleFetchJobPostsExportData = useCallback(async (scope: ExportScope) => {
    const params = {
      page: 1,
      pageSize: scope === 'all' ? 1000 : pageSize,
      ordering,
      kw: scope === 'all' ? undefined : (filter.appliedValues.kw || undefined),
      isUrgent: scope === 'all' ? undefined : activeUrgentVal,
      status: scope === 'all' ? undefined : (filter.appliedValues.statusId === '' ? undefined : filter.appliedValues.statusId),
    };
    const resData = await jobService.exportEmployerJobPosts(params);
    const exportList = (resData || []) as Record<string, any>[];
    if (scope === 'selected') {
      const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
      if (selectedIds.length === 0) return [];
      const filtered = exportList.filter((item) => {
        const itemId = String(item.id ?? item.ID ?? item['Mã Việc Làm'] ?? item.slug ?? '');
        return selectedIds.includes(itemId);
      });
      if (filtered.length > 0) return filtered;
      const currentList = data?.results || [];
      return currentList.filter((item: any) => selectedIds.includes(String(item.id ?? item.slug)));
    }
    return exportList;
  }, [pageSize, ordering, filter.appliedValues, activeUrgentVal, rowSelection, data?.results]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2.5, md: 3.5 }, 
          borderRadius: 3, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme: Theme) => theme.customShadows?.z1,
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          justifyContent="space-between" 
          spacing={3} 
          mb={3}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: 'primary.extralight', 
              color: 'primary.main',
              display: 'flex'
            }}>
              <WorkOutlineIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}>
                {t('jobPost.title')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t('jobPost.manageSubtitle')}
              </Typography>
            </Box>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" width={{ xs: '100%', sm: 'auto' }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<FileDownloadOutlinedIcon />} 
              onClick={() => setExportModalOpen(true)} 
              sx={{ 
                px: 3, 
                py: 1, 
                fontWeight: 800, 
                textTransform: 'none',
                borderStyle: 'dashed'
              }}
            >
              {t('jobPost.exportList')}
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={handleShowAdd} 
              disabled={isCreateBlocked}
              sx={{ 
                px: 4, 
                py: 1.25, 
                boxShadow: (theme: Theme) => theme.customShadows?.primary, 
                fontWeight: 900,
                textTransform: 'none'
              }}
            >
              {t('jobPost.createNew')}
            </Button>
          </Stack>
        </Stack>

        {/* Unified Global Filter Bar */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <GlobalFilterBar
            control={control}
            handleSubmit={handleSubmit}
            handleSearchSubmit={(data) => {
              filter.handleApply(data);
            }}
            primaryFieldName="statusId"
            primaryFieldOptions={allConfig?.jobPostStatusOptions || []}
            primaryFieldPlaceholder={t('jobPost.filters.statusPlaceholder')}
            searchPlaceholder={t('jobPost.filters.keywordsPlaceholder')}
            onOpenFilterDrawer={() => filter.setDrawerOpen(true)}
            activeFilterCount={filter.activeFilterCount}
          />

          <ActiveFilterChips
            tags={filter.activeTags}
            onRemoveTag={(key) => {
              reset({ ...filter.appliedValues, [key]: '' });
              filter.handleRemoveTag(key);
            }}
            onClearAll={() => {
              reset(jobPostFilterConfig.defaultValues);
              filter.handleReset();
            }}
          />
        </Stack>

        {isCreateBlocked ? (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" href={verificationHref}>
                {t('jobPost.verificationRequired.action')}
              </Button>
            }
          >
            {t('jobPost.verificationRequired.message')}
          </Alert>
        ) : null}

        {/* Global Filter Drawer */}
        <GlobalFilterDrawer
          open={filter.drawerOpen}
          onClose={() => filter.setDrawerOpen(false)}
          config={jobPostFilterConfig}
          control={control}
          allConfig={allConfig}
          handleReset={() => {
            reset(jobPostFilterConfig.defaultValues);
            filter.handleReset();
            filter.setDrawerOpen(false);
          }}
          handleSubmit={handleSubmit}
          handleApply={(data) => {
            filter.handleApply(data);
          }}
        />

        <JobPostsTable
          variant="flat"
          rows={data?.results || []}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          handleDelete={handleDelete}
          handleUpdate={handleShowUpdate}
          onOpenAiRecommendation={(job) => {
            setSelectedAiJob(job);
            setAiModalOpen(true);
          }}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />

        <AiCandidateRecommendationModal
          open={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          jobPost={selectedAiJob}
        />

        <FormPopup
          title={t('jobPost.popupTitle')}
          openPopup={state.openPopup}
          setOpenPopup={(open) => dispatch({ type: open ? 'openAdd' : 'closePopup' })}
        >
          <JobPostForm handleAddOrUpdate={handleAddOrUpdate} editData={state.editData} serverErrors={state.serverErrors} />
        </FormPopup>

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          defaultFileName="DanhSachTinTuyenDung"
          columns={jobPostExportColumns}
          fetchData={handleFetchJobPostsExportData}
          totalRecords={{
            all: data?.count || 0,
            filtered: data?.count || 0,
            selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
          }}
        />

        {(state.isProcessing || isMutating) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default JobPostCard;
