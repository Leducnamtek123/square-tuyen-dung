// @ts-nocheck
import React from 'react';

import { useSelector } from 'react-redux';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { useTranslation } from 'react-i18next';

import Grid from "@mui/material/Grid2";

import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';

import RatingCustom from '../../../../components/controls/RatingCustom';

interface Props {
  [key: string]: any;
}



const LanguageSkillForm = ({

  handleAddOrUpdate,

  editData,

  serverErrors = null,

}) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const { allConfig } = useSelector((state) => state.config);

  const schema = yup.object().shape({

    language: yup

      .number()

      .required(t('jobSeeker:profile.validation.languageRequired'))

      .typeError(t('jobSeeker:profile.validation.languageRequired')),

    level: yup.number().required(t('jobSeeker:profile.validation.levelRequired')),

  });

  const { control, reset, setError, handleSubmit } = useForm({

    resolver: yupResolver(schema),

  });

  React.useEffect(() => {

    if (editData) {

      reset((formValues) => ({

        ...formValues,

        ...editData,

      }));

    } else {

      reset();

    }

  }, [editData, reset]);

  // show server errors

  React.useEffect(() => {

    if (serverErrors !== null)

      for (let err in serverErrors) {

        setError(err, {

          type: 400,

          message: serverErrors[err]?.join(' '),

        });

      }

    else {

      setError();

    }

  }, [serverErrors, setError]);

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>

      <Grid container spacing={2}>

        <Grid

          size={{

            xs: 12,

            lg: 12,

            md: 12

          }}>

          <SingleSelectCustom

            name="language"

            control={control}

            options={allConfig?.languageOptions || []}

            title={t('jobSeeker:profile.fields.language')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectLanguage')}

          />

        </Grid>

        <Grid size={12}>

          <RatingCustom name="level" control={control} title={t('jobSeeker:profile.fields.level')} />

        </Grid>

      </Grid>

    </form>

  );

};

export default LanguageSkillForm;
