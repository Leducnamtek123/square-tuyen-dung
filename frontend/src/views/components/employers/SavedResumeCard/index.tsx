'use client';
import React, { useState, useMemo, useCallback } from 'react';
import dayjs from '@/configs/dayjs-config';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  Stack, 
  Typography,
  Paper
} from "@mui/material";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import errorHandling from '../../../../utils/errorHandling';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import xlsxUtils from '../../../../utils/xlsxUtils';
import SavedResumeTable from '../SavedResumeTable';
import { useSavedResumes, useToggleSaveResume } from '../hooks/useEmployerQueries';
import resumeSavedService from '../../../../services/resumeSavedService';
import SavedResumeFilterForm from '../SavedResumeFilterForm';
import { useDataTable } from '../../../../hooks';
import toastMessages from '../../../../utils/toastMessages';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { OnChangeFn, PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { SavedResumeFilterValues } from '../SavedResumeFilterForm';
import FilterBar from '@/components/Common/FilterBar';
import { ExportModal, type ExportColumn, type ExportScope } from '@/components/Common/ExportModal';

interface SavedResumeCardProps {
  title: string;
}

const SavedResumeCard: React.FC<SavedResumeCardProps> = ({ title }) => {
  const { t } = useTranslation(['employer', 'common']);

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

  const [filterData, setFilterData] = useState<SavedResumeFilterValues>({
    kw: '',
    salaryMax: '',
    experienceId: '',
    cityId: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryParams = useMemo(() => ({
    page: page + 1,
    pageSize,
    ordering,
    ...filterData,
  }), [page, pageSize, ordering, filterData]);

  const { data: queryData, isLoading } = useSavedResumes(queryParams);
  const { toggleSaveResume, isMutating: isTogglingSave } = useToggleSaveResume();

  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const handleFilter = useCallback((data: Partial<SavedResumeFilterValues>) => {
    setFilterData((prev) => ({
      ...prev,
      ...data,
    }));
    onPaginationChange({ pageIndex: 0, pageSize });
  }, [onPaginationChange, pageSize]);

  const handleUnsave = useCallback((slug: string) => {
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
  }, [toggleSaveResume, t]);

  const [exportModalOpen, setExportModalOpen] = useState(false);

  const savedResumeExportColumns: ExportColumn[] = useMemo(() => [
    {
      id: 'candidateName',
      label: t('employer:savedResume.table.candidateName'),
      checked: true,
      getValue: (row) => row['Họ và tên'] || row.fullName || row.candidateName || '---',
    },
    {
      id: 'jobTitle',
      label: t('employer:savedResume.table.jobTitle'),
      checked: true,
      getValue: (row) => row['Tên hồ sơ'] || row.title || row.jobTitle || '---',
    },
    {
      id: 'savedDate',
      label: t('employer:savedResume.table.savedDate'),
      checked: true,
      getValue: (row) => {
        const val = row['Ngày lưu'] || row.createAt || row.savedDate;
        return val ? dayjs(val).format('DD/MM/YYYY') : '---';
      },
    },
    {
      id: 'phone',
      label: t('employer:savedResume.table.phone'),
      checked: true,
      getValue: (row) => row['Số điện thoại'] || row.phone || '---',
    },
    {
      id: 'email',
      label: t('employer:savedResume.table.email'),
      checked: true,
      getValue: (row) => row.Email || row.email || '---',
    },
  ], [t]);

  const handleFetchSavedResumesExportData = useCallback(async (scope: ExportScope) => {
    const params = scope === 'all' ? {} : queryParams;
    const resData = await resumeSavedService.exportResumesSaved(params);
    const exportList = (resData || []) as Record<string, any>[];
    if (scope === 'selected') {
      const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]);
      if (selectedIds.length === 0) return [];
      const filtered = exportList.filter((item) => {
        const itemId = String(item.id ?? item.ID ?? item.slug ?? '');
        return selectedIds.includes(itemId);
      });
      if (filtered.length > 0) return filtered;
      return resumes.filter((r: any) => selectedIds.includes(String(r.id ?? r.slug)));
    }
    return exportList;
  }, [queryParams, rowSelection, resumes]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2.5, md: 3.5 }, 
          borderRadius: 3, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.customShadows?.z1,
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          justifyContent="space-between" 
          spacing={3} 
          mb={4}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('employer:savedResume.manageSubtitle')}
            </Typography>
          </Box>
          <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FileDownloadOutlinedIcon />} 
              onClick={() => setExportModalOpen(true)} 
              sx={{ 
                px: 4, 
                py: 1.25,
                boxShadow: (theme) => theme.customShadows?.primary, 
                fontWeight: 900,
                textTransform: 'none'
              }}
          >
            {t('employer:savedResume.downloadList')}
          </Button>
        </Stack>

        <FilterBar variant="flat" title={t('employer:savedResume.filters')} sx={{ mb: 4 }}>
          <SavedResumeFilterForm handleFilter={handleFilter} />
        </FilterBar>

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

        <ExportModal
          open={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          defaultFileName="DanhSachHoSoDaLuu"
          columns={savedResumeExportColumns}
          fetchData={handleFetchSavedResumesExportData}
          totalRecords={{
            all: count || 0,
            filtered: count || 0,
            selected: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
          }}
        />

        {(isProcessing || isTogglingSave) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default SavedResumeCard;
