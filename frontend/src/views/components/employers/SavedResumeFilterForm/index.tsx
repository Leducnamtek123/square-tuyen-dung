import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useTranslation } from 'react-i18next';

import { useForm } from 'react-hook-form';

import { Button, Stack, IconButton, Tooltip } from "@mui/material";

import Grid from "@mui/material/Grid2";

import SearchIcon from '@mui/icons-material/Search';

import RefreshIcon from '@mui/icons-material/Refresh';

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';

interface SavedResumeFilterFormProps {
  handleFilter: (data: any) => void;
}

const SavedResumeFilterForm: React.FC<SavedResumeFilterFormProps> = ({ handleFilter }) => {

  const { t } = useTranslation('employer');

  const { allConfig } = useAppSelector((state) => state.config);

  const {

    control,

    reset,

    handleSubmit,

    formState: { defaultValues },

  } = useForm<any>({

    defaultValues: {

      kw: '',

      salaryMax: '',

      experienceId: '',

      cityId: '',

    },

  });

  return (

    <form onSubmit={handleSubmit(handleFilter)}>

      <Grid container spacing={2}>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 7,

            lg: 3,

            xl: 3

          }}>

          <TextFieldCustom

            name="kw"

            placeholder={t('savedResumeFilterForm.placeholder.enterjobpostorcandidatename')}

            control={control}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 5,

            lg: 2,

            xl: 2

          }}>

          <TextFieldCustom

            name="salaryMax"

            placeholder={t('savedResumeFilterForm.placeholder.entermaximumsalary')}

            control={control}

            type="number"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 5,

            lg: 2,

            xl: 2

          }}>

          <SingleSelectCustom

            name="experienceId"

            control={control}

            options={allConfig?.experienceOptions || []}

            placeholder={t('savedResumeFilterForm.placeholder.selectexperience')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 4,

            lg: 2,

            xl: 2

          }}>

          <SingleSelectCustom

            name="cityId"

            control={control}

            options={allConfig?.cityOptions || []}

            placeholder={t('savedResumeFilterForm.placeholder.selectlocation')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 3,

            lg: 3,

            xl: 3

          }}>

          <Stack direction="row" spacing={2}>

            <Tooltip title={t('savedResumeFilterForm.title.reset')} arrow>

              <IconButton

                aria-label={t('savedResumeFilterForm.label.refresh')}

                onClick={() => {

                  reset();

                  handleSubmit(() => handleFilter(defaultValues))();

                }}

              >

                <RefreshIcon />

              </IconButton>

            </Tooltip>

            <Button

              sx={{ color: 'white' }}

              variant="contained"

              color="secondary"

              type="submit"

              startIcon={<SearchIcon />}

            >

              {t('savedResumeFilterForm.label.search')}

            </Button>

          </Stack>

        </Grid>

      </Grid>

    </form>

  );

};

export default SavedResumeFilterForm;
