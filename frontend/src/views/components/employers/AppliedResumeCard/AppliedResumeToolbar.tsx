import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Grid2 as Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import { alpha, useTheme } from '@mui/material/styles';
import type { TFunction } from 'i18next';
import type { SelectOption, SystemConfig } from '@/types/models';
import type { AppliedResumeFilterData } from '../AppliedResumeFilterForm';
import { tConfig } from '../../../../utils/tConfig';
import type { JobPostOption } from '../hooks/useEmployerQueries';

interface Props {
  title: string;
  t: TFunction;
  allConfig: SystemConfig | null;
  viewMode: 'table' | 'board';
  onViewModeChange: (nextValue: 'table' | 'board') => void;
  jobPostOptions: JobPostOption[];
  jobPostIdSelect: string;
  onJobPostSelect: (value: string) => void;
  applicationStatusSelect: string;
  onApplicationStatusSelect: (value: string) => void;
  numbersFilter: number;
  onResetFilterData: () => void;
  onOpenFilterPopup: () => void;
  onExport: () => void;
}

const AppliedResumeToolbar: React.FC<Props> = ({
  title,
  t,
  allConfig,
  viewMode,
  onViewModeChange,
  jobPostOptions,
  jobPostIdSelect,
  onJobPostSelect,
  applicationStatusSelect,
  onApplicationStatusSelect,
  numbersFilter,
  onResetFilterData,
  onOpenFilterPopup,
  onExport,
}) => {
  const theme = useTheme();

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={3}
        mb={5}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            bgcolor: 'primary.extralight', 
            color: 'primary.main',
            display: 'flex'
          }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('employer:appliedResume.manageSubtitle')}
            </Typography>
          </Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newValue) => {
              if (newValue) onViewModeChange(newValue);
            }}
            size="small"
            sx={{ bgcolor: 'background.neutral', '& .MuiToggleButton-root': { borderRadius: 3 } }}
          >
            <ToggleButton value="table" sx={{ fontWeight: 800, px: 2, textTransform: 'none' }}>
              <ViewListIcon sx={{ mr: 1, fontSize: 18 }} /> {t('employer:appliedResume.tableView')}
            </ToggleButton>
            <ToggleButton value="board" sx={{ fontWeight: 800, px: 2, textTransform: 'none' }}>
              <ViewKanbanIcon sx={{ mr: 1, fontSize: 18 }} /> {t('employer:appliedResume.boardView')}
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={onExport}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.25,
              boxShadow: theme.customShadows?.primary,
              fontWeight: 900,
              textTransform: 'none',
            }}
          >
            {t('employer:appliedResume.downloadList')}
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          borderRadius: 3,
          bgcolor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.5,
              bgcolor: 'primary.extralight',
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <FilterListIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 900, letterSpacing: '0.5px' }}>
            {t('employer:appliedResume.filters').toUpperCase()}
          </Typography>
        </Stack>

        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <Autocomplete
              getOptionLabel={(option) => option.jobName}
              value={jobPostOptions.find((o) => String(o.id) === jobPostIdSelect) || null}
              onChange={(e, value) => onJobPostSelect(value?.id ? String(value.id) : '')}
              disablePortal
              size="small"
              options={jobPostOptions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('employer:appliedResume.allJobPosts')}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <WorkOutlineIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      fontWeight: 600,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Autocomplete
              getOptionLabel={(option) => tConfig(option.name as string)}
              value={allConfig?.applicationStatusOptions?.find((o) => String(o.id) === applicationStatusSelect) || null}
              onChange={(e, value) => onApplicationStatusSelect(value?.id ? String(value.id) : '')}
              disablePortal
              size="small"
              options={allConfig?.applicationStatusOptions || []}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('employer:appliedResume.allStatuses')}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <AssignmentTurnedInIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      fontWeight: 600,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-end', md: 'flex-end' }}>
              <Tooltip title={t('common:reset')} arrow>
                <IconButton
                  onClick={onResetFilterData}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<FilterListIcon />}
                endIcon={<ExpandMoreIcon />}
                onClick={onOpenFilterPopup}
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: 'background.paper',
                  borderStyle: 'dashed',
                  '&:hover': { bgcolor: 'primary.extralight', borderColor: 'primary.main', borderStyle: 'solid' },
                }}
              >
                {t('employer:appliedResume.advancedFilter')}
                {numbersFilter > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                    }}
                  >
                    {numbersFilter}
                  </Box>
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default AppliedResumeToolbar;
