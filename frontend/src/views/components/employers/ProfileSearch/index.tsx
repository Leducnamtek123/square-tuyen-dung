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
    alpha, 
    useTheme 
} from "@mui/material";
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
    const theme = useTheme();
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

    const FilterGroup = ({ label, icon: Icon, name, options, placeholder }: { label: string, icon: React.ElementType, name: keyof ProfileSearchValues, options: React.ComponentProps<typeof SingleSelectCustom>['options'], placeholder: string }) => (
        <Stack spacing={1.5}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.7rem' }}>
                <Icon sx={{ marginRight: 1, color: 'primary.main', fontSize: 18 }} />
                {label}
            </Typography>
            <SingleSelectCustom
                name={name}
                control={control}
                options={options}
                placeholder={placeholder}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: alpha(theme.palette.action.disabled, 0.03),
                        '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
                        '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) }
                    }
                }}
            />
        </Stack>
    );

    return (
        <Grid container spacing={4} size={12}>
            {/* Main Search Bar */}
            <Grid size={12}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        borderRadius: 4, 
                        bgcolor: 'background.paper', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        boxShadow: (theme) => theme.customShadows?.z1
                    }}
                >
                    <Grid container spacing={2} component="form" onSubmit={handleSubmit(handleFilter)} alignItems="center">
                        <Grid size={{ xs: 12, md: 6, lg: 6.5 }}>
                            <TextFieldCustom
                                name="kw"
                                placeholder={t('employer:profileSearch.placeholder.enterkeywords')}
                                control={control}
                                icon={<SearchIcon sx={{ color: 'primary.main' }} />}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 3.5, 
                                        backgroundColor: alpha(theme.palette.action.disabled, 0.05),
                                        border: 'none',
                                        '& fieldset': { border: 'none' },
                                        height: 56,
                                        fontWeight: 700
                                    } 
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3, lg: 3 }}>
                            <SingleSelectCustom
                                name="cityId"
                                control={control}
                                options={allConfig?.cityOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.selectcityprovince')}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 3.5, 
                                        backgroundColor: alpha(theme.palette.action.disabled, 0.05),
                                        border: 'none',
                                        '& fieldset': { border: 'none' },
                                        height: 56,
                                        fontWeight: 700
                                    } 
                                }}
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
                                    height: 56, 
                                    borderRadius: 3.5, 
                                    boxShadow: (theme) => theme.customShadows?.primary,
                                    fontWeight: 900,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {t('employer:profileSearch.label.search')}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            {/* Advanced Filters Sidebar */}
            <Grid size={{ xs: 12, lg: 3 }}>
                <Paper 
                    sx={{ 
                        p: 4, 
                        bgcolor: 'background.paper', 
                        borderRadius: 4, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        boxShadow: (theme) => theme.customShadows?.z1
                    }}
                >
                    <Stack spacing={4}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FilterAltIcon color="primary" sx={{ fontSize: 28 }} />
                                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                                    {t('employer:profileSearch.title.advancedFilters')}
                                </Typography>
                            </Box>
                            <Tooltip title={t('employer:profileSearch.label.clearFilters')} arrow>
                                <Button
                                    variant="text"
                                    color="error"
                                    size="small"
                                    onClick={handleReset}
                                    sx={{ 
                                        minWidth: 44, 
                                        height: 44, 
                                        borderRadius: 2.5,
                                        p: 0,
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                        color: 'error.main',
                                        '&:hover': { bgcolor: 'error.main', color: '#fff' }
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
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.experience')}
                                icon={MagicIcon}
                                name="experienceId"
                                options={allConfig?.experienceOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allexperience')}
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.position')}
                                icon={GroupIcon}
                                name="positionId"
                                options={allConfig?.positionOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allpositions')}
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.academicLevel')}
                                icon={SchoolIcon}
                                name="academicLevelId"
                                options={allConfig?.academicLevelOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allacademiclevels')}
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.workplace')}
                                icon={BuildingIcon}
                                name="typeOfWorkplaceId"
                                options={allConfig?.typeOfWorkplaceOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allworkplaces')}
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.employmentType')}
                                icon={WorkerIcon}
                                name="jobTypeId"
                                options={allConfig?.jobTypeOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allemploymenttypes')}
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.gender')}
                                icon={GenderIcon}
                                name="genderId"
                                options={allConfig?.genderOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allgenders')}
                            />
                            <FilterGroup
                                label={t('employer:profileSearch.label.maritalStatus')}
                                icon={FamilyIcon}
                                name="maritalStatusId"
                                options={allConfig?.maritalStatusOptions || []}
                                placeholder={t('employer:profileSearch.placeholder.allmaritalstatuses')}
                            />
                        </Stack>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ProfileSearch;
