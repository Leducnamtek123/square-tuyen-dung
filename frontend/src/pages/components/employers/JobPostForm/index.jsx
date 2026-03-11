/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { DATE_OPTIONS, REGEX_VATIDATE } from '../../../../configs/constants';
import useDebounce from '../../../../hooks/useDebounce';
import errorHandling from '../../../../utils/errorHandling';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/controls/DatePickerCustom';
import CheckboxCustom from '../../../../components/controls/CheckboxCustom';
import commonService from '../../../../services/commonService';
import RichTextEditorCustom from '../../../../components/controls/RichTextEditorCustom';
import TextFieldAutoCompleteCustom from '../../../../components/controls/TextFieldAutoCompleteCustom';

import goongService from '../../../../services/goongService';

const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }) => {
  const { allConfig } = useSelector((state) => state.config);
  const [districtOptions, setDistrictOptions] = React.useState([]);
  const [locationOptions, setLocationOptions] = React.useState([]);

  const schema = yup.object().shape({
    jobName: yup
      .string()
      .required('Job name is required.')
      .max(200, 'Job name exceeded allowed length.'),
    career: yup
      .number()
      .required('Career is required.')
      .typeError('Career is required.'),
    position: yup
      .number()
      .required('Position is required.')
      .typeError('Position is required.'),
    experience: yup
      .number()
      .required('Experience is required.')
      .typeError('Experience is required.'),
    typeOfWorkplace: yup
      .number()
      .required('Workplace is required.')
      .typeError('Workplace is required.'),
    jobType: yup
      .number()
      .required('Job type is required.')
      .typeError('Job type is required.'),
    quantity: yup
      .number()
      .required('Number of vacancies is required.')
      .typeError('Invalid number of vacancies.')
      .min(1, 'At least one vacancy is required.'),
    genderRequired: yup
      .string()
      .required('Gender requirement is required.')
      .typeError('Gender requirement is required.'),
    salaryMin: yup
      .number()
      .required('Minimum salary is required.')
      .typeError('Invalid minimum salary.')
      .min(0, 'Invalid minimum salary.')
      .test(
        'minimum-wage-comparison',
        'Minimum salary must be less than maximum salary.',
        function (value) {
          return !(value >= this.parent.salaryMax);
        }
      ),
    salaryMax: yup
      .number()
      .required('Maximum salary is required.')
      .typeError('Invalid maximum salary.')
      .min(0, 'Invalid maximum salary.')
      .test(
        'maximum-wage-comparison',
        'Maximum salary must be greater than minimum salary.',
        function (value) {
          return !(value <= this.parent.salaryMin);
        }
      ),
    academicLevel: yup
      .number()
      .required('Academic level is required.')
      .typeError('Academic level is required.'),
    deadline: yup
      .date()
      .required('Application deadline is required.')
      .typeError('Invalid application deadline.')
      .min(new Date() + 1, 'Deadline must be after today.'),
    jobDescription: yup
      .mixed()
      .test(
        'editorContent',
        'Job description is required.',
        (value) => value?.getCurrentContent?.()?.hasText?.()
      ),
    jobRequirement: yup
      .mixed()
      .test(
        'editorContent',
        'Job requirement is required.',
        (value) => value?.getCurrentContent?.()?.hasText?.()
      ),
    benefitsEnjoyed: yup
      .mixed()
      .test(
        'editorContent',
        'Benefits are required.',
        (value) => value?.getCurrentContent?.()?.hasText?.()
      ),
    location: yup.object().shape({
      city: yup
        .number()
        .required('City/Province is required.')
        .typeError('City/Province is required.'),
      district: yup
        .number()
        .required('District is required.')
        .typeError('District is required.'),
      address: yup
        .string()
        .required('Address is required.')
        .max(255, 'Address exceeded allowed length.'),
      lat: yup
        .number()
        .required('Latitude is required.')
        .typeError('Invalid latitude.'),
      lng: yup
        .number()
        .required('Longitude is required.')
        .typeError('Invalid longitude.'),
    }),
    contactPersonName: yup
      .string()
      .required('Contact person name is required.')
      .max(100, 'Contact person name exceeded allowed length.'),
    contactPersonPhone: yup
      .string()
      .required('Contact person phone is required.')
      .matches(REGEX_VATIDATE.phoneRegExp, 'Invalid phone number.')
      .max(15, 'Contact person phone exceeded allowed length.'),
    contactPersonEmail: yup
      .string()
      .required('Contact person email is required.')
      .email('Invalid email.')
      .max(100, 'Contact person email exceeded allowed length.'),
    isUrgent: yup.boolean().default(false),
  });

  const { control, reset, setValue, setError, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const cityId = useWatch({
    control,
    name: 'location.city',
  });

  const address = useWatch({
    control,
    name: 'location.address',
  });

  const addressDebounce = useDebounce(address, 500);

  React.useEffect(() => {
    const loadDistricts = async (cityId) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);

        if (districtOptions.length > 0) setValue('location.district', '');
        setDistrictOptions(resData.data);
      } catch (error) {
        errorHandling(error);
      } finally {
      }
    };

    if (cityId) {
      loadDistricts(cityId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, setValue]);

  React.useEffect(() => {
    const loadLocation = async (input) => {
      try {
        const resData = await goongService.getPlaces(input);

        if (resData.predictions) setLocationOptions(resData.predictions);
      } catch (error) {}
    };

    loadLocation(addressDebounce);
  }, [addressDebounce]);

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

  const handleSelectLocation = async (e, value) => {
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(
        value.place_id
      );
      setValue('location.lat', resData?.result?.geometry.location.lat || '');
      setValue('location.lng', resData?.result?.geometry.location.lng || '');
    } catch (error) {}
  };

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Alert severity="warning">
            When you update the post, it will be pending approval!
          </Alert>
        </Grid>

        <Grid size={12}>
          <TextFieldCustom
            name="jobName"
            title="Job Title"
            showRequired={true}
            placeholder="Enter job title"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <SingleSelectCustom
            name="career"
            control={control}
            options={allConfig?.careerOptions || []}
            title="Career"
            showRequired={true}
            placeholder="Select career"
          />
        </Grid>
        <Grid size={6}>
          <SingleSelectCustom
            name="position"
            control={control}
            options={allConfig?.positionOptions || []}
            title="Position"
            showRequired={true}
            placeholder="Select position"
          />
        </Grid>
        <Grid size={6}>
          <SingleSelectCustom
            name="experience"
            control={control}
            options={allConfig?.experienceOptions || []}
            title="Experience"
            showRequired={true}
            placeholder="Select required experience"
          />
        </Grid>
        <Grid size={6}>
          <SingleSelectCustom
            name="typeOfWorkplace"
            control={control}
            options={allConfig?.typeOfWorkplaceOptions || []}
            title="Workplace"
            showRequired={true}
            placeholder="Select workplace"
          />
        </Grid>
        <Grid size={6}>
          <SingleSelectCustom
            name="jobType"
            control={control}
            options={allConfig?.jobTypeOptions || []}
            title="Job Type"
            showRequired={true}
            placeholder="Select job type"
          />
        </Grid>
        <Grid size={6}>
          <TextFieldCustom
            name="quantity"
            title="Number of Vacancies"
            showRequired={true}
            placeholder="Enter number of vacancies"
            control={control}
            type="number"
          />
        </Grid>
        <Grid size={6}>
          <SingleSelectCustom
            name="genderRequired"
            control={control}
            options={allConfig?.genderOptions || []}
            title="Gender Requirement"
            showRequired={true}
            placeholder="Select gender requirement"
          />
        </Grid>
        <Grid size={6}>
          <TextFieldCustom
            name="salaryMin"
            title="Minimum Salary"
            showRequired={true}
            placeholder="Enter minimum salary"
            control={control}
            type="number"
          />
        </Grid>
        <Grid size={6}>
          <TextFieldCustom
            name="salaryMax"
            title="Maximum Salary"
            showRequired={true}
            placeholder="Enter maximum salary"
            control={control}
            type="number"
          />
        </Grid>
        <Grid size={6}>
          <SingleSelectCustom
            name="academicLevel"
            control={control}
            options={allConfig?.academicLevelOptions || []}
            title="Academic Level"
            showRequired={true}
            placeholder="Select academic level"
          />
        </Grid>
        <Grid size={6}>
          <DatePickerCustom
            name="deadline"
            control={control}
            showRequired={true}
            title="Application Deadline"
            minDate={DATE_OPTIONS.tomorrow}
          />
        </Grid>
        <Grid size={12}>
          <RichTextEditorCustom
            name="jobDescription"
            control={control}
            title="Job Description"
            showRequired={true}
          />
        </Grid>
        <Grid size={12}>
          <RichTextEditorCustom
            name="jobRequirement"
            control={control}
            title="Job Requirement"
            showRequired={true}
          />
        </Grid>
        <Grid size={12}>
          <RichTextEditorCustom
            name="benefitsEnjoyed"
            control={control}
            title="Benefits"
            showRequired={true}
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
            name="location.city"
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
            name="location.district"
            control={control}
            options={districtOptions}
            title="District"
            showRequired={true}
            placeholder="Select district"
          />
        </Grid>
        <Grid size={12}>
          <TextFieldAutoCompleteCustom
            name="location.address"
            title="Address"
            showRequired={true}
            placeholder="Enter address"
            control={control}
            options={locationOptions}
            loading={true}
            handleSelect={handleSelectLocation}
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
            name="location.lat"
            title="Latitude"
            showRequired={true}
            placeholder="Enter latitude coordinate of the company on the map."
            helperText="Automatically filled if you choose a suggested address."
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
          <TextFieldCustom
            name="location.lng"
            title="Longitude"
            showRequired={true}
            placeholder="Enter longitude coordinate of the company on the map."
            helperText="Automatically filled if you choose a suggested address."
            control={control}
            type="number"
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="contactPersonName"
            title="Contact Person Name"
            showRequired={true}
            placeholder="Enter contact person name"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="contactPersonPhone"
            title="Contact Person Phone"
            showRequired={true}
            placeholder="Enter contact person phone"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="contactPersonEmail"
            title="Contact Person Email"
            showRequired={true}
            placeholder="Enter contact person email"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <CheckboxCustom name="isUrgent" control={control} title="Urgent" />
        </Grid>
      </Grid>
    </form>
  );
};

export default JobPostForm;
