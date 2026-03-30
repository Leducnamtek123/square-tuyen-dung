import React, { useState, useMemo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper, TextField, InputAdornment, Tooltip, IconButton, Stack, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useProfiles } from './hooks/useProfiles';
import { useDataTable } from '../../../hooks';
import { JobSeekerProfile } from '../../../types/models';
import dayjs from '../../../configs/dayjs-config';

const ProfilesPage = () => {
    const { t } = useTranslation('admin');
    
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange
    } = useDataTable({ initialPageSize: 10 });

    const [searchTerm, setSearchTerm] = useState('');

    const {
        data,
        isLoading,
        deleteProfile,
        isMutating
    } = useProfiles({
        page: page + 1,
        pageSize,
        kw: searchTerm,
        ordering
    });

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<JobSeekerProfile | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        onPaginationChange({ pageIndex: 0, pageSize: pageSize });
    };

    const handleOpenDelete = (profile: JobSeekerProfile) => {
        setCurrentProfile(profile);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
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
                const user = (profile as any).userDict;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user?.avatarUrl} sx={{ width: 32, height: 32 }}>
                            {user?.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {user?.fullName || '—'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {user?.email || '—'}
                            </Typography>
                        </Box>
                    </Box>
                );
            },
        },
        {
            accessorKey: 'phone',
            header: t('pages.profiles.table.phone') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            accessorKey: 'currentJobTitle',
            header: t('pages.profiles.table.title') as string,
            cell: (info) => info.getValue() as string || '—',
        },
        {
            accessorKey: 'createAt',
            header: t('pages.profiles.table.createdAt') as string,
            cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY') : '—',
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
                             <IconButton size="small" component={Link} href={`/profiles/${profile.id}`} target="_blank" color="info">
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

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                        {t('pages.profiles.title')}
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/admin">
                            {t('pages.profiles.breadcrumbAdmin')}
                        </Link>
                        <Typography color="text.primary">{t('pages.profiles.breadcrumbResources')}</Typography>
                        <Typography color="text.primary">{t('pages.profiles.breadcrumbProfiles')}</Typography>
                    </Breadcrumbs>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder={t('pages.profiles.searchPlaceholder')}
                        value={searchTerm}
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

            {/* Delete Confirmation */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>{t('pages.profiles.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('pages.profiles.deleteConfirm', { name: (currentProfile as any)?.userDict?.fullName })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">{t('pages.profiles.cancel')}</Button>
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

export default ProfilesPage;
