'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  Divider, 
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
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { SavedResumeFilterValues } from '../SavedResumeFilterForm';

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
        t('employer:savedResume.confirmUnsaveTitle', 'Unsave Candidate'),
        t('employer:savedResume.confirmUnsaveMessage', 'Are you sure you want to remove this candidate from your saved list?'),
        'warning'
    );
  }, [toggleSaveResume, t]);

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const resData = await resumeSavedService.exportResumesSaved(queryParams);
      xlsxUtils.exportToXLSX(resData as unknown as Record<string, unknown>[], 'SavedResumesList');
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 4, 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.customShadows?.z1,
          bgcolor: 'background.paper'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          justifyContent="space-between" 
          spacing={3} 
          mb={5}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('employer:savedResume.manageSubtitle', 'Easily access and manage your collection of saved candidate profiles.')}
            </Typography>
          </Box>
          <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FileDownloadOutlinedIcon />} 
              onClick={handleExport} 
              sx={{ 
                borderRadius: 3, 
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

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 5,
            borderRadius: 3,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ 
              p: 0.75, 
              borderRadius: 1.5, 
              bgcolor: 'primary.extralight', 
              color: 'primary.main',
              display: 'flex'
            }}>
              <Box component="span" sx={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 4, height: 14, bgcolor: 'currentColor', borderRadius: 1 }} />
              </Box>
            </Box>
            <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 900, letterSpacing: '0.5px' }}>
                {t('employer:savedResume.filters').toUpperCase()}
            </Typography>
          </Stack>
          <SavedResumeFilterForm handleFilter={handleFilter} />
        </Paper>

        <Box sx={{ overflow: 'hidden', width: '100%' }}>
          <SavedResumeTable
            isLoading={isLoading}
            rows={resumes}
            rowCount={count}
            pagination={pagination}
            onPaginationChange={onPaginationChange as OnChangeFn<PaginationState>}
            sorting={sorting}
            onSortingChange={onSortingChange as OnChangeFn<SortingState>}
            handleUnsave={handleUnsave}
          />
        </Box>

        {(isProcessing || isTogglingSave) && <BackdropLoading />}
      </Paper>
    </Box>
  );
};

export default SavedResumeCard;
