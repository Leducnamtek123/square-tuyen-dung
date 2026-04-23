import React from 'react';

import { useForm } from 'react-hook-form';

import { typedYupResolver } from '../../../../utils/formHelpers';

import * as yup from 'yup';

import { Grid2 as Grid } from "@mui/material";

import { useTranslation } from 'react-i18next';

import { DATE_OPTIONS } from '../../../../configs/constants';

import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';

import MultilineTextFieldCustom from '../../../../components/Common/Controls/MultilineTextFieldCustom';

import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import type { Control as ReactHookFormControl } from 'react-hook-form';
import type { FieldValues as ReactHookFormFieldValues } from 'react-hook-form';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface FormValues {
  degreeName: string;
  major: string;
  trainingPlaceName: string;
  startDate: Date | null;
  completedDate: Date | null;
  gradeOrRank: string | null;
  description: string | null;
}

interface EducationDetailFormProps {
  handleAddOrUpdate: (data: FormValues) => void;
  editData: Partial<FormValues> | null;
}

const getDefaultValues = (editData: Partial<FormValues> | null): FormValues => ({
  degreeName: '',
  major: '',
  trainingPlaceName: '',
  startDate: null,
  completedDate: null,
  gradeOrRank: null,
  description: null,
  ...(editData || {}),
});

const EducationDetailFormContent = ({ handleAddOrUpdate, editData }: EducationDetailFormProps) => {

  const { t } = useTranslation(['jobSeeker']);

  const schema = yup.object().shape({

    degreeName: yup

      .string()

      .required(t('jobSeeker:profile.validation.degreeNameRequired'))

      .max(200, t('jobSeeker:profile.validation.degreeNameMax')),

    major: yup

      .string()

      .required(t('jobSeeker:profile.validation.majorRequired'))

      .max(255, t('jobSeeker:profile.validation.majorMax')),

    trainingPlaceName: yup

      .string()

      .required(t('jobSeeker:profile.validation.trainingPlaceRequired'))

      .max(255, t('jobSeeker:profile.validation.trainingPlaceMax')),

    startDate: yup

      .date()

      .required(t('jobSeeker:profile.validation.startDateRequired'))

      .typeError(t('jobSeeker:profile.validation.startDateRequired')),

    completedDate: yup.date().nullable(),

    gradeOrRank: yup.string().max(100, t('jobSeeker:profile.validation.gradeOrRankMax')),

  });

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: getDefaultValues(editData),
    resolver: typedYupResolver(schema),

  });

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>

      <Grid container spacing={2}>

        <Grid size={12}>

          <TextFieldCustom

            name="degreeName"

            title={t('jobSeeker:profile.fields.degreeName')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.degreeName')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="major"

            title={t('jobSeeker:profile.fields.major')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.major')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="trainingPlaceName"

            title={t('jobSeeker:profile.fields.trainingPlace')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.trainingPlace')}

            control={control}

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

            name="completedDate"

            control={control}

            title={t('jobSeeker:profile.fields.completedDate')}

            maxDate={DATE_OPTIONS.today()}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="gradeOrRank"

            title={t('jobSeeker:profile.fields.gradeOrRank')}

            placeholder={t('jobSeeker:profile.placeholders.gradeOrRank')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <MultilineTextFieldCustom

            name="description"

            title={t('jobSeeker:profile.fields.additionalDescription')}

            placeholder={t('jobSeeker:profile.placeholders.additionalDescription')}

            control={control}

          />

        </Grid>

      </Grid>

    </form>

  );

};

const EducationDetailForm = (props: EducationDetailFormProps) => {
  const formKey = React.useMemo(() => JSON.stringify(props.editData || {}), [props.editData]);

  return <EducationDetailFormContent key={formKey} {...props} />;
};

export default EducationDetailForm;
