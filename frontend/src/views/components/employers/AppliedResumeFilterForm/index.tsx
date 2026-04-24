import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Stack, Typography, Divider, alpha, useTheme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useTranslation } from 'react-i18next';
import type { Theme } from '@mui/material/styles';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import { useConfig } from '@/hooks/useConfig';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PeopleIcon from '@mui/icons-material/People';
import GraduationCapIcon from '@mui/icons-material/School';
import ApartmentIcon from '@mui/icons-material/Apartment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import WcIcon from '@mui/icons-material/Wc';
import FavoriteIcon from '@mui/icons-material/Favorite';
import pc from '@/utils/muiColors';

export interface AppliedResumeFilterData {
  cityId?: number | string | null;
  careerId?: number | string | null;
  experienceId?: number | string | null;
  positionId?: number | string | null;
  academicLevelId?: number | string | null;
  typeOfWorkplaceId?: number | string | null;
  jobTypeId?: number | string | null;
  genderId?: number | string | null;
  maritalStatusId?: number | string | null;
}

interface AppliedResumeFilterFormProps {
  handleFilter: (data: AppliedResumeFilterData) => void;
  filterData: Partial<AppliedResumeFilterData> | null;
}

type SectionHeaderProps = {
  theme: Theme;
  icon: React.ReactElement;
  title: string;
};

const SectionHeader = ({ theme, icon, title }: SectionHeaderProps) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
    <Box
      sx={{
        display: 'flex',
        p: 0.5,
        borderRadius: 1,
        bgcolor: pc.primary( 0.1),
        color: 'primary.main',
      }}
    >
      {React.cloneElement(icon, { fontSize: 'small' })}
    </Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {title}
    </Typography>
  </Stack>
);

const AppliedResumeFilterForm: React.FC<AppliedResumeFilterFormProps> = ({ handleFilter, filterData }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { allConfig } = useConfig();
  const { control, handleSubmit, reset } = useForm<AppliedResumeFilterData>();

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      ...filterData,
    }));
  }, [filterData, reset]);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2.5,
        backgroundColor: pc.actionDisabled( 0.03),
        '&:hover': { bgcolor: pc.actionDisabled( 0.06) },
        '& fieldset': { borderColor: pc.divider( 0.8) }
    }
  };

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleFilter)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5}>
            <Box>
              <SectionHeader theme={theme} icon={<LocationOnIcon />} title={t('city')} />
              <SingleSelectCustom
                name="cityId"
                control={control}
                options={allConfig?.cityOptions || []}
                placeholder={t('placeholders.allCities')}
                sx={inputSx}
              />
            </Box>

            <Box>
              <SectionHeader theme={theme} icon={<BusinessCenterIcon />} title={t('career')} />
              <SingleSelectCustom
                name="careerId"
                control={control}
                options={allConfig?.careerOptions || []}
                placeholder={t('placeholders.allCareers')}
                sx={inputSx}
              />
            </Box>

            <Box>
              <SectionHeader theme={theme} icon={<PsychologyIcon />} title={t('experience')} />
              <SingleSelectCustom
                name="experienceId"
                control={control}
                options={allConfig?.experienceOptions || []}
                placeholder={t('placeholders.allExperiences')}
                sx={inputSx}
              />
            </Box>

            <Box>
              <SectionHeader theme={theme} icon={<PeopleIcon />} title={t('position')} />
              <SingleSelectCustom
                name="positionId"
                control={control}
                options={allConfig?.positionOptions || []}
                placeholder={t('placeholders.allPositions')}
                sx={inputSx}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5}>
            <Box>
              <SectionHeader theme={theme} icon={<GraduationCapIcon />} title={t('academicLevel')} />
              <SingleSelectCustom
                name="academicLevelId"
                control={control}
                options={allConfig?.academicLevelOptions || []}
                placeholder={t('placeholders.allAcademicLevels')}
                sx={inputSx}
              />
            </Box>

            <Box>
              <SectionHeader theme={theme} icon={<ApartmentIcon />} title={t('typeOfWorkplace')} />
              <SingleSelectCustom
                name="typeOfWorkplaceId"
                control={control}
                options={allConfig?.typeOfWorkplaceOptions || []}
                placeholder={t('placeholders.allWorkplaces')}
                sx={inputSx}
              />
            </Box>

            <Box>
              <SectionHeader theme={theme} icon={<EngineeringIcon />} title={t('jobType')} />
              <SingleSelectCustom
                name="jobTypeId"
                control={control}
                options={allConfig?.jobTypeOptions || []}
                placeholder={t('placeholders.allJobTypes')}
                sx={inputSx}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid size={6}>
                <Box>
                  <SectionHeader theme={theme} icon={<WcIcon />} title={t('gender')} />
                  <SingleSelectCustom
                    name="genderId"
                    control={control}
                    options={allConfig?.genderOptions || []}
                    placeholder={t('placeholders.allGenders')}
                    sx={inputSx}
                  />
                </Box>
              </Grid>
              <Grid size={6}>
                <Box>
                  <SectionHeader theme={theme} icon={<FavoriteIcon />} title={t('maritalStatus')} />
                  <SingleSelectCustom
                    name="maritalStatusId"
                    control={control}
                    options={allConfig?.maritalStatusOptions || []}
                    placeholder={t('placeholders.allMaritalStatuses')}
                    sx={inputSx}
                  />
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default AppliedResumeFilterForm;
