import React, { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button, Stack, Typography, Grid2 as Grid } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faMagicWandSparkles,
  faUsers,
  faGraduationCap,
  faBuilding,
  faPersonDigging,
  faVenusMars,
  faPeopleRoof,
} from '@fortawesome/free-solid-svg-icons';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import { resetSearchResume, searchResume } from '../../../../redux/filterSlice';
import { useConfig } from '@/hooks/useConfig';

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
    dispatch(searchResume(data as any));
  };

  const handleReset = () => {
    dispatch(resetSearchResume());
  };

  const FilterGroup = ({ label, icon, name, options, placeholder }: { label: string, icon: any, name: keyof ProfileSearchValues, options: any[], placeholder: string }) => (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontWeight: 600 }}>
        <FontAwesomeIcon icon={icon} style={{ marginRight: 8, color: '#441da0', width: 16 }} />
        {label}
      </Typography>
      <SingleSelectCustom
        name={name}
        control={control}
        options={options}
        placeholder={placeholder}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }
        }}
      />
    </Stack>
  );

  return (
    <Grid container spacing={3} size={12}>
        {/* Main Search Bar */}
        <Grid size={12}>
            <Grid container spacing={2} component="form" onSubmit={handleSubmit(handleFilter)}>
                <Grid size={{ xs: 12, md: 6, lg: 7 }}>
                    <TextFieldCustom
                        name="kw"
                        placeholder={t('employer:profileSearch.placeholder.enterkeywords')}
                        control={control}
                        icon={<SearchIcon sx={{ color: 'text.disabled' }} />}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'background.paper' } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3, lg: 3 }}>
                    <SingleSelectCustom
                        name="cityId"
                        control={control}
                        options={allConfig?.cityOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.selectcityprovince')}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'background.paper' } }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3, lg: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon />}
                        type="submit"
                        fullWidth
                        sx={{ height: 48, borderRadius: 3, boxShadow: 'none' }}
                    >
                        {t('employer:profileSearch.label.search')}
                    </Button>
                </Grid>
            </Grid>
        </Grid>

        {/* Advanced Filters Sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
            <Stack spacing={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('employer:profileSearch.title.advancedFilters')}</Typography>
                    <Button
                        variant="text"
                        color="error"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleReset}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        {t('employer:profileSearch.label.clearFilters')}
                    </Button>
                </Stack>

                <Stack spacing={2.5}>
                    <FilterGroup
                        label={t('employer:profileSearch.label.careers')}
                        icon={faBriefcase}
                        name="careerId"
                        options={allConfig?.careerOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allcareers')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.experience')}
                        icon={faMagicWandSparkles}
                        name="experienceId"
                        options={allConfig?.experienceOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allexperience')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.position')}
                        icon={faUsers}
                        name="positionId"
                        options={allConfig?.positionOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allpositions')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.academicLevel')}
                        icon={faGraduationCap}
                        name="academicLevelId"
                        options={allConfig?.academicLevelOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allacademiclevels')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.workplace')}
                        icon={faBuilding}
                        name="typeOfWorkplaceId"
                        options={allConfig?.typeOfWorkplaceOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allworkplaces')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.employmentType')}
                        icon={faPersonDigging}
                        name="jobTypeId"
                        options={allConfig?.jobTypeOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allemploymenttypes')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.gender')}
                        icon={faVenusMars}
                        name="genderId"
                        options={allConfig?.genderOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allgenders')}
                    />
                    <FilterGroup
                        label={t('employer:profileSearch.label.maritalStatus')}
                        icon={faPeopleRoof}
                        name="maritalStatusId"
                        options={allConfig?.maritalStatusOptions || []}
                        placeholder={t('employer:profileSearch.placeholder.allmaritalstatuses')}
                    />
                </Stack>
            </Stack>
        </Grid>
    </Grid>
  );
};

export default ProfileSearch;
