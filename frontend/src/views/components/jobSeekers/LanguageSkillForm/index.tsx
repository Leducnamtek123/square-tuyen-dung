import React from 'react';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from '@mui/material';

import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import RatingCustom from '../../../../components/Common/Controls/RatingCustom';
import { useConfig } from '@/hooks/useConfig';

export interface FormValues {
  language: number | string;
  level: number;
}

interface LanguageSkillFormProps {
  handleAddOrUpdate: (data: FormValues) => void;
  editData: Partial<FormValues> | null;
  serverErrors?: Record<string, string[]> | null;
}

const initialValues: FormValues = {
  language: '',
  level: 0,
};

const LanguageSkillFormContent = ({
  handleAddOrUpdate,
  serverErrors,
  initialValues,
}: {
  handleAddOrUpdate: (data: FormValues) => void;
  serverErrors: Record<string, string[]> | null;
  initialValues: FormValues;
}) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { allConfig } = useConfig();

  const schema = React.useMemo(
    () =>
      yup.object().shape({
        language: yup.string().required(t('jobSeeker:profile.validation.languageRequired')).typeError(t('jobSeeker:profile.validation.languageRequired')),
        level: yup.number().required(t('jobSeeker:profile.validation.levelRequired')),
      }),
    [t]
  );

  const { control, setError, handleSubmit } = useForm<FormValues>({
    defaultValues: initialValues,
    resolver: typedYupResolver(schema),
  });

  React.useEffect(() => {
    if (serverErrors === null) return;

    for (const err in serverErrors) {
      setError(err as keyof FormValues, {
        type: 'server',
        message: serverErrors[err]?.join(' '),
      });
    }
  }, [serverErrors, setError]);

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 12, md: 12 }}>
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

const LanguageSkillForm = ({ handleAddOrUpdate, editData, serverErrors = null }: LanguageSkillFormProps) => {
  const formKey = React.useMemo(() => JSON.stringify(editData ?? initialValues), [editData]);
  const mergedValues = React.useMemo(
    () => ({
      ...initialValues,
      ...editData,
    }),
    [editData]
  );

  return (
    <LanguageSkillFormContent
      key={formKey}
      handleAddOrUpdate={handleAddOrUpdate}
      serverErrors={serverErrors}
      initialValues={mergedValues}
    />
  );
};

export default LanguageSkillForm;
