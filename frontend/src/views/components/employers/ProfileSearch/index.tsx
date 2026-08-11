'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Button,
  Stack,
  Typography,
  Box,
  Paper,
  Divider,
  Tooltip,
  Drawer,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
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
import type { SxProps, Theme } from '@mui/material/styles';

export interface ProfileSearchValues {
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

const searchControlSx = {
  '& .MuiOutlinedInput-root': {
    height: 42,
    fontSize: '0.875rem',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  },
} as SxProps<Theme>;

const sidebarFilterControlSx = {
  '& .MuiOutlinedInput-root': {
    height: 38,
    fontSize: '0.8125rem',
    borderRadius: '6px',
    backgroundColor: '#F8FAFC',
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
  <Stack spacing={0.75}>
    <Typography
      variant="caption"
      sx={{
        display: 'flex',
        alignItems: 'center',
        color: '#64748B',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        fontSize: '0.72rem',
      }}
    >
      <Icon sx={{ mr: 0.75, color: 'primary.main', fontSize: 15 }} />
      {label}
    </Typography>
    <SingleSelectCustom
      name={name}
      control={control}
      options={options}
      placeholder={placeholder}
      sx={sidebarFilterControlSx}
    />
  </Stack>
);

export const useProfileSearch = () => {
  const { t } = useTranslation(['employer', 'common']);
  const dispatch = useDispatch();
  const { allConfig } = useConfig();
  const { resumeFilter } = useAppSelector((state) => state.filter);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { control, reset, handleSubmit, getValues } = useForm<ProfileSearchValues>();

  useEffect(() => {
    reset(resumeFilter as ProfileSearchValues);
  }, [resumeFilter, reset]);

  const handleFilter = (data: ProfileSearchValues) => {
    dispatch(searchResume({ ...data, page: 1, pageSize: 6 } as ResumeFilter));
  };

  const handleReset = () => {
    dispatch(resetSearchResume());
  };

  const activeFilterCount = Object.keys(resumeFilter).filter((key) => {
    const ignoredKeys = ['page', 'pageSize', 'kw', 'cityId'];
    if (ignoredKeys.includes(key)) return false;
    const val = (resumeFilter as any)[key];
    return val !== undefined && val !== '' && val !== null;
  }).length;

  return {
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    t,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    getValues,
  };
};

export const ProfileSearchBar: React.FC<{
  control: ReturnType<typeof useForm<ProfileSearchValues>>['control'];
  handleSubmit: ReturnType<typeof useForm<ProfileSearchValues>>['handleSubmit'];
  handleFilter: (data: ProfileSearchValues) => void;
  allConfig: ReturnType<typeof useConfig>['allConfig'];
  t: (key: string) => string;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
}> = ({ control, handleSubmit, handleFilter, allConfig, t, onOpenFilterDrawer, activeFilterCount }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.25,
      borderRadius: '10px',
      bgcolor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      width: '100%',
    }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      component="form"
      onSubmit={handleSubmit(handleFilter)}
      alignItems="center"
      sx={{ width: '100%' }}
    >
      {/* Keyword Input */}
      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <TextFieldCustom
          name="kw"
          placeholder={t('employer:profileSearch.placeholder.enterkeywords')}
          control={control}
          icon={<SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
          sx={searchControlSx}
        />
      </Box>

      {/* City Select */}
      <Box sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}>
        <SingleSelectCustom
          name="cityId"
          control={control}
          options={allConfig?.cityOptions || []}
          placeholder={t('employer:profileSearch.placeholder.selectcityprovince')}
          sx={searchControlSx}
        />
      </Box>

      {/* Filter Button next to City Select */}
      <Box sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}>
        <Button
          variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
          color={activeFilterCount > 0 ? 'primary' : 'inherit'}
          startIcon={<FilterAltIcon sx={{ fontSize: 18 }} />}
          onClick={onOpenFilterDrawer}
          sx={{
            height: 42,
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            px: 2,
            borderColor: activeFilterCount > 0 ? 'primary.main' : '#CBD5E1',
            bgcolor: activeFilterCount > 0 ? undefined : '#F8FAFC',
            color: activeFilterCount > 0 ? '#FFFFFF' : '#334155',
            '&:hover': {
              bgcolor: activeFilterCount > 0 ? undefined : '#F1F5F9',
              borderColor: activeFilterCount > 0 ? undefined : '#94A3B8',
            },
          }}
        >
          Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </Button>
      </Box>

      {/* Search Button */}
      <Box sx={{ width: { xs: '100%', sm: 140 }, flexShrink: 0 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          type="submit"
          fullWidth
          sx={{
            height: 42,
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            },
          }}
        >
          {t('employer:profileSearch.label.search')}
        </Button>
      </Box>
    </Stack>
  </Paper>
);

export const ProfileFilterDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  control: ReturnType<typeof useForm<ProfileSearchValues>>['control'];
  handleReset: () => void;
  handleSubmit: ReturnType<typeof useForm<ProfileSearchValues>>['handleSubmit'];
  handleFilter: (data: ProfileSearchValues) => void;
  allConfig: ReturnType<typeof useConfig>['allConfig'];
  t: (key: string) => string;
}> = ({ open, onClose, control, handleReset, handleSubmit, handleFilter, allConfig, t }) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: '100%', sm: 380 },
        maxWidth: '100vw',
        p: 0,
        bgcolor: '#FFFFFF',
      },
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <FilterAltIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            {t('employer:profileSearch.title.advancedFilters').toUpperCase()}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={t('employer:profileSearch.label.clearFilters')} arrow>
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={handleReset}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 'auto',
                px: 1,
              }}
            >
              Xóa bộ lọc
            </Button>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Drawer Body - Filter List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        <Stack spacing={2}>
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
      </Box>

      {/* Drawer Footer - Apply Button */}
      <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit((data) => {
            handleFilter(data);
            onClose();
          })}
          sx={{
            height: 44,
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            textTransform: 'none',
          }}
        >
          Áp dụng bộ lọc
        </Button>
      </Box>
    </Box>
  </Drawer>
);

const ProfileSearch: React.FC = () => {
  const {
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    t,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
  } = useProfileSearch();

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <ProfileSearchBar
        control={control}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        t={t}
        onOpenFilterDrawer={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />
      <ProfileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        control={control}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        t={t}
      />
    </Stack>
  );
};

export default ProfileSearch;
