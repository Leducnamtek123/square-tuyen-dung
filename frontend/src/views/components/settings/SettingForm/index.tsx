import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid2 as Grid } from "@mui/material";
import CheckboxCustom from '../../../../components/Common/Controls/CheckboxCustom';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface FormValues {
  emailNotificationActive: boolean;
  smsNotificationActive: boolean;
}

interface SettingFormProps {
  editData: Partial<FormValues> | null;
  handleUpdate: (data: FormValues) => void;
}

const SettingForm = ({ editData, handleUpdate }: SettingFormProps) => {
  const schema = yup.object().shape({
    emailNotificationActive: yup.boolean().default(false),
    smsNotificationActive: yup.boolean().default(false),
  });

  const { control, reset, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
  });

  React.useEffect(() => {
    if (editData) {
      reset((formValues) => ({
        ...formValues,
        ...editData,
      }));
    } else {
      reset({
        emailNotificationActive: false,
        smsNotificationActive: false,
      });
    }
  }, [editData, reset]);

  return (
    <form id="setting-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CheckboxCustom
            name="emailNotificationActive"
            control={control}
            title="Enable email notifications"
          />
        </Grid>
        <Grid size={12}>
          <CheckboxCustom
            name="smsNotificationActive"
            control={control}
            title="Enable SMS notifications"
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default SettingForm;
