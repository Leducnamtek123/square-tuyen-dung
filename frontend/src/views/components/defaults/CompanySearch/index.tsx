import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, Button, Stack, IconButton, Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InputBaseSearchCompanyCustom from '../../../../components/Common/Controls/InputBaseSearchCompanyCustom';
import SingleSelectSearchCustom from '../../../../components/Common/Controls/SingleSelectSearchCustom';
import {
  resetSearchCompany,
  searchCompany,
} from '../../../../redux/filterSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/useAppStore';
import { useConfig } from '@/hooks/useConfig';

const CompanySearch = () => {
  const { t } = useTranslation('public');
  const dispatch = useAppDispatch();

  const { allConfig } = useConfig();

  const { companyFilter } = useAppSelector((state) => state.filter);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      kw: '',
      cityId: '',
    },
  });

  React.useEffect(() => {

    reset((formValues) => ({

      ...formValues,

      ...companyFilter,

    }));

  }, [companyFilter, reset]);

  const handleFilter = (data: any) => {

    dispatch(searchCompany(data));

  };

  const handleReset = () => {

    dispatch(resetSearchCompany());

  };

  return (

    <Card

      sx={{

        p: 2,

        boxShadow: 0,

        backgroundColor: '#441da0',

        width: { xs: '100%', sm: '100%', md: '100%', lg: '80%', xl: '80%' },

      }}

    >

      <Box component="form" onSubmit={handleSubmit(handleFilter)}>

        <Grid container spacing={2} alignItems="center">

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <InputBaseSearchCompanyCustom

              name="kw"

              placeholder={t('companySearch.searchPlaceholder')}

              control={control}

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

            <SingleSelectSearchCustom

              name="cityId"

              placeholder={t('companySearch.allCities')}

              control={control}

              options={allConfig?.cityOptions || []}

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

            <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">

              <Button

                variant="contained"

                color="info"

                sx={{ color: 'white', whiteSpace: 'nowrap', px: 3 }}

                type="submit"

              >

                {t('companySearch.searchButton')}

              </Button>

              <IconButton aria-label="delete" onClick={handleReset}>

                <DeleteForeverIcon color="secondary" />

              </IconButton>

            </Stack>

          </Grid>

        </Grid>

      </Box>

    </Card>

  );

};

export default CompanySearch;
