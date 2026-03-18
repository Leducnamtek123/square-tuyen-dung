// @ts-nocheck
import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { useTranslation } from 'react-i18next';

import Grid from "@mui/material/Grid2";

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

import RatingCustom from '../../../../components/controls/RatingCustom';

interface Props {
  [key: string]: any;
}



const AdvancedSkillForm = ({

  handleAddOrUpdate,

  editData,

  serverErrors = null,

}) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const schema = yup.object().shape({

    name: yup

      .string()

      .required(t('jobSeeker:profile.validation.skillNameRequired'))

      .max(200, t('jobSeeker:profile.validation.skillNameMax')),

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

          <TextFieldCustom

            name="name"

            title={t('jobSeeker:profile.fields.skillName')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.skillName')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <RatingCustom name="level" control={control} title={t('jobSeeker:profile.fields.level')} />

        </Grid>

      </Grid>

    </form>

  );

};

export default AdvancedSkillForm;
