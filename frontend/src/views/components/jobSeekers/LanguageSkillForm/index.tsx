import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { useTranslation } from 'react-i18next';

import { Grid2 as Grid } from "@mui/material";

import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';

import RatingCustom from '../../../../components/Common/Controls/RatingCustom';
import { useConfig } from '@/hooks/useConfig';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface FormValues {
  language: number | string;
  level: number;
}

interface LanguageSkillFormProps {
  handleAddOrUpdate: (data: FormValues) => void;
  editData: Partial<FormValues> | null;
  serverErrors?: Record<string, string[]> | null;
}



const LanguageSkillForm = ({

  handleAddOrUpdate,

  editData,

  serverErrors = null,

}: LanguageSkillFormProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const { allConfig } = useConfig();

  const schema = yup.object().shape({

    language: yup

      .string()

      .required(t('jobSeeker:profile.validation.languageRequired'))
      .typeError(t('jobSeeker:profile.validation.languageRequired')),

    level: yup.number().required(t('jobSeeker:profile.validation.levelRequired')),

  });

  const { control, reset, setError, handleSubmit } = useForm<FormValues>({

    resolver: yupResolver(schema) as any,

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

    if (serverErrors !== null) {

      for (let err in serverErrors) {

        setError(err as keyof FormValues, {

          type: 'server',

          message: serverErrors[err]?.join(' '),

        });

      }
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
