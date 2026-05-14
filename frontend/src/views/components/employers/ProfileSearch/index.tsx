import React, { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Button,
  Stack,
  Typography,
  Grid2 as Grid,
  Box,
  Paper,
  Divider,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import BriefcaseIcon from '@mui/icons-material/WorkHistory';
import MagicIcon from '@mui/icons-material/AutoAwesome';
import GroupIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import BuildingIcon from '@mui/icons-material/Business';
import WorkerIcon from '@mui/icons-material/Engineering';
import GenderIcon from '@mui/icons-material/Transgender';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import { resetSearchResume, searchResume } from '../../../../redux/filterSlice';
import type { ResumeFilter } from '../../../../redux/filterSlice';
import { useConfig } from '@/hooks/useConfig';
import pc from '@/utils/muiColors';
import { filterControlSx } from '@/components/Common/FilterBar';
import type { SxProps, Theme } from '@mui/material/styles';

interface ProfileSearchValues {
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

interface FilterGroupProps {
  label: string;
  icon: React.ElementType;
  name: keyof ProfileSearchValues;
  options: React.ComponentProps<typeof SingleSelectCustom>['options'];
  placeholder: string;
  control: ReturnType<typeof useForm<ProfileSearchValues>>['control'];
}

const compactFilterControlSx = {
  ...(filterControlSx as Record<string, unknown>),
  '& .MuiOutlinedInput-root': {
    ...((filterControlSx as Record<string, Record<string, unknown>>)['& .MuiOutlinedInput-root'] || {}),
    height: 48,
    fontWeight: 700,
  },
} as SxProps<Theme>;

const FilterGroup = ({
  label,
  icon: Icon,
  name,
  options,
  placeholder,
  control,
}: FilterGroupProps) => (
  <Stack spacing={1.5}>
    <Typography
      variant="caption"
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: 'text.secondary',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        fontSize: '0.7rem',
      }}
    >
      <Icon sx={{ mr: 1, color: 'primary.main', fontSize: 18 }} />
      {label}
    </Typography>
    <SingleSelectCustom
      name={name}
      control={control}
    options={options}
    placeholder={placeholder}
    sx={filterControlSx}
  />
</Stack>
);

const ProfileSearch: React.FC = () => {
  const { t } = useTranslation(['employer', 'common']);
  const dispatch = useDispatch();
  const { allConfig } = useConfig();
  const { resumeFilter } = useAppSelector((state) => state.filter);

  const { control, reset, handleSubmit } = useForm<ProfileSearchValues>();

  useEffect(() => {
    reset(resumeFilter as ProfileSearchValues);
  }, [resumeFilter, reset]);

  const handleFilter = (data: ProfileSearchValues) => {
    dispatch(searchResume({ ...data, page: 1, pageSize: 10 } as ResumeFilter));
  };

  const handleReset = () => {
    dispatch(resetSearchResume());
  };

  return (
    <>
      <Grid size={12}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: '8px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.customShadows?.z1,
          }}
        >
          <Grid container spacing={2} component="form" onSubmit={handleSubmit(handleFilter)} alignItems="center">
            <Grid size={{ xs: 12, md: 6, lg: 6.5 }}>
              <TextFieldCustom
                name="kw"
                placeholder={t('employer:profileSearch.placeholder.enterkeywords')}
                control={control}
                icon={<SearchIcon sx={{ color: 'primary.main' }} />}
                sx={compactFilterControlSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3, lg: 3 }}>
              <SingleSelectCustom
                name="cityId"
                control={control}
                options={allConfig?.cityOptions || []}
                placeholder={t('employer:profileSearch.placeholder.selectcityprovince')}
                sx={compactFilterControlSx}
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
                  height: 48,
                  
                  boxShadow: (theme) => theme.customShadows?.primary,
                  fontWeight: 900,
                  fontSize: '1rem',
                  textTransform: 'none',
                  letterSpacing: '0.5px',
                }}
              >
                {t('employer:profileSearch.label.search')}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 3 }}>
        <Paper
          sx={{
            p: 2.5,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.customShadows?.z1,
          }}
        >
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ 
                  p: 0.75, 
                  borderRadius: 1.5, 
                  bgcolor: 'primary.extralight', 
                  color: 'primary.main',
                  display: 'flex'
                }}>
                  <FilterAltIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 900, letterSpacing: '0.5px' }}>
                  {t('employer:profileSearch.title.advancedFilters').toUpperCase()}
                </Typography>
              </Stack>
              <Tooltip title={t('employer:profileSearch.label.clearFilters')} arrow>
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  onClick={handleReset}
                  sx={{
                    minWidth: 44,
                    height: 44,
                    
                    p: 0,
                    bgcolor: pc.error( 0.08),
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.main', color: '#fff' },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 22 }} />
                </Button>
              </Tooltip>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', opacity: 0.6 }} />

            <Stack spacing={3.5}>
              <FilterGroup
                label={t('employer:profileSearch.label.careers')}
                icon={BriefcaseIcon}
                name="careerId"
                options={allConfig?.careerOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allcareers')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.experience')}
                icon={MagicIcon}
                name="experienceId"
                options={allConfig?.experienceOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allexperience')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.position')}
                icon={GroupIcon}
                name="positionId"
                options={allConfig?.positionOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allpositions')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.academicLevel')}
                icon={SchoolIcon}
                name="academicLevelId"
                options={allConfig?.academicLevelOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allacademiclevels')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.workplace')}
                icon={BuildingIcon}
                name="typeOfWorkplaceId"
                options={allConfig?.typeOfWorkplaceOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allworkplaces')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.employmentType')}
                icon={WorkerIcon}
                name="jobTypeId"
                options={allConfig?.jobTypeOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allemploymenttypes')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.gender')}
                icon={GenderIcon}
                name="genderId"
                options={allConfig?.genderOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allgenders')}
                control={control}
              />
              <FilterGroup
                label={t('employer:profileSearch.label.maritalStatus')}
                icon={FamilyIcon}
                name="maritalStatusId"
                options={allConfig?.maritalStatusOptions || []}
                placeholder={t('employer:profileSearch.placeholder.allmaritalstatuses')}
                control={control}
              />
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </>
  );
};

export default ProfileSearch;
