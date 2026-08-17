'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Avatar,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid2 as Grid,
    IconButton,
    Link,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import DataTable from '../../../components/Common/DataTable';
import TextFieldCustom from '../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../components/Common/Controls/SingleSelectCustom';
import { useConfig } from '@/hooks/useConfig';
import { useDataTable, useDebounce } from '../../../hooks';
import { JobSeekerProfile } from '../../../types/models';
import dayjs from '../../../configs/dayjs-config';
import { ROUTES } from '../../../configs/routeConfig';
import { formatRoute } from '../../../utils/funcUtils';
import adminManagementService, { Vieclam24hSourceOccupation } from '../../../services/adminManagementService';
import type { Vieclam24hImportJob } from '../../../services/adminManagementService';
import { useProfiles } from './hooks/useProfiles';

const IMPORT_JOB_STORAGE_KEY = 'admin-profiles-vieclam24h-import-job-id';

const readPersistedImportJobId = (): number | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.localStorage.getItem(IMPORT_JOB_STORAGE_KEY);
    if (!raw) {
        return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

interface ProfilesFilterValues {
    kw: string;
    cityId: string | number;
    careerId: string | number;
    experienceId: string | number;
    positionId: string | number;
    academicLevelId: string | number;
    typeOfWorkplaceId: string | number;
    jobTypeId: string | number;
    genderId: string | number;
    maritalStatusId: string | number;
}

const DEFAULT_PROFILE_FILTERS: ProfilesFilterValues = {
    kw: '',
    cityId: '',
    careerId: '',
    experienceId: '',
    positionId: '',
    academicLevelId: '',
    typeOfWorkplaceId: '',
    jobTypeId: '',
    genderId: '',
    maritalStatusId: '',
};

const ProfilesPage = () => {
    const { t } = useTranslation('admin');
    const { allConfig } = useConfig();
    const queryClient = useQueryClient();

    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        rowSelection,
        onRowSelectionChange,
        ordering,
        pagination,
        onPaginationChange,
    } = useDataTable({ initialPageSize: 10 });

    const { control, handleSubmit, reset, watch } = useForm<ProfilesFilterValues>({
        defaultValues: DEFAULT_PROFILE_FILTERS,
    });

    const filters = watch();
    const debouncedSearch = useDebounce(filters.kw || '', 500);
    const previousFilterSignature = useRef('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(() => Boolean(readPersistedImportJobId()));
    const [currentProfile, setCurrentProfile] = useState<JobSeekerProfile | null>(null);
    const [importForm, setImportForm] = useState({
        sourceUrl: 'https://ntd.vieclam24h.vn/tim-kiem-ung-vien-nhanh',
        account: '',
        password: '',
        occupationIds: [] as number[],
    });
    const [importJobId, setImportJobId] = useState<number | null>(() => readPersistedImportJobId());
    const [importJob, setImportJob] = useState<Vieclam24hImportJob | null>(null);

    const queryParams = useMemo(
        () => ({
            page: page + 1,
            pageSize,
            ordering,
            kw: debouncedSearch,
            cityId: filters.cityId || undefined,
            careerId: filters.careerId || undefined,
            experienceId: filters.experienceId || undefined,
            positionId: filters.positionId || undefined,
            academicLevelId: filters.academicLevelId || undefined,
            typeOfWorkplaceId: filters.typeOfWorkplaceId || undefined,
            jobTypeId: filters.jobTypeId || undefined,
            genderId: filters.genderId || undefined,
            maritalStatusId: filters.maritalStatusId || undefined,
        }),
        [
            page,
            pageSize,
            ordering,
            debouncedSearch,
            filters.cityId,
            filters.careerId,
            filters.experienceId,
            filters.positionId,
            filters.academicLevelId,
            filters.typeOfWorkplaceId,
            filters.jobTypeId,
            filters.genderId,
            filters.maritalStatusId,
        ]
    );

    const {
        data,
        isLoading,
        deleteProfile,
        bulkDeleteProfiles,
        importCandidates,
        isImporting,
        isMutating,
    } = useProfiles(queryParams);

    const importJobQuery = useQuery({
        queryKey: ['vieclam24h-import-job', importJobId],
        queryFn: () => adminManagementService.getVieclam24hImportJob(importJobId as number),
        enabled: Boolean(importJobId),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === 'pending' || status === 'processing' ? 3000 : false;
        },
    });

    const catalogQuery = useQuery({
        queryKey: ['vieclam24h-catalog', importForm.sourceUrl],
        queryFn: () => adminManagementService.getVieclam24hCatalog({ sourceUrl: importForm.sourceUrl }),
        enabled: openImportDialog,
    });

    const occupationOptions: Vieclam24hSourceOccupation[] = useMemo(() => {
        const occupations = catalogQuery.data?.occupations || [];
        const CORE_KEYWORDS = ['xây dựng', 'thiết kế', 'kiến trúc', 'điện', 'cơ khí'];
        const filtered = occupations.filter((occupation) => {
            const nameLower = (occupation.name || '').toLowerCase();
            return CORE_KEYWORDS.some((kw) => nameLower.includes(kw));
        });

        if (filtered.length === 0) {
            return [
                { id: 31, name: 'Xây dựng', isTop: true, jobFieldIds: [] },
                { id: 4, name: 'Kiến trúc - Thiết kế nội ngoại thất', isTop: true, jobFieldIds: [] },
                { id: 41, name: 'Điện - Điện tử - Điện lạnh', isTop: true, jobFieldIds: [] },
                { id: 47, name: 'Cơ khí - Ô tô - Tự động hóa', isTop: true, jobFieldIds: [] },
            ];
        }

        return filtered
            .map((occupation) => ({
                ...occupation,
                isTop: true,
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }, [catalogQuery.data]);

    useEffect(() => {
        const currentSignature = [
            debouncedSearch,
            filters.cityId,
            filters.careerId,
            filters.experienceId,
            filters.positionId,
            filters.academicLevelId,
            filters.typeOfWorkplaceId,
            filters.jobTypeId,
            filters.genderId,
            filters.maritalStatusId,
        ].join('|');

        if (previousFilterSignature.current === currentSignature) {
            return;
        }

        previousFilterSignature.current = currentSignature;
        onRowSelectionChange({});

        if (page !== 0) {
            onPaginationChange({ pageIndex: 0, pageSize });
        }
    }, [
        debouncedSearch,
        filters.cityId,
        filters.careerId,
        filters.experienceId,
        filters.positionId,
        filters.academicLevelId,
        filters.typeOfWorkplaceId,
        filters.jobTypeId,
        filters.genderId,
        filters.maritalStatusId,
        onPaginationChange,
        onRowSelectionChange,
        page,
        pageSize,
    ]);

    useEffect(() => {
        onRowSelectionChange({});
    }, [ordering, page, pageSize, onRowSelectionChange]);

    const columns = useMemo<ColumnDef<JobSeekerProfile>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
        },
        {
            id: 'candidate',
            header: t('pages.profiles.table.candidate') as string,
            cell: (info) => {
                const profile = info.row.original;
                const user = profile.userDict;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user?.avatarUrl ?? undefined} sx={{ width: 32, height: 32 }}>
                            {user?.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user?.fullName || '-'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {user?.email || '-'}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        {
            accessorKey: 'phone',
            header: t('pages.profiles.table.phone') as string,
            cell: (info) => (info.getValue() as string) || '-',
        },
        {
            accessorKey: 'currentJobTitle',
            header: t('pages.profiles.table.title') as string,
            cell: (info) => (info.getValue() as string) || '-',
        },
        {
            accessorKey: 'createAt',
            header: t('pages.profiles.table.createdAt') as string,
            cell: (info) => (info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '-'),
        },
        {
            id: 'actions',
            header: t('pages.profiles.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => {
                const profile = info.row.original;
                return (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={t('pages.profiles.table.view')}>
                            <IconButton
                                size="small"
                                component={Link}
                                href={formatRoute(ROUTES.ADMIN.PROFILE_DETAIL, String(profile.id), ':id')}
                                color="info"
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('pages.profiles.table.delete')}>
                            <IconButton size="small" onClick={() => handleOpenDelete(profile)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [t]);

    const selectedProfileIds = useMemo(
        () =>
            Object.keys(rowSelection)
                .map((rowIndex) => data?.results?.[Number(rowIndex)]?.id)
                .filter((id): id is number => typeof id === 'number'),
        [data?.results, rowSelection]
    );

    const handleOpenDelete = (profile: JobSeekerProfile) => {
        setCurrentProfile(profile);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleCloseImportDialog = () => {
        setOpenImportDialog(false);
    };

    const handleCloseBulkDeleteDialog = () => {
        setOpenBulkDeleteDialog(false);
    };

    const handleDelete = async () => {
        if (!currentProfile) return;
        try {
            await deleteProfile(currentProfile.id);
            handleCloseDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleImport = async () => {
        try {
            const job = await importCandidates(importForm);
            setImportJobId(job.id);
            setImportJob(job);
            setOpenImportDialog(true);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!importJobQuery.data) return;
        setImportJob(importJobQuery.data);
    }, [importJobQuery.data]);

    useEffect(() => {
        if (!importJob) return;
        if (typeof window !== 'undefined') {
            if (importJob.status === 'pending' || importJob.status === 'processing') {
                window.localStorage.setItem(IMPORT_JOB_STORAGE_KEY, String(importJob.id));
            } else {
                window.localStorage.removeItem(IMPORT_JOB_STORAGE_KEY);
            }
        }
        if (importJob.status === 'completed' || importJob.status === 'failed') {
            queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
        }
    }, [importJob, queryClient]);

    const isImportJobActive = importJob?.status === 'pending' || importJob?.status === 'processing';

    const handleBulkDelete = async () => {
        if (!selectedProfileIds.length) return;
        try {
            await bulkDeleteProfiles(selectedProfileIds);
            onRowSelectionChange({});
            handleCloseBulkDeleteDialog();
        } catch (error) {
            console.error(error);
        }
    };

    const handleResetFilters = () => {
        reset(DEFAULT_PROFILE_FILTERS);
        onRowSelectionChange({});
        if (page !== 0) {
            onPaginationChange({ pageIndex: 0, pageSize });
        }
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.profiles.title', { defaultValue: 'Tổng ứng viên' })}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={isImporting || isImportJobActive ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                    onClick={() => setOpenImportDialog(true)}
                    disabled={isImporting || isImportJobActive}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {t('pages.profiles.import.openButton')}
                </Button>
            </Stack>

            {importJob && (
                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: importJob.status === 'failed' ? 'error.light' : 'primary.light',
                        bgcolor: importJob.status === 'failed' ? 'error.50' : 'primary.50',
                    }}
                    elevation={0}
                >
                    <Stack spacing={1.25}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    {importJob.status === 'completed'
                                        ? t('pages.profiles.import.completedTitle', { defaultValue: 'Đã xong' })
                                        : importJob.status === 'failed'
                                            ? t('pages.profiles.import.failedTitle', { defaultValue: 'Đã lỗi' })
                                            : t('pages.profiles.import.processingTitle', { defaultValue: 'Đang xử lý' })}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {importJob.status === 'completed'
                                        ? t('pages.profiles.import.completedMessage', {
                                              defaultValue: `Đã tạo ${importJob.createdCount} mới, cập nhật ${importJob.updatedCount}, bỏ qua ${importJob.skippedCount}.`,
                                          })
                                        : importJob.status === 'failed'
                                            ? importJob.errorMessage || t('pages.profiles.import.failedMessage', { defaultValue: 'Tác vụ lấy ứng viên đã gặp lỗi.' })
                                            : t('pages.profiles.import.processingMessage', {
                                                  defaultValue: 'Hệ thống đang lấy và chuẩn hóa dữ liệu ứng viên trong nền.',
                                              })}
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: importJob.status === 'failed' ? 'error.main' : 'primary.main' }}>
                                {importJob.progress}%
                            </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={importJob.progress} sx={{ height: 8, borderRadius: 999 }} />
                    </Stack>
                </Paper>
            )}

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Stack spacing={2.25}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box
                                sx={(theme) => ({
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: 'primary.main',
                                    bgcolor: theme.palette.primary.main + '14',
                                })}
                            >
                                <FilterAltIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                    {t('pages.profiles.filter.title', { defaultValue: 'Bộ lọc tổng ứng viên' })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('pages.profiles.filter.helper', {
                                        defaultValue: 'Tìm kiếm, lọc nhanh và chọn nhiều hồ sơ từ một màn hình duy nhất.',
                                    })}
                                </Typography>
                            </Box>
                        </Stack>

                        <Tooltip title={t('common.clearFilters')} arrow>
                            <span>
                                <Button
                                    variant="text"
                                    color="error"
                                    size="small"
                                    onClick={handleResetFilters}
                                    sx={{
                                        minWidth: 44,
                                        height: 44,
                                        p: 0,
                                    }}
                                >
                                    <RefreshIcon sx={{ fontSize: 22 }} />
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>

                    <Box component="form" onSubmit={handleSubmit(() => onPaginationChange({ pageIndex: 0, pageSize }))}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6, lg: 6.5 }}>
                                <TextFieldCustom
                                    name="kw"
                                    placeholder={t('employer:profileSearch.placeholder.enterkeywords')}
                                    control={control}
                                    icon={<SearchIcon sx={{ color: 'primary.main' }} />}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3, lg: 3 }}>
                                <SingleSelectCustom
                                    name="cityId"
                                    control={control}
                                    options={allConfig?.cityOptions || []}
                                    placeholder={t('employer:profileSearch.placeholder.selectcityprovince')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SearchIcon />}
                                    type="submit"
                                    fullWidth
                                    sx={{
                                        height: 42,
                                        boxShadow: (theme) => theme.customShadows?.primary,
                                        fontWeight: 900,
                                        fontSize: '0.98rem',
                                        textTransform: 'none',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {t('employer:profileSearch.label.search')}
                                </Button>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2, borderStyle: 'dashed', opacity: 0.6 }} />

                        <Grid container spacing={2.25}>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="careerId"
                                    control={control}
                                    options={allConfig?.careerOptions || []}
                                    title={t('employer:profileSearch.label.careers')}
                                    placeholder={t('employer:profileSearch.placeholder.allcareers')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="experienceId"
                                    control={control}
                                    options={allConfig?.experienceOptions || []}
                                    title={t('employer:profileSearch.label.experience')}
                                    placeholder={t('employer:profileSearch.placeholder.allexperience')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="positionId"
                                    control={control}
                                    options={allConfig?.positionOptions || []}
                                    title={t('employer:profileSearch.label.position')}
                                    placeholder={t('employer:profileSearch.placeholder.allpositions')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="academicLevelId"
                                    control={control}
                                    options={allConfig?.academicLevelOptions || []}
                                    title={t('employer:profileSearch.label.academicLevel')}
                                    placeholder={t('employer:profileSearch.placeholder.allacademiclevels')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="typeOfWorkplaceId"
                                    control={control}
                                    options={allConfig?.typeOfWorkplaceOptions || []}
                                    title={t('employer:profileSearch.label.workplace')}
                                    placeholder={t('employer:profileSearch.placeholder.allworkplaces')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="jobTypeId"
                                    control={control}
                                    options={allConfig?.jobTypeOptions || []}
                                    title={t('employer:profileSearch.label.employmentType')}
                                    placeholder={t('employer:profileSearch.placeholder.allemploymenttypes')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="genderId"
                                    control={control}
                                    options={allConfig?.genderOptions || []}
                                    title={t('employer:profileSearch.label.gender')}
                                    placeholder={t('employer:profileSearch.placeholder.allgenders')}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                                <SingleSelectCustom
                                    name="maritalStatusId"
                                    control={control}
                                    options={allConfig?.maritalStatusOptions || []}
                                    title={t('employer:profileSearch.label.maritalStatus')}
                                    placeholder={t('employer:profileSearch.placeholder.allmaritalstatuses')}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>
            </Paper>

            {Object.keys(rowSelection).length > 0 && (
                <Box
                    sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Typography variant="subtitle2" color="primary.contrastText">
                        {t('pages.profiles.bulkSelect.selectedCount', {
                            count: Object.keys(rowSelection).length,
                            defaultValue: `Đã chọn ${Object.keys(rowSelection).length} hồ sơ`,
                        })}
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={isMutating || selectedProfileIds.length === 0}
                        onClick={() => setOpenBulkDeleteDialog(true)}
                    >
                        {t('pages.profiles.bulkSelect.deleteBtn', { defaultValue: 'Xóa đã chọn' })}
                    </Button>
                </Box>
            )}

            <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={0}>
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
                    enableRowSelection
                    rowSelection={rowSelection}
                    onRowSelectionChange={onRowSelectionChange}
                />
            </Paper>

            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.profiles.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.profiles.deleteConfirm', { name: currentProfile?.userDict?.fullName })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">
                        {t('pages.profiles.cancel')}
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
                        {isMutating ? t('common.deleting') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openBulkDeleteDialog} onClose={handleCloseBulkDeleteDialog} maxWidth="xs" fullWidth>
                <DialogTitle>{t('pages.profiles.bulkSelect.deleteTitle', { defaultValue: 'Xóa nhiều hồ sơ' })}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.profiles.bulkSelect.deleteConfirm', {
                            count: selectedProfileIds.length,
                            defaultValue: `Bạn có chắc muốn xóa ${selectedProfileIds.length} hồ sơ đã chọn?`,
                        })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseBulkDeleteDialog} color="inherit">
                        {t('pages.profiles.cancel')}
                    </Button>
                    <Button onClick={handleBulkDelete} color="error" variant="contained" disabled={isMutating || !selectedProfileIds.length}>
                        {isMutating ? t('common.deleting') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openImportDialog} onClose={handleCloseImportDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                    {t('pages.profiles.import.dialogTitle', { defaultValue: 'Đồng bộ ứng viên từ Vieclam24h' })}
                </DialogTitle>
                <DialogContent sx={{ pt: 1.5, maxHeight: '78vh' }} dividers>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            label={t('pages.profiles.import.sourceUrlLabel', { defaultValue: 'Source URL' })}
                            placeholder="Nhập URL nguồn tìm kiếm"
                            value={importForm.sourceUrl}
                            onChange={(event) => setImportForm((prev) => ({ ...prev, sourceUrl: event.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label={t('pages.profiles.import.accountLabel', { defaultValue: 'Account' })}
                            placeholder="Nhập email/tên tài khoản NTD"
                            value={importForm.account}
                            onChange={(event) => setImportForm((prev) => ({ ...prev, account: event.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label={t('pages.profiles.import.passwordLabel', { defaultValue: 'Password' })}
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={importForm.password}
                            onChange={(event) => setImportForm((prev) => ({ ...prev, password: event.target.value }))}
                            fullWidth
                        />
                        <Autocomplete
                            multiple
                            options={occupationOptions}
                            loading={catalogQuery.isLoading}
                            disableCloseOnSelect
                            noOptionsText={t('common.noOptions')}
                            loadingText={t('common.loading')}
                            openText={t('common.autocomplete.open')}
                            closeText={t('common.autocomplete.close')}
                            clearText={t('common.autocomplete.clear')}
                            value={occupationOptions.filter((option) => importForm.occupationIds.includes(option.id))}
                            onChange={(_, value) =>
                                setImportForm((prev) => ({
                                    ...prev,
                                    occupationIds: value.map((item) => item.id),
                                }))
                            }
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderOption={(props, option, { selected }) => (
                                <li {...props} key={option.id}>
                                    <Tooltip title={selected ? 'Đã chọn' : 'Chọn'}>
                                        <span>
                                            <input type="checkbox" checked={selected} readOnly style={{ marginRight: 12 }} />
                                        </span>
                                    </Tooltip>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {option.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            #{option.id}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={t('pages.profiles.import.careerLabel', { defaultValue: 'Target industry' })}
                                    placeholder={t('pages.profiles.import.careerPlaceholder', { defaultValue: 'Chọn ngành trọng điểm (Xây dựng, Kiến trúc, Điện, Cơ khí)' })}
                                    fullWidth
                                />
                            )}
                        />
                        {importJob && (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: importJob.status === 'failed' ? 'error.50' : 'primary.50',
                                }}
                            >
                                <Stack spacing={1.25}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                            {importJob.status === 'completed'
                                                ? t('pages.profiles.import.completedTitle', { defaultValue: 'Đã xong' })
                                                : importJob.status === 'failed'
                                                    ? t('pages.profiles.import.failedTitle', { defaultValue: 'Đã lỗi' })
                                                    : t('pages.profiles.import.processingTitle', { defaultValue: 'Đang xử lý' })}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: importJob.status === 'failed' ? 'error.main' : 'primary.main' }}>
                                            {importJob.progress}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={importJob.progress}
                                        sx={{ height: 8, borderRadius: 999 }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {importJob.status === 'failed'
                                            ? importJob.errorMessage || t('pages.profiles.import.failedMessage', { defaultValue: 'Tác vụ lấy ứng viên đã gặp lỗi.' })
                                            : importJob.status === 'completed'
                                                ? t('pages.profiles.import.completedMessage', {
                                                      defaultValue: `Đã tạo ${importJob.createdCount} mới, cập nhật ${importJob.updatedCount}, bỏ qua ${importJob.skippedCount}.`,
                                                  })
                                                : t('pages.profiles.import.processingMessage', {
                                                      defaultValue: 'Hệ thống đang lấy và chuẩn hóa dữ liệu ứng viên trong nền.',
                                                  })}
                                    </Typography>
                                </Stack>
                            </Paper>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseImportDialog} color="inherit">
                        {t('pages.profiles.import.cancel')}
                    </Button>
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        disabled={
                            isImporting ||
                            importJob?.status === 'pending' ||
                            importJob?.status === 'processing' ||
                            !importForm.sourceUrl ||
                            !importForm.account ||
                            !importForm.password ||
                            !importForm.occupationIds.length
                        }
                        startIcon={isImporting || importJob?.status === 'pending' || importJob?.status === 'processing' ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                    >
                        {isImporting || importJob?.status === 'pending' || importJob?.status === 'processing'
                            ? t('pages.profiles.import.importing')
                            : t('pages.profiles.import.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilesPage;
