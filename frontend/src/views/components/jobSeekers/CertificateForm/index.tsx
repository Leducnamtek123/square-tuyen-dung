'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Grid2 as Grid } from '@mui/material';
import { DATE_OPTIONS } from '../../../../configs/constants';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';

export interface FormValues {
  name: string;
  trainingPlace: string;
  startDate: Date | null;
  expirationDate: Date | null;
}

interface CertificateFormProps {
  handleAddOrUpdate: (data: FormValues) => void;
  editData: Partial<FormValues> | null;
  serverErrors?: Record<string, string[]> | null;
}

const initialValues: FormValues = {
  name: '',
  trainingPlace: '',
  startDate: null,
  expirationDate: null,
};

const CertificateFormContent = ({
  handleAddOrUpdate,
  serverErrors,
  initialValues,
}: {
  handleAddOrUpdate: (data: FormValues) => void;
  serverErrors: Record<string, string[]> | null;
  initialValues: FormValues;
}) => {
  const { t } = useTranslation(['jobSeeker', 'common']);

  const schema = React.useMemo(
    () =>
      yup.object().shape({
        name: yup.string().required(t('jobSeeker:profile.validation.certificateNameRequired')).max(200, t('jobSeeker:profile.validation.certificateNameMax')),
        trainingPlace: yup.string().required(t('jobSeeker:profile.validation.trainingPlaceRequired')).max(255, t('jobSeeker:profile.validation.trainingPlaceMax')),
        startDate: yup.date().required(t('jobSeeker:profile.validation.startDateRequired')).typeError(t('jobSeeker:profile.validation.startDateRequired')),
        expirationDate: yup.date().nullable(),
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
        <Grid size={12}>
          <TextFieldCustom
            name="name"
            title={t('jobSeeker:profile.fields.certificateName')}
            showRequired={true}
            placeholder={t('jobSeeker:profile.placeholders.certificateName')}
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="trainingPlace"
            title={t('jobSeeker:profile.fields.trainingPlace')}
            showRequired={true}
            placeholder={t('jobSeeker:profile.placeholders.trainingPlace')}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePickerCustom
            name="startDate"
            control={control}
            title={t('jobSeeker:profile.fields.startDate')}
            showRequired={true}
            maxDate={DATE_OPTIONS.yesterday()}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePickerCustom
            name="expirationDate"
            control={control}
            title={t('jobSeeker:profile.fields.expirationDate')}
            maxDate={DATE_OPTIONS.today()}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const CertificateForm = ({ handleAddOrUpdate, editData, serverErrors = null }: CertificateFormProps) => {
  const formKey = React.useMemo(() => JSON.stringify(editData ?? initialValues), [editData]);
  const mergedValues = React.useMemo(
    () => ({
      ...initialValues,
      ...editData,
    }),
    [editData]
  );

  return (
    <CertificateFormContent
      key={formKey}
      handleAddOrUpdate={handleAddOrUpdate}
      serverErrors={serverErrors}
      initialValues={mergedValues}
    />
  );
};

export default CertificateForm;
