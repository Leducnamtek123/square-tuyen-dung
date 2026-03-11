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
import Grid from "@mui/material/Grid2";

import { useTranslation } from 'react-i18next';

import errorHandling from '../../../../utils/errorHandling';
import { DATE_OPTIONS, REGEX_VATIDATE } from '../../../../configs/constants';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/controls/DatePickerCustom';

import commonService from '../../../../services/commonService';

const PersonalProfileForm = ({ handleUpdateProfile, editData }) => {
  const { t } = useTranslation(['jobSeeker']);
  const { allConfig } = useSelector((state) => state.config);
  const schema = yup.object().shape({
    user: yup.object().shape({
      fullName: yup
        .string()
        .required('Full name is required.')
        .max(100, 'Full name exceeds allowed length.'),
    }),
    phone: yup
      .string()
      .required('Phone number is required.')
      .matches(REGEX_VATIDATE.phoneRegExp, 'Invalid phone number.')
      .max(15, 'Phone number exceeds allowed length.'),
    birthday: yup
      .date()
      .transform((value, originalValue) => {
        if (originalValue) {
          return new Date(originalValue);
        }
        return value;
      })
      .required('Date of birth is required.')
      .typeError('Invalid date of birth.')
      .max(DATE_OPTIONS.yesterday, 'Invalid date of birth.'),
    gender: yup
      .string()
      .required('Gender is required.')
      .max(1, 'Gender exceeds allowed length.'),
    maritalStatus: yup
      .string()
      .required('Marital status is required.')
      .max(1, 'Marital status exceeds allowed length.'),
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
        .max(255, 'Address exceeds allowed length.'),
    }),
    idCardNumber: yup.string().max(30, 'ID card number exceeds allowed length.'),
    idCardIssueDate: yup.date().nullable(),
    idCardIssuePlace: yup.string().max(255, 'ID card issue place exceeds allowed length.'),
    taxCode: yup.string().max(30, 'Tax code exceeds allowed length.'),
    socialInsuranceNo: yup.string().max(30, 'Social insurance number exceeds allowed length.'),
    permanentAddress: yup.string().max(255, 'Permanent address exceeds allowed length.'),
    contactAddress: yup.string().max(255, 'Contact address exceeds allowed length.'),
    emergencyContactName: yup.string().max(100, 'Emergency contact name exceeds allowed length.'),
    emergencyContactPhone: yup.string().max(20, 'Emergency contact phone exceeds allowed length.'),
  });
  const [districtOptions, setDistrictOptions] = React.useState([]);

  const { control, setValue, reset, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  const cityId = useWatch({
    control,
    name: 'location.city',
  });

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      phone: editData?.phone || '',
      birthday: editData?.birthday,
      gender: editData?.gender || '',
      maritalStatus: editData?.maritalStatus || '',
      user: {
        fullName: editData.user?.fullName || '',
      },
      location: {
        city: editData.location?.city || '',
        district: editData.location?.district || '',
        address: editData.location?.address || '',
      },
      idCardNumber: editData?.idCardNumber || '',
      idCardIssueDate: editData?.idCardIssueDate || null,
      idCardIssuePlace: editData?.idCardIssuePlace || '',
      taxCode: editData?.taxCode || '',
      socialInsuranceNo: editData?.socialInsuranceNo || '',
      permanentAddress: editData?.permanentAddress || '',
      contactAddress: editData?.contactAddress || '',
      emergencyContactName: editData?.emergencyContactName || '',
      emergencyContactPhone: editData?.emergencyContactPhone || '',
    }));
  }, [editData, reset]);

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

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleUpdateProfile)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextFieldCustom
            name="user.fullName"
            title="Full Name"
            showRequired={true}
            placeholder="Enter full name"
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="phone"
            title="Phone Number"
            showRequired={true}
            placeholder="Enter phone number"
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <DatePickerCustom
            name="birthday"
            control={control}
            title="Date of Birth"
            showRequired={true}
            maxDate={DATE_OPTIONS.yesterday}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="gender"
            control={control}
            options={allConfig?.genderOptions || []}
            title="Gender"
            showRequired={true}
            placeholder="Select gender"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="maritalStatus"
            control={control}
            options={allConfig?.maritalStatusOptions || []}
            title="Marital Status"
            showRequired={true}
            placeholder="Select marital status"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
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
            sm: 6
          }}>
          <SingleSelectCustom
            options={districtOptions || []}
            name="location.district"
            control={control}
            title="District"
            showRequired={true}
            placeholder="Select district"
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="location.address"
            title="Address"
            showRequired={true}
            placeholder="Enter address"
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="idCardNumber"
            title={t('jobSeeker:profile.fields.idCardNumber')}
            placeholder={t('jobSeeker:profile.placeholders.idCardNumber')}
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <DatePickerCustom
            name="idCardIssueDate"
            control={control}
            title={t('jobSeeker:profile.fields.idCardIssueDate')}
            placeholder={t('jobSeeker:profile.placeholders.idCardIssueDate')}
            maxDate={DATE_OPTIONS.today}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="idCardIssuePlace"
            title={t('jobSeeker:profile.fields.idCardIssuePlace')}
            placeholder={t('jobSeeker:profile.placeholders.idCardIssuePlace')}
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="taxCode"
            title={t('jobSeeker:profile.fields.taxCode')}
            placeholder={t('jobSeeker:profile.placeholders.taxCode')}
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="socialInsuranceNo"
            title={t('jobSeeker:profile.fields.socialInsuranceNo')}
            placeholder={t('jobSeeker:profile.placeholders.socialInsuranceNo')}
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="permanentAddress"
            title={t('jobSeeker:profile.fields.permanentAddress')}
            placeholder={t('jobSeeker:profile.placeholders.permanentAddress')}
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="contactAddress"
            title={t('jobSeeker:profile.fields.contactAddress')}
            placeholder={t('jobSeeker:profile.placeholders.contactAddress')}
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="emergencyContactName"
            title={t('jobSeeker:profile.fields.emergencyContactName')}
            placeholder={t('jobSeeker:profile.placeholders.emergencyContactName')}
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="emergencyContactPhone"
            title={t('jobSeeker:profile.fields.emergencyContactPhone')}
            placeholder={t('jobSeeker:profile.placeholders.emergencyContactPhone')}
            control={control}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default PersonalProfileForm;
