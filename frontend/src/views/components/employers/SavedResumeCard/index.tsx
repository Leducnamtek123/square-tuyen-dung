import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, LinearProgress, Stack, Typography } from "@mui/material";
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
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';

interface SavedResumeCardProps {
  title: string;
}

interface SavedResumeFilterFormProps {
  handleFilter: (data: any) => void;
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

  const [filterData, setFilterData] = useState({
    kw: '',
    salaryMax: '',
    experienceId: '',
    cityId: '',
  });

  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);

  const queryParams = useMemo(() => ({
    page: page + 1,
    pageSize,
    ordering,
    ...filterData,
  }), [page, pageSize, ordering, filterData]);

  const { data: queryData, isLoading } = useSavedResumes(queryParams);
  const { toggleSaveResume, isMutating } = useToggleSaveResume();

  const resumes = queryData?.results || [];
  const count = queryData?.count || 0;

  const handleFilter = (data: Partial<typeof filterData>) => {
    setFilterData((prev) => ({
      ...prev,
      ...data,
    }));
    onPaginationChange({ pageIndex: 0, pageSize });
  };

  const handleUnsave = async (slug: string) => {
    try {
      await toggleSaveResume(slug);
      toastMessages.success(t('employer:savedResume.messages.unsaveSuccess'));
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    }
  };

  const handleExport = async () => {
    setIsFullScreenLoading(true);
    try {
      const resData = await resumeSavedService.exportResumesSaved(queryParams);
      xlsxUtils.exportToXLSX(resData as unknown as Record<string, unknown>[], 'SavedResumesList');
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 0 }} mb={4}>
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {title}
        </Typography>
        <Button variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport} sx={{ borderRadius: 2, px: 3, width: { xs: '100%', sm: 'auto' } }}>
          {t('employer:savedResume.downloadList')}
        </Button>
      </Stack>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>
          {t('employer:savedResume.filters')}
        </Typography>
        <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, width: '100%' }}>
          <SavedResumeFilterForm handleFilter={handleFilter as any} />
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      ) : (
        <Divider sx={{ mb: 2 }} />
      )}

      <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
        <SavedResumeTable
          isLoading={isLoading}
          rows={resumes}
          rowCount={count}
          pagination={pagination}
          onPaginationChange={onPaginationChange as any}
          sorting={sorting}
          onSortingChange={onSortingChange as any}
          handleUnsave={handleUnsave}
        />
      </Box>

      {(isFullScreenLoading || isMutating) && <BackdropLoading />}
    </Box>
  );
};

export default SavedResumeCard;
