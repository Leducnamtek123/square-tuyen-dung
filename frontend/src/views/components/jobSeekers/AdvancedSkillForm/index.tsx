import React from 'react';

import { useForm } from 'react-hook-form';

import { typedYupResolver } from '../../../../utils/formHelpers';

import * as yup from 'yup';

import { useTranslation } from 'react-i18next';

import { Grid2 as Grid } from "@mui/material";

import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';

import RatingCustom from '../../../../components/Common/Controls/RatingCustom';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface FormValues {
  name: string;
  level: number;
}

interface AdvancedSkillFormProps {
  handleAddOrUpdate: (data: FormValues) => void;
  editData: Partial<FormValues> | null;
  serverErrors?: Record<string, string[]> | null;
}



const AdvancedSkillForm = ({

  handleAddOrUpdate,

  editData,

  serverErrors = null,

}: AdvancedSkillFormProps) => {

  const { t } = useTranslation(['jobSeeker', 'common']);

  const defaultValues = React.useMemo<FormValues>(
    () => ({
      name: editData?.name ?? '',
      level: editData?.level ?? 0,
    }),
    [editData],
  );

  const schema = yup.object().shape({

    name: yup

      .string()

      .required(t('jobSeeker:profile.validation.skillNameRequired'))

      .max(200, t('jobSeeker:profile.validation.skillNameMax')),

    level: yup.number().required(t('jobSeeker:profile.validation.levelRequired')),

  });

  const { control, setError, handleSubmit } = useForm<FormValues>({

    resolver: typedYupResolver(schema),
    defaultValues,

  });

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
