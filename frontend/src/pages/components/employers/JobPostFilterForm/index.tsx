import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Tooltip, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';
import { useAppSelector } from '../../../../redux/hooks';

interface JobPostFilterFormProps {
  handleFilter: (data: any) => void;
}



const JobPostFilterForm = ({ handleFilter }: JobPostFilterFormProps) => {

  const { t } = useTranslation('employer');

  const { allConfig } = useAppSelector((state) => state.config);

  const {

    control,

    handleSubmit,

    reset,

    formState: { defaultValues },

  } = useForm({

    defaultValues: {

      kw: '',

      isUrgent: '',

      statusId: '',

    },

  });

  return (

    <form onSubmit={handleSubmit(handleFilter)}>

      <Grid container spacing={2}>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 5,

            lg: 5,

            xl: 5

          }}>

          <TextFieldCustom

            name="kw"

            placeholder={t('jobPost.filters.keywordsPlaceholder')}

            control={control}

          />

        </Grid>

        <Grid flex={1}>

          <SingleSelectCustom

            name="isUrgent"

            control={control}

            options={[

              { id: 1, name: t('jobPost.filters.urgent') },

              { id: 2, name: t('jobPost.filters.notUrgent') },

            ]}

            showRequired={true}

            placeholder={t('jobPost.filters.urgentPlaceholder')}

          />

        </Grid>

        <Grid flex={1}>

          <SingleSelectCustom

            name="statusId"

            control={control}

            options={allConfig?.jobPostStatusOptions || []}

            showRequired={true}

            placeholder={t('jobPost.filters.statusPlaceholder')}

          />

        </Grid>

        <Grid>

          <Stack

            direction="row"

            spacing={2}

            justifyContent={{

              xs: 'flex-end',

              sm: 'center',

              md: 'center',

              lg: 'center',

              xl: 'center',

            }}

          >

            <Tooltip title={t('jobPost.filters.reset')} arrow>

              <IconButton

                aria-label={t('jobPostFilterForm.label.refresh', 'refresh')}

                onClick={() => {

                  reset();

                  handleFilter(defaultValues);

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

              {t('jobPost.filters.search')}

            </Button>

          </Stack>

        </Grid>

      </Grid>

    </form>

  );

};

export default JobPostFilterForm;
