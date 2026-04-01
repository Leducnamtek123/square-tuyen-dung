import React from 'react';
import { useAppSelector } from '@/redux/hooks';

import { useForm, useWatch } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { Grid2 as Grid } from "@mui/material";

import { useTranslation } from 'react-i18next';

import errorHandling from '../../../../utils/errorHandling';

import { DATE_OPTIONS, REGEX_VALIDATE } from '../../../../configs/constants';

import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';

import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';

import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';

import commonService from '../../../../services/commonService';
import { useConfig } from '@/hooks/useConfig';
import type { SelectOption } from '@/types/models';
import type { AxiosError } from 'axios';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface PersonalProfileFormValues {
  user: {
    fullName: string;
  };
  phone: string;
  birthday: Date | string | null;
  gender: string;
  maritalStatus: string;
  location: {
    city: number | string;
    district: number | string;
    address: string;
  };
  idCardNumber?: string;
  idCardIssueDate?: Date | null;
  idCardIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNo?: string;
  permanentAddress?: string;
  contactAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface PersonalProfileFormProps {
  handleUpdateProfile: (data: PersonalProfileFormValues) => void;
  editData: Partial<PersonalProfileFormValues> | null;
}



const PersonalProfileForm = ({ handleUpdateProfile, editData }: PersonalProfileFormProps) => {

  const { t } = useTranslation(['jobSeeker']);

  const { allConfig } = useConfig();

  const schema = yup.object().shape({

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

      .transform((value, originalValue) => {

        if (originalValue) {

          return new Date(originalValue);

        }

        return value;

      })

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

      city: yup

        .number()

        .required(t('jobSeeker:profile.validation.cityRequired'))

        .typeError(t('jobSeeker:profile.validation.cityRequired')),

      district: yup

        .number()

        .required(t('jobSeeker:profile.validation.districtRequired'))

        .typeError(t('jobSeeker:profile.validation.districtRequired')),

      address: yup

        .string()

        .required(t('jobSeeker:profile.validation.addressRequired'))

        .max(255, t('jobSeeker:profile.validation.addressMax')),

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

  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);

  const { control, setValue, reset, handleSubmit } = useForm<PersonalProfileFormValues>({

    resolver: yupResolver(schema) as unknown as ReactHookFormResolver<PersonalProfileFormValues>,

  });

  const cityId = useWatch({

    control,

    name: 'location.city',

  });

  React.useEffect(() => {

    reset((formValues) => ({

      ...formValues,

      phone: editData?.phone || '',

      birthday: editData?.birthday === undefined ? null : editData.birthday,

      gender: editData?.gender || '',

      maritalStatus: editData?.maritalStatus || '',

      user: {

        fullName: editData?.user?.fullName || '',

      },

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

  const prevCityIdRef = React.useRef<string | number | null>(null);
  React.useEffect(() => {
    const loadDistricts = async (id: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(id) as unknown as SelectOption[];
        // Only clear district if the cityId has actually changed (user interaction)
        // and it's not the initial load (prevCityIdRef.current is not null).
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== id) {
          setValue('location.district', '');
        }
        setDistrictOptions(resData);
        prevCityIdRef.current = id;
      } catch (error) {
        errorHandling(error as AxiosError<Record<string, unknown>>);
      }
    };
    if (cityId) {
      loadDistricts(cityId);
    }
  }, [cityId, setValue]);

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleUpdateProfile)}>

      <Grid container spacing={2}>

        <Grid size={12}>
          <TextFieldCustom
            name="user.fullName"
            title={t('jobSeeker:profile.fields.fullName')}
            showRequired={true}
            placeholder={t('jobSeeker:profile.placeholders.fullName')}
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

            maxDate={DATE_OPTIONS.yesterday()}

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

            maxDate={DATE_OPTIONS.today()}

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
