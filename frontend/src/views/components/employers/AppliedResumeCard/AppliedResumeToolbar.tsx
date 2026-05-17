import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Grid2 as Grid,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { alpha, useTheme } from '@mui/material/styles';
import type { TFunction } from 'i18next';
import type { SelectOption, SystemConfig } from '@/types/models';
import { tConfig } from '../../../../utils/tConfig';
import type { JobPostOption } from '../hooks/useEmployerQueries';
import FilterBar, { filterControlSx } from '@/components/Common/FilterBar';

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
  aiAnalysisStatusSelect: string;
  onAiAnalysisStatusSelect: (value: string) => void;
  aiScoreMin: string;
  onAiScoreMinChange: (value: string) => void;
  blindMode: boolean;
  onBlindModeChange: (value: boolean) => void;
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
  aiAnalysisStatusSelect,
  onAiAnalysisStatusSelect,
  aiScoreMin,
  onAiScoreMinChange,
  blindMode,
  onBlindModeChange,
  numbersFilter,
  onResetFilterData,
  onOpenFilterPopup,
  onExport,
}) => {
  const theme = useTheme();
  const aiAnalysisStatusOptions: SelectOption[] = [
    { id: 'pending', name: t('employer:appliedResume.ai.status.pending', { defaultValue: 'Chưa phân tích' }) },
    { id: 'processing', name: t('employer:appliedResume.ai.status.processing', { defaultValue: 'Đang phân tích' }) },
    { id: 'completed', name: t('employer:appliedResume.ai.status.completed', { defaultValue: 'Đã phân tích' }) },
    { id: 'failed', name: t('employer:appliedResume.ai.status.failed', { defaultValue: 'Lỗi phân tích' }) },
  ];
  const quickFilterCount =
    (jobPostIdSelect ? 1 : 0) +
    (applicationStatusSelect ? 1 : 0) +
    (aiAnalysisStatusSelect ? 1 : 0) +
    (aiScoreMin ? 1 : 0) +
    (blindMode ? 1 : 0);

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
            sx={{
              p: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                borderRadius: 1.5,
                '&.Mui-disabled': {
                  border: 0,
                },
                '&:not(:first-of-type)': {
                  borderRadius: 1.5,
                },
                '&:first-of-type': {
                  borderRadius: 1.5,
                },
              },
            }}
          >
            <ToggleButton 
              value="table" 
              sx={{ 
                fontWeight: 800, 
                px: 3, 
                py: 1,
                textTransform: 'none',
                color: 'primary.main',
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: theme.customShadows?.z1,
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }
              }}
            >
              <ViewListIcon sx={{ mr: 1, fontSize: 20 }} /> {t('employer:appliedResume.tableView')}
            </ToggleButton>
            <ToggleButton 
              value="board" 
              sx={{ 
                fontWeight: 800, 
                px: 3, 
                py: 1,
                textTransform: 'none',
                color: 'primary.main',
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: theme.customShadows?.z1,
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }
              }}
            >
              <ViewKanbanIcon sx={{ mr: 1, fontSize: 20 }} /> {t('employer:appliedResume.boardView')}
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={onExport}
            sx={{
              
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

      <FilterBar
        title={t('employer:appliedResume.filters')}
        sx={{ mb: 5 }}
        activeFilterCount={numbersFilter + quickFilterCount}
        onReset={onResetFilterData}
        resetDisabled={!numbersFilter && !quickFilterCount}
        resetLabel={t('common:reset')}
        actions={(
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterListIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={onOpenFilterPopup}
            sx={{
              
              px: 2,
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: 'background.paper',
              borderStyle: 'dashed',
              whiteSpace: 'nowrap',
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
                  borderRadius: '8px',
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
        )}
      >
        <Grid container spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                  sx={filterControlSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                  sx={filterControlSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <Autocomplete
              getOptionLabel={(option) => option.name}
              value={aiAnalysisStatusOptions.find((o) => String(o.id) === aiAnalysisStatusSelect) || null}
              onChange={(e, value) => onAiAnalysisStatusSelect(value?.id ? String(value.id) : '')}
              disablePortal
              size="small"
              options={aiAnalysisStatusOptions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t('employer:appliedResume.ai.allStatuses', { defaultValue: 'Trạng thái AI' })}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <AutoAwesomeIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={filterControlSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <TextField
              value={aiScoreMin}
              onChange={(event) => onAiScoreMinChange(event.target.value)}
              type="number"
              size="small"
              placeholder={t('employer:appliedResume.ai.scoreMin', { defaultValue: 'Điểm AI từ' })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SpeedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
                htmlInput: { min: 0, max: 100 },
              }}
              sx={filterControlSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
            <ToggleButton
              value="blind"
              selected={blindMode}
              onChange={() => onBlindModeChange(!blindMode)}
              fullWidth
              size="small"
              sx={{
                height: 40,
                justifyContent: 'flex-start',
                gap: 1,
                px: 1.5,
                borderRadius: 1.5,
                borderColor: 'divider',
                color: blindMode ? 'primary.contrastText' : 'text.secondary',
                bgcolor: blindMode ? 'primary.main' : 'background.paper',
                fontWeight: 800,
                textTransform: 'none',
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
              }}
            >
              <VisibilityOffIcon sx={{ fontSize: 20 }} />
              {t('employer:appliedResume.ai.blindMode', { defaultValue: 'Blind mode' })}
            </ToggleButton>
          </Grid>
        </Grid>
      </FilterBar>
    </>
  );
};

export default AppliedResumeToolbar;
