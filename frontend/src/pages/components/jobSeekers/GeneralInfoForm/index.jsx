import React from 'react';

import { useSelector } from 'react-redux';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import Grid from "@mui/material/Grid2";

import { useTranslation } from 'react-i18next';

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

import MultilineTextFieldCustom from '../../../../components/controls/MultilineTextFieldCustom';

import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';

const GeneralInfoForm = ({ handleUpdate, editData }) => {

  const { t } = useTranslation(['jobSeeker']);

  const { allConfig } = useSelector((state) => state.config);

  const schema = yup.object().shape({

    title: yup

      .string()

      .required(t('jobSeeker:profile.validation.desiredPositionRequired'))

      .max(200, t('jobSeeker:profile.validation.desiredPositionMax')),

    position: yup

      .number()

      .required(t('jobSeeker:profile.validation.desiredLevelRequired'))

      .typeError(t('jobSeeker:profile.validation.desiredLevelRequired')),

    academicLevel: yup

      .number()

      .required(t('jobSeeker:profile.validation.academicLevelRequired'))

      .typeError(t('jobSeeker:profile.validation.academicLevelRequired')),

    experience: yup

      .number()

      .required(t('jobSeeker:profile.validation.experienceRequired'))

      .typeError(t('jobSeeker:profile.validation.experienceRequired')),

    career: yup

      .number()

      .required(t('jobSeeker:profile.validation.careerRequired'))

      .typeError(t('jobSeeker:profile.validation.careerRequired')),

    city: yup

      .number()

      .required(t('jobSeeker:profile.validation.cityRequired'))

      .typeError(t('jobSeeker:profile.validation.cityRequired')),

    salaryMin: yup

      .number()

      .required(t('jobSeeker:profile.validation.salaryMinRequired'))

      .typeError(t('jobSeeker:profile.validation.salaryMinInvalid'))

      .min(0, t('jobSeeker:profile.validation.salaryMinInvalid'))

      .test(

        'minimum-wage-comparison',

        t('jobSeeker:profile.validation.salaryMinComparison'),

        function (value) {

          return !(value >= this.parent.salaryMax);

        }

      ),

    salaryMax: yup

      .number()

      .required(t('jobSeeker:profile.validation.salaryMaxRequired'))

      .typeError(t('jobSeeker:profile.validation.salaryMaxInvalid'))

      .min(0, t('jobSeeker:profile.validation.salaryMaxInvalid'))

      .test(

        'maximum-wage-comparison',

        t('jobSeeker:profile.validation.salaryMaxComparison'),

        function (value) {

          return !(value <= this.parent.salaryMin);

        }

      ),

    expectedSalary: yup.number().nullable().min(0, t('jobSeeker:profile.validation.expectedSalaryInvalid')),

    typeOfWorkplace: yup

      .number()

      .required(t('jobSeeker:profile.validation.workplaceTypeRequired'))

      .typeError(t('jobSeeker:profile.validation.workplaceTypeRequired')),

    jobType: yup

      .number()

      .required(t('jobSeeker:profile.validation.jobTypeRequired'))

      .typeError(t('jobSeeker:profile.validation.jobTypeRequired')),

    description: yup

      .string()

      .required(t('jobSeeker:profile.validation.objectiveRequired'))

      .max(800, t('jobSeeker:profile.validation.objectiveMax')),

    skillsSummary: yup

      .string()

      .max(2000, t('jobSeeker:profile.validation.skillsSummaryMax')),

  });

  const { control, reset, handleSubmit } = useForm({

    resolver: yupResolver(schema),

  });

  React.useEffect(() => {

    reset((formValues) => ({

      ...formValues,

      title: editData.title || '',

      position: editData?.position || '',

      academicLevel: editData?.academicLevel || '',

      experience: editData?.experience || '',

      career: editData?.career || '',

      city: editData?.city || '',

      salaryMin: editData?.salaryMin || '',

      salaryMax: editData?.salaryMax || '',

      expectedSalary: editData?.expectedSalary || '',

      typeOfWorkplace: editData?.typeOfWorkplace || '',

      jobType: editData?.jobType || '',

      description: editData?.description || '',

      skillsSummary: editData?.skillsSummary || '',

    }));

  }, [editData, reset]);

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleUpdate)}>

      <Grid container spacing={2}>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <TextFieldCustom

            name="title"

            showRequired={true}

            title={t('jobSeeker:profile.fields.desiredPosition')}

            placeholder={t('jobSeeker:profile.placeholders.desiredPosition')}

            control={control}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="position"

            control={control}

            options={allConfig?.positionOptions || []}

            title={t('jobSeeker:profile.fields.desiredLevel')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectLevel')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="academicLevel"

            control={control}

            options={allConfig?.academicLevelOptions || []}

            title={t('jobSeeker:profile.fields.academicLevel')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectAcademicLevel')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="experience"

            control={control}

            options={allConfig?.experienceOptions || []}

            title={t('jobSeeker:profile.fields.experience')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectExperience')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="career"

            control={control}

            options={allConfig?.careerOptions || []}

            title={t('jobSeeker:profile.fields.career')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectCareer')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="city"

            control={control}

            options={allConfig?.cityOptions || []}

            title={t('jobSeeker:profile.fields.city')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectCity')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <TextFieldCustom

            name="salaryMin"

            title={t('jobSeeker:profile.fields.salaryMin')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.salaryMin')}

            control={control}

            icon={'VND'}

            type="number"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <TextFieldCustom

            name="salaryMax"

            title={t('jobSeeker:profile.fields.salaryMax')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.salaryMax')}

            control={control}

            icon={'VND'}

            type="number"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <TextFieldCustom

            name="expectedSalary"

            title={t('jobSeeker:profile.fields.expectedSalary')}

            placeholder={t('jobSeeker:profile.placeholders.expectedSalary')}

            control={control}

            icon={'VND'}

            type="number"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="typeOfWorkplace"

            control={control}

            options={allConfig?.typeOfWorkplaceOptions || []}

            title={t('jobSeeker:profile.fields.workplaceType')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectWorkplaceType')}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 6

          }}>

          <SingleSelectCustom

            name="jobType"

            control={control}

            options={allConfig?.jobTypeOptions || []}

            title={t('jobSeeker:profile.fields.jobType')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.selectJobType')}

          />

        </Grid>

        <Grid size={12}>

          <MultilineTextFieldCustom

            name="description"

            title={t('jobSeeker:profile.fields.objective')}

            showRequired={true}

            placeholder={t('jobSeeker:profile.placeholders.objective')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <MultilineTextFieldCustom

            name="skillsSummary"

            title={t('jobSeeker:profile.fields.skillsSummary')}

            placeholder={t('jobSeeker:profile.placeholders.skillsSummary')}

            control={control}

          />

        </Grid>

      </Grid>

    </form>

  );

};

export default GeneralInfoForm;
