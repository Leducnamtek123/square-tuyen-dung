import React from 'react';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/hooks/useConfig';
import type { TFunction } from 'i18next';
import PersonalProfileFormFields from './PersonalProfileFormFields';
import { usePersonalProfileDistrictOptions } from './usePersonalProfileDistrictOptions';
import type { PersonalProfileFormProps, PersonalProfileFormValues } from './types';
export type { PersonalProfileFormProps, PersonalProfileFormValues } from './types';
import { DATE_OPTIONS, REGEX_VALIDATE } from '../../../../configs/constants';

const createPersonalProfileSchema = (t: TFunction) =>
  yup.object().shape({
    user: yup.object().shape({
      fullName: yup
        .string()
        .required(t('jobSeeker:profile.validation.fullNameRequired'))
        .max(100, t('jobSeeker:profile.validation.fullNameMax')),
    }),
    phone: yup
      .string()
      .required(t('jobSeeker:profile.validation.phoneRequired'))
      .matches(REGEX_VALIDATE.phoneRegExp, t('jobSeeker:profile.validation.phoneInvalid'))
      .max(15, t('jobSeeker:profile.validation.phoneMax')),
    birthday: yup
      .date()
      .transform((value, originalValue) => (originalValue ? new Date(originalValue) : value))
      .required(t('jobSeeker:profile.validation.birthdayRequired'))
      .typeError(t('jobSeeker:profile.validation.birthdayInvalid'))
      .max(DATE_OPTIONS.yesterday(), t('jobSeeker:profile.validation.birthdayInvalid')),
    gender: yup
      .string()
      .required(t('jobSeeker:profile.validation.genderRequired'))
      .max(1, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.gender') })),
    maritalStatus: yup
      .string()
      .required(t('jobSeeker:profile.validation.maritalStatusRequired'))
      .max(1, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.maritalStatus') })),
    location: yup.object().shape({
      city: yup.number().required(t('jobSeeker:profile.validation.cityRequired')).typeError(t('jobSeeker:profile.validation.cityRequired')),
      district: yup.number().required(t('jobSeeker:profile.validation.districtRequired')).typeError(t('jobSeeker:profile.validation.districtRequired')),
      address: yup.string().required(t('jobSeeker:profile.validation.addressRequired')).max(255, t('jobSeeker:profile.validation.addressMax')),
    }),
    idCardNumber: yup.string().max(30, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.idCardNumber') })),
    idCardIssueDate: yup.date().nullable(),
    idCardIssuePlace: yup.string().max(255, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.idCardIssuePlace') })),
    taxCode: yup.string().max(30, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.taxCode') })),
    socialInsuranceNo: yup.string().max(30, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.socialInsuranceNo') })),
    permanentAddress: yup.string().max(255, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.permanentAddress') })),
    contactAddress: yup.string().max(255, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.contactAddress') })),
    emergencyContactName: yup.string().max(100, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.emergencyContactName') })),
    emergencyContactPhone: yup.string().max(20, t('jobSeeker:profile.validation.fieldMax', { field: t('jobSeeker:profile.fields.emergencyContactPhone') })),
  });

const PersonalProfileForm = ({ handleUpdateProfile, editData }: PersonalProfileFormProps) => {
  const { t } = useTranslation(['jobSeeker']);
  const { allConfig } = useConfig();
  const schema = React.useMemo(() => createPersonalProfileSchema(t), [t]);

  const { control, reset, handleSubmit } = useForm<PersonalProfileFormValues>({
    resolver: typedYupResolver<PersonalProfileFormValues>(schema),
  });

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      phone: editData?.phone || '',
      birthday: editData?.birthday === undefined ? null : editData.birthday,
      gender: editData?.gender || '',
      maritalStatus: editData?.maritalStatus || '',
      user: { fullName: editData?.user?.fullName || '' },
      location: {
        city: editData?.location?.city || '',
        district: editData?.location?.district || '',
        address: editData?.location?.address || '',
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

  const districtOptions = usePersonalProfileDistrictOptions(control);

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleUpdateProfile)}>
      <PersonalProfileFormFields control={control} allConfig={allConfig} districtOptions={districtOptions} t={t} />
    </form>
  );
};

export default PersonalProfileForm;
