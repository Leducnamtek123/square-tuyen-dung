'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dayjs from '@/configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import SavedResumeTable from '../SavedResumeTable';
import { useSavedResumes, useToggleSaveResume } from '../hooks/useEmployerQueries';
import resumeSavedService from '../../../../services/resumeSavedService';
import { useDataTable } from '../../../../hooks';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import type { OnChangeFn, PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';
import { useConfig } from '@/hooks/useConfig';
import {
  useGlobalFilter,
  GlobalFilterBar,
  GlobalFilterDrawer,
  ActiveFilterChips,
  savedResumeFilterConfig,
} from '@/components/Common/Filters';


interface SavedResumeCardProps {
  title: string;
}

const SavedResumeCard: React.FC<SavedResumeCardProps> = ({ title }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

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
    initialPageSize: 10,
  });

  const {
    appliedValues,
    draftValues,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    activeTags,
    handleApply,
    handleReset,
    handleRemoveTag,
  } = useGlobalFilter<Record<string, any>>({
    config: savedResumeFilterConfig,
    allConfig,
    onApply: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
    onReset: () => {
      onPaginationChange({ pageIndex: 0, pageSize });
    },
  });

  const { control, reset, handleSubmit } = useForm<Record<string, any>>({
    defaultValues: draftValues,
  });


  useEffect(() => {
    reset(draftValues);
  }, [draftValues, reset]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      ordering,
      ...appliedValues,
    }),
    [page, pageSize, ordering, appliedValues]
  );

  const { data: queryData, isLoading } = useSavedResumes(queryParams);
  const { toggleSaveResume } = useToggleSaveResume();

  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const handleUnsave = useCallback(
    (slug: string) => {
      confirmModal(
        async () => {
          try {
            await toggleSaveResume(slug);
            toastMessages.success(t('employer:savedResume.messages.unsaveSuccess'));
          } catch (error) {
            // error handling in hook
          }
        },
        t('employer:savedResume.confirmUnsaveTitle'),
        t('employer:savedResume.confirmUnsaveMessage'),
        'warning'
      );
    },
    [toggleSaveResume, t]
  );

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const savedResumeExportColumns: ExportColumn[] = useMemo(
    () => [
      {
        id: 'candidateName',
        label: t('employer:savedResume.columns.candidateName'),
        checked: true,
        getValue: (item: any) =>
          item.resume?.jobSeekerProfile?.fullName ||
          item.resume?.jobSeekerProfile?.user?.fullName ||
          '---',
      },
      {
        id: 'jobTitle',
        label: t('employer:savedResume.columns.jobTitle'),
        checked: true,
        getValue: (item: any) => item.resume?.title || '---',
      },
      {
        id: 'experience',
        label: t('employer:savedResume.columns.experience'),
        checked: true,
        getValue: (item: any) => {
          const exp = item.resume?.experience;
          if (!exp) return t('common:notUpdated');
          if (typeof exp === 'object') return exp.name || t('common:notUpdated');
          return exp;
        },
      },
      {
        id: 'city',
        label: t('employer:savedResume.columns.city'),
        checked: true,
        getValue: (item: any) => {
          const city = item.resume?.city;
          if (!city) return t('common:notUpdated');
          if (typeof city === 'object') return city.name || t('common:notUpdated');
          return city;
        },
      },
      {
        id: 'savedAt',
        label: t('employer:savedResume.columns.savedAt'),
        checked: true,
        getValue: (item: any) =>
          item.createAt ? dayjs(item.createAt).format('DD/MM/YYYY HH:mm') : '---',
      },
    ],
    [t]
  );

  const handleFetchSavedResumesExportData = useCallback(
    async (scope: ExportScope) => {
      if (scope === 'selected') {
        const selectedIndexes = Object.keys(rowSelection).map(Number);
        return selectedIndexes.map((idx) => resumes[idx]).filter(Boolean);
      }
      const res = await resumeSavedService.getResumesSaved({
        page: 1,
        pageSize: scope === 'all' ? 1000 : pageSize,
        ordering,
        ...appliedValues,
      });
      return res?.results || [];
    },
    [rowSelection, resumes, ordering, appliedValues, pageSize]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Header & Filter Bar */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          {/* Primary Golden Standard Filter Bar */}
          <GlobalFilterBar
            control={control}
            handleSubmit={handleSubmit}
            handleSearchSubmit={(data) => handleApply(data)}
            cityOptions={allConfig?.cityOptions || []}
            searchPlaceholder={t('employer:savedResumeFilterForm.placeholder.enterjobpostorcandidatename')}
            cityPlaceholder={t('employer:savedResumeFilterForm.placeholder.selectlocation')}
            onOpenFilterDrawer={() => setDrawerOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          <ActiveFilterChips
            tags={activeTags}
            onRemoveTag={handleRemoveTag}
            onClearAll={handleReset}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('employer:savedResume.subtitle')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={() => setExportModalOpen(true)}
                sx={{
                  px: 4,
                  py: 1,
                  fontWeight: 900,
                  textTransform: 'none',
                }}
              >
                {t('employer:savedResume.downloadList')}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* Global Filter Drawer Standard */}
        <GlobalFilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          config={savedResumeFilterConfig}
          control={control}
          allConfig={allConfig}
          handleReset={handleReset}
          handleSubmit={handleSubmit}
          handleApply={(data) => handleApply(data)}
        />

        {/* Table Content */}
        <Box sx={{ overflow: 'hidden', width: '100%' }}>
          <SavedResumeTable
            variant="flat"
            isLoading={isLoading}
            rows={resumes}
            rowCount={count}
            pagination={pagination}
            onPaginationChange={onPaginationChange as OnChangeFn<PaginationState>}
            sorting={sorting}
            onSortingChange={onSortingChange as OnChangeFn<SortingState>}
            handleUnsave={handleUnsave}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection as OnChangeFn<RowSelectionState>}
          />
        </Box>
      </Paper>

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        columns={savedResumeExportColumns}
        fetchData={handleFetchSavedResumesExportData}
        totalRecords={{
          all: count,
          filtered: count,
          selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
        }}
      />
    </Box>
  );
};

export default SavedResumeCard;
