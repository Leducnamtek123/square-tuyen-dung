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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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
  onOpenManualCandidatePopup: () => void;
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
  onOpenManualCandidatePopup,
  onExport,
}) => {
  const theme = useTheme();
  const aiAnalysisStatusOptions: SelectOption[] = [
    { id: 'pending', name: t('employer:appliedResume.ai.status.pending') },
    { id: 'processing', name: t('employer:appliedResume.ai.status.processing') },
    { id: 'completed', name: t('employer:appliedResume.ai.status.completed') },
    { id: 'failed', name: t('employer:appliedResume.ai.status.failed') },
  ];
  const quickFilterCount =
    (jobPostIdSelect ? 1 : 0) +
    (applicationStatusSelect ? 1 : 0) +
    (aiAnalysisStatusSelect ? 1 : 0) +
    (aiScoreMin ? 1 : 0) +
    (blindMode ? 1 : 0);
  const totalFilterCount = numbersFilter + quickFilterCount;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={3}
      mb={4}
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" flexWrap="wrap">
        <Button
          variant={totalFilterCount > 0 ? 'contained' : 'outlined'}
          color="primary"
          startIcon={<FilterListIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={onOpenFilterPopup}
          sx={{
            px: 2.5,
            py: 1,
            fontWeight: 900,
            textTransform: 'none',
            borderRadius: 2,
            whiteSpace: 'nowrap',
            boxShadow: totalFilterCount > 0 ? theme.customShadows?.primary : 'none',
            bgcolor: totalFilterCount > 0 ? 'primary.main' : 'background.paper',
            borderColor: totalFilterCount > 0 ? 'primary.main' : 'divider',
            '&:hover': {
              bgcolor: totalFilterCount > 0 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          {t('employer:appliedResume.advancedFilter')}
          {totalFilterCount > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.2,
                borderRadius: '12px',
                bgcolor: 'common.white',
                color: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 900,
              }}
            >
              {totalFilterCount}
            </Box>
          )}
        </Button>

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
              px: 2.5, 
              py: 0.8,
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
              px: 2.5, 
              py: 0.8,
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
          color="secondary"
          startIcon={<PersonAddIcon />}
          onClick={onOpenManualCandidatePopup}
          sx={{
            px: 2.5,
            py: 1,
            fontWeight: 900,
            textTransform: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t('employer:manualCandidate.actions.add')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={onExport}
          sx={{
            px: 3,
            py: 1,
            boxShadow: theme.customShadows?.primary,
            fontWeight: 900,
            textTransform: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t('employer:appliedResume.downloadList')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default AppliedResumeToolbar;
