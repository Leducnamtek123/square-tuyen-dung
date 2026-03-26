import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useTranslation } from 'react-i18next';

import { useDispatch } from 'react-redux';

import { useForm } from 'react-hook-form';

import { Button, Stack, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2";

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

const ProfileSearch: React.FC = () => {

  const { t } = useTranslation('employer');

  const dispatch = useDispatch();

  const { allConfig } = useConfig();

  const { resumeFilter } = useAppSelector((state) => state.filter);

  const { control, reset, handleSubmit } = useForm<any>();

  React.useEffect(() => {

    reset((formValues: any) => ({

      ...formValues,

      ...resumeFilter,

    }));

  }, [resumeFilter, reset]);

  const handleFilter = (data: any) => {

    dispatch(searchResume(data) as any);

  };

  const handleReset = () => {

    dispatch(resetSearchResume());

  };

  return (

    <>

      <Grid component="form" onSubmit={handleSubmit(handleFilter)} size={12}>

        <Grid container spacing={2}>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 5,

              lg: 6,

              xl: 6

            }}>

            <TextFieldCustom

              name="kw"

              showRequired={true}

              placeholder={t('profileSearch.placeholder.enterkeywords')}

              control={control}

              icon={<SearchIcon sx={{ color: 'grey.500' }} />}

              {...({
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'grey.50',
                    },
                    '& fieldset': {
                      borderColor: 'grey.200',
                    },
                  }
                }
              } as any)}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 4,

              lg: 4,

              xl: 4

            }}>

            <SingleSelectCustom

              name="cityId"

              control={control}

              options={allConfig?.cityOptions || []}

              showRequired={true}

              placeholder={t('profileSearch.placeholder.selectcityprovince')}

              {...({
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: '12px',
                    '&:hover': {
                      backgroundColor: 'grey.50',
                    },
                    '& fieldset': {
                      borderColor: 'grey.200',
                    },
                  }
                }
              } as any)}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 3,

              lg: 2,

              xl: 2

            }}>

            <Stack>

              <Button

                variant="contained"

                color="secondary"

                startIcon={<SearchIcon />}

                sx={{

                  height: '100%',

                  borderRadius: '12px',

                  boxShadow: 'none',

                  background: (theme: any) => theme.palette.secondary.main,

                  '&:hover': {

                    boxShadow: (theme: any) => theme.customShadows.medium,

                  }

                }}

                type="submit"

              >

                {t('profileSearch.label.search')}

              </Button>

            </Stack>

          </Grid>

        </Grid>

      </Grid>

      <Grid

        component="form"

        onSubmit={handleSubmit(handleFilter)}

        size={{

          xs: 12,

          sm: 12,

          md: 12,

          lg: 3,

          xl: 3

        }}>

        <Stack 

          spacing={2.5}

          sx={{

            backgroundColor: 'background.paper',

            borderRadius: '16px',

            padding: 3,

            border: '1px solid',

            borderColor: 'grey.100',

            boxShadow: (theme: any) => theme.customShadows.card

          }}

        >

          <Stack

            direction="row"

            justifyContent="space-between"

            alignItems="center"

          >

            <Typography variant="h6" sx={{ fontWeight: 600 }}>{t('profileSearch.title.advancedFilters')}</Typography>

            <Button

              variant="text"

              color="error"

              size="small"

              startIcon={<RefreshIcon />}

              sx={{ 

                textTransform: 'inherit',

                '&:hover': {

                  backgroundColor: 'error.background'

                }

              }}

              onClick={handleReset}

            >

              {t('profileSearch.label.clearFilters')}

            </Button>

          </Stack>

          <Stack spacing={2}>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faBriefcase} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.careers')}

              </Typography>

              <SingleSelectCustom

                name="careerId"

                control={control}

                options={allConfig?.careerOptions || []}

                placeholder={t('profileSearch.placeholder.allcareers')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faMagicWandSparkles} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.experience')}

              </Typography>

              <SingleSelectCustom

                name="experienceId"

                control={control}

                options={allConfig?.experienceOptions || []}

                placeholder={t('profileSearch.placeholder.allexperience')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faUsers} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.position')}

              </Typography>

              <SingleSelectCustom

                name="positionId"

                control={control}

                options={allConfig?.positionOptions || []}

                placeholder={t('profileSearch.placeholder.allpositions')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.academicLevel')}

              </Typography>

              <SingleSelectCustom

                name="academicLevelId"

                control={control}

                options={allConfig?.academicLevelOptions || []}

                placeholder={t('profileSearch.placeholder.allacademiclevels')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faBuilding} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.workplace')}

              </Typography>

              <SingleSelectCustom

                name="typeOfWorkplaceId"

                control={control}

                options={allConfig?.typeOfWorkplaceOptions || []}

                placeholder={t('profileSearch.placeholder.allworkplaces')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faPersonDigging} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.employmentType')}

              </Typography>

              <SingleSelectCustom

                name="jobTypeId"

                control={control}

                options={allConfig?.jobTypeOptions || []}

                placeholder={t('profileSearch.placeholder.allemploymenttypes')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faVenusMars} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.gender')}

              </Typography>

              <SingleSelectCustom

                name="genderId"

                control={control}

                options={allConfig?.genderOptions || []}

                placeholder={t('profileSearch.placeholder.allgenders')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

            <Stack spacing={1}>

              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: 'grey.700' }}>

                <FontAwesomeIcon icon={faPeopleRoof} style={{ marginRight: 8, color: '#441da0' }} />

                {t('profileSearch.label.maritalStatus')}

              </Typography>

              <SingleSelectCustom

                name="maritalStatusId"

                control={control}

                options={allConfig?.maritalStatusOptions || []}

                placeholder={t('profileSearch.placeholder.allmaritalstatuses')}

                {...({
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      },
                      '& fieldset': {
                        borderColor: 'grey.200',
                      }
                    }
                  }
                } as any)}

              />

            </Stack>

          </Stack>

        </Stack>

      </Grid>

    </>

  );

};

export default ProfileSearch;
