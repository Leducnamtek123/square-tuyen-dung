import React from 'react';

import { useSelector } from 'react-redux';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import Grid from "@mui/material/Grid2";

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';

import RadioCustom from '../../../../components/controls/RadioCustom';

const JobPostNotificationForm = ({ handleAddOrUpdate, editData }) => {

  const { allConfig } = useSelector((state) => state.config);

  const schema = yup.object().shape({

    jobName: yup

      .string()

      .required('Keyword is required.')

      .max(200, 'Keyword is too long.'),

    career: yup

      .number()

      .required('Career is required.')

      .typeError('Career is required.'),

    city: yup

      .number()

      .required('City/Province is required.')

      .typeError('City/Province is required.'),

    position: yup.number().notRequired().nullable(),

    experience: yup.number().notRequired().nullable(),

    salary: yup

      .number()

      .nullable()

      .typeError('Invalid desired salary.')

      .transform((value, originalValue) => {

        if (originalValue === '') {

          return null;

        }

        return value;

      }),

  });

  const {

    control,

    reset,

    handleSubmit,

  } = useForm({

    defaultValues: {

      frequency:

        (allConfig?.frequencyNotificationOptions || []).length > 0

          ? allConfig?.frequencyNotificationOptions[0].id

          : null,

    },

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

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>

      <Grid container spacing={2}>

        <Grid size={12}>

          <TextFieldCustom

            name="jobName"

            title="Keyword"

            showRequired={true}

            placeholder="Enter job name or related keywords you are searching for."

            control={control}

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 6,

            lg: 6,

            xl: 6

          }}>

          <SingleSelectCustom

            name="career"

            control={control}

            options={allConfig?.careerOptions || []}

            title="Career"

            showRequired={true}

            placeholder="Select career"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 6,

            lg: 6,

            xl: 6

          }}>

          <SingleSelectCustom

            name="city"

            control={control}

            options={allConfig?.cityOptions || []}

            title="City/Province"

            showRequired={true}

            placeholder="Select city/province"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 6,

            lg: 6,

            xl: 6

          }}>

          <SingleSelectCustom

            name="position"

            control={control}

            options={allConfig?.positionOptions || []}

            title="Position/Level"

            placeholder="Select position/level"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 6,

            lg: 6,

            xl: 6

          }}>

          <SingleSelectCustom

            name="experience"

            control={control}

            options={allConfig?.experienceOptions || []}

            title="Experience"

            placeholder="Select required experience"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 6,

            lg: 6,

            xl: 6

          }}>

          <TextFieldCustom

            name="salary"

            title="Desired Salary"

            placeholder="Enter your desired salary"

            control={control}

            type="number"

          />

        </Grid>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 6,

            lg: 6,

            xl: 6

          }}>

          <RadioCustom

            name="frequency"

            control={control}

            options={allConfig?.frequencyNotificationOptions || []}

            title="Notification Frequency"

          />

        </Grid>

      </Grid>

    </form>

  );

};

export default JobPostNotificationForm;
