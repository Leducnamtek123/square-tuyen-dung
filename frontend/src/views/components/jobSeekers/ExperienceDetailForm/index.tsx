import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { Grid2 as Grid } from "@mui/material";

import { useTranslation } from 'react-i18next';

import { DATE_OPTIONS } from '../../../../configs/constants';

import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';

import MultilineTextFieldCustom from '../../../../components/Common/Controls/MultilineTextFieldCustom';

import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';

export interface FormValues {
  jobName: string;
  companyName: string;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
  lastSalary: number | null;
  leaveReason: string | null;
}

interface ExperienceDetailFormProps {
  handleAddOrUpdate: (data: FormValues) => void;
  editData: Partial<FormValues> | null;
}



const ExperienceDetailForm = ({ handleAddOrUpdate, editData }: ExperienceDetailFormProps) => {

  const { t } = useTranslation(['jobSeeker']);

  const schema = yup.object().shape({

    jobName: yup

      .string()

      .required(t('jobSeeker:profile.validation.jobTitleRequired'))

      .max(200, t('jobSeeker:profile.validation.jobTitleMax')),

    companyName: yup

      .string()

      .required(t('jobSeeker:profile.validation.companyNameRequired'))

      .max(255, t('jobSeeker:profile.validation.companyNameMax')),

    startDate: yup

      .date()

      .required(t('jobSeeker:profile.validation.startDateRequired'))

      .typeError(t('jobSeeker:profile.validation.startDateRequired'))

      .max(DATE_OPTIONS.yesterday(), t('jobSeeker:profile.validation.startDateYesterday'))

      .test(

        'start-date-comparison',

        t('jobSeeker:profile.validation.startDateComparison'),

        function (value) {
          const endDate = this.parent.endDate;
          if (!value || !endDate) return true;
          return !(value >= endDate);

        }

      ),

    endDate: yup

      .date()

      .required(t('jobSeeker:profile.validation.endDateRequired'))

      .typeError(t('jobSeeker:profile.validation.endDateRequired'))

      .max(

        DATE_OPTIONS.today(),

        t('jobSeeker:profile.validation.endDateToday')

      )

      .test(

        'end-date-comparison',

        t('jobSeeker:profile.validation.endDateComparison'),

        function (value) {
          const startDate = this.parent.startDate;
          if (!value || !startDate) return true;
          return !(value <= startDate);

        }

      ),

    lastSalary: yup.number().nullable().min(0, t('jobSeeker:profile.validation.lastSalaryInvalid')),

    leaveReason: yup.string().max(255, t('jobSeeker:profile.validation.leaveReasonMax')),

    description: yup.string().nullable().max(1000, t('jobSeeker:profile.validation.descriptionMax')),

  });

  const { control, reset, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(schema) as import('react-hook-form').Resolver<FormValues>,
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

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>

      <Grid container spacing={2}>

        <Grid size={12}>

          <TextFieldCustom

            name="jobName"

            control={control}

            placeholder={t('jobSeeker:profile.placeholders.jobTitle')}

            title={t('jobSeeker:profile.fields.jobTitle')}

            showRequired={true}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="companyName"

            title={t('jobSeeker:profile.fields.companyName')}

            placeholder={t('jobSeeker:profile.placeholders.companyName')}

            control={control}

            showRequired={true}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <DatePickerCustom

            name="startDate"

            control={control}

            title={t('jobSeeker:profile.fields.startDate')}

            showRequired={true}

            maxDate={DATE_OPTIONS.yesterday()}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <DatePickerCustom

            name="endDate"

            control={control}

            title={t('jobSeeker:profile.fields.endDate')}

            showRequired={true}

            maxDate={DATE_OPTIONS.today()}

          />

        </Grid>

        <Grid size={12}>

          <MultilineTextFieldCustom

            name="description"

            title={t('jobSeeker:profile.fields.additionalDescription')}

            placeholder={t('jobSeeker:profile.placeholders.additionalDescription')}

            control={control as unknown as import('react-hook-form').Control<import('react-hook-form').FieldValues>}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <TextFieldCustom

            name="lastSalary"

            title={t('jobSeeker:profile.fields.lastSalary')}

            placeholder={t('jobSeeker:profile.placeholders.lastSalary')}

            control={control}

            type="number"

            icon="VND"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <TextFieldCustom

            name="leaveReason"

            title={t('jobSeeker:profile.fields.leaveReason')}

            placeholder={t('jobSeeker:profile.placeholders.leaveReason')}

            control={control}

          />

        </Grid>

      </Grid>

    </form>

  );

};

export default ExperienceDetailForm;
