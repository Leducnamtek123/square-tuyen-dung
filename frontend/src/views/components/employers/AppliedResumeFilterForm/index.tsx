import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useForm } from 'react-hook-form';

import { Box, Stack, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

import Grid from "@mui/material/Grid2";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {

  faLocationDot,

  faBriefcase,

  faMagicWandSparkles,

  faUsers,

  faGraduationCap,

  faBuilding,

  faPersonDigging,

  faVenusMars,

  faPeopleRoof,

} from '@fortawesome/free-solid-svg-icons';

import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';

interface AppliedResumeFilterFormProps {
  handleFilter: (data: any) => void;
  filterData: any;
}

const AppliedResumeFilterForm: React.FC<AppliedResumeFilterFormProps> = ({ handleFilter, filterData }) => {

  const { t } = useTranslation('common');

  const { allConfig } = useAppSelector((state) => state.config);

  const { control, handleSubmit, reset } = useForm<any>();

  React.useEffect(() => {

    reset((formValues: any) => ({

      ...formValues,

      ...filterData,

    }));

  }, [filterData, reset]);

  return (

    <>

      <form id="modal-form" onSubmit={handleSubmit(handleFilter)}>

        <Grid size={12}>

          <Stack spacing={2}>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faLocationDot}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('city')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="cityId"

                control={control}

                options={allConfig?.cityOptions || []}

                showRequired={true}

                placeholder={t('placeholders.selectCity')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faBriefcase}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('career')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="careerId"

                control={control}

                options={allConfig?.careerOptions || []}

                placeholder={t('placeholders.allCareers')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faMagicWandSparkles}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('experience')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="experienceId"

                control={control}

                options={allConfig?.experienceOptions || []}

                placeholder={t('placeholders.allExperiences')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon icon={faUsers} style={{ marginRight: 3 }} />{' '}

                  {t('position')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="positionId"

                control={control}

                options={allConfig?.positionOptions || []}

                placeholder={t('placeholders.allPositions')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faGraduationCap}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('academicLevel')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="academicLevelId"

                control={control}

                options={allConfig?.academicLevelOptions || []}

                placeholder={t('placeholders.allAcademicLevels')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faBuilding}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('typeOfWorkplace')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="typeOfWorkplaceId"

                control={control}

                options={allConfig?.typeOfWorkplaceOptions || []}

                placeholder={t('placeholders.allWorkplaces')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faPersonDigging}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('jobType')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="jobTypeId"

                control={control}

                options={allConfig?.jobTypeOptions || []}

                placeholder={t('placeholders.allJobTypes')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faVenusMars}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('gender')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="genderId"

                control={control}

                options={allConfig?.genderOptions || []}

                placeholder={t('placeholders.allGenders')}

              />

            </Stack>

            <Stack spacing={1}>

              <Box>

                <Typography variant="subtitle2">

                  <FontAwesomeIcon

                    icon={faPeopleRoof}

                    style={{ marginRight: 3 }}

                  />{' '}

                  {t('maritalStatus')}

                </Typography>

              </Box>

              <SingleSelectCustom

                name="maritalStatusId"

                control={control}

                options={allConfig?.maritalStatusOptions || []}

                placeholder={t('placeholders.allMaritalStatuses')}

              />

            </Stack>

          </Stack>

        </Grid>

      </form>

    </>

  );

};

export default AppliedResumeFilterForm;
