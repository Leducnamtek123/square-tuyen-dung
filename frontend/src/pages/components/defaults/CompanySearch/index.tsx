// @ts-nocheck
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, Button, Stack, IconButton, Box } from "@mui/material";

import Grid from "@mui/material/Grid2";

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import InputBaseSearchCompanyCustom from '../../../../components/controls/InputBaseSearchCompanyCustom';

import SingleSelectSearchCustom from '../../../../components/controls/SingleSelectSearchCustom';

import {

  resetSearchCompany,

  searchCompany,

} from '../../../../redux/filterSlice';

interface Props {
  [key: string]: any;
}



const CompanySearch = () => {
  const { t } = useTranslation('public');
  const dispatch = useDispatch();

  const { allConfig } = useSelector((state) => state.config);

  const { companyFilter } = useSelector((state) => state.filter);

  const { control, handleSubmit, reset } = useForm();

  React.useEffect(() => {

    reset((formValues) => ({

      ...formValues,

      ...companyFilter,

    }));

  }, [companyFilter, reset]);

  const handleFilter = (data) => {

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

        <Grid container spacing={2}>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 7,

              lg: 7,

              xl: 7

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

              md: 2,

              lg: 2,

              xl: 2

            }}>

            <Stack direction="row" justifyContent="space-between">

              <Button

                variant="contained"

                color="info"

                sx={{ color: 'white' }}

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
