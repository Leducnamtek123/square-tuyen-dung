import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid2 as Grid } from "@mui/material";
import { EditorState } from 'draft-js';

import errorHandling from '../../../../utils/errorHandling';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import commonService from '../../../../services/commonService';
import useDebounce from '../../../../hooks/useDebounce';
import goongService from '../../../../services/goongService';

import CompanyFormLoading from './CompanyFormLoading';
import CompanyFormFields from './CompanyFormFields';
import { useConfig } from '@/hooks/useConfig';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { Resolver } from 'react-hook-form';
import type { SelectOption } from '../../../../types/models';

export interface CompanyFormValues {
  companyName: string;
  taxCode: string;
  employeeSize: number;
  fieldOperation: string;
  location: { city: number; district: number; address: string; lat: number; lng: number };
  since?: Date | null;
  companyEmail: string;
  companyPhone: string;
  description?: EditorState;
}

interface CompanyFormProps {
  handleUpdate: (data: CompanyFormValues) => void;
  editData: Partial<CompanyFormValues> | null;
  serverErrors?: Record<string, string[]> | null;
}

const CompanyForm = ({ handleUpdate, editData, serverErrors = null }: CompanyFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<Record<string, unknown>[]>([]);

  const schema = yup.object().shape({
    companyName: yup.string().required(t('jobPostForm.validation.jobnameisrequired', 'Company name is required.')).max(255, t('jobPostForm.validation.jobnameexceededallowedlength', 'Company name exceeded allowed length.')),
    taxCode: yup.string().required(t('companyForm.placeholder.entercompanytaxcode', 'Tax code is required.')).max(30, t('jobPostForm.validation.jobnameexceededallowedlength', 'Tax code exceeded allowed length.')),
    employeeSize: yup.number().required(t('companyForm.placeholder.selectcompanysize', 'Company size is required.')).typeError(t('companyForm.placeholder.selectcompanysize', 'Company size is required.')),
    fieldOperation: yup.string().required(t('companyForm.placeholder.entercompanyfieldofoperation', 'Field of operation is required.')).max(255, t('jobPostForm.validation.jobnameexceededallowedlength', 'Field of operation exceeded allowed length.')),
    location: yup.object().shape({
      city: yup.number().required(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')).typeError(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')),
      district: yup.number().required(t('jobPostForm.validation.districtisrequired', 'District is required.')).typeError(t('jobPostForm.validation.districtisrequired', 'District is required.')),
      address: yup.string().required(t('jobPostForm.validation.addressisrequired', 'Address is required.')).max(255, t('jobPostForm.validation.addressexceededallowedlength', 'Address exceeded allowed length.')),
      lat: yup.number().required(t('jobPostForm.validation.latitudeisrequired', 'Latitude is required.')).typeError(t('jobPostForm.validation.invalidlatitude', 'Invalid latitude.')),
      lng: yup.number().required(t('jobPostForm.validation.longitudeisrequired', 'Longitude is required.')).typeError(t('jobPostForm.validation.invalidlongitude', 'Invalid longitude.')),
    }),
    since: yup.date().nullable(),
    companyEmail: yup.string().required(t('jobPostForm.validation.contactpersonemailisrequired', 'Company email is required.')).email(t('jobPostForm.validation.invalidemail', 'Invalid email.')).max(100, t('jobPostForm.validation.jobnameexceededallowedlength', 'Company email exceeded allowed length.')),
    companyPhone: yup.string().required(t('jobPostForm.validation.contactpersonphoneisrequired', 'Company phone is required.')).matches(REGEX_VALIDATE.phoneRegExp, t('jobPostForm.validation.invalidphonenumber', 'Invalid phone number.')).max(15, t('jobPostForm.validation.jobnameexceededallowedlength', 'Company phone exceeded allowed length.')),
    description: yup.mixed().notRequired(),
  });

  const { control, reset, setValue, setError, clearErrors, handleSubmit } = useForm<CompanyFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<CompanyFormValues>,
    defaultValues: {
      description: EditorState.createEmpty(),
      location: { city: '' as unknown as number, district: '' as unknown as number, address: '', lat: '' as unknown as number, lng: '' as unknown as number },
    },
  });

  const cityId = useWatch({ control, name: 'location.city' });
  const address = useWatch({ control, name: 'location.address' });
  const addressDebounce = useDebounce(address, 500);

  const prevCityIdRef = React.useRef<number | string | null>(null);

  React.useEffect(() => {
    const loadDistricts = async (cityId: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        // Only clear district if the cityId has actually changed (user interaction)
        // and it's not the initial load (prevCityIdRef.current is not null).
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== cityId) {
          setValue('location.district', '' as unknown as number);
        }
        setDistrictOptions((resData as unknown as { data: SelectOption[] })?.data || []);
        prevCityIdRef.current = cityId;
      } catch (error) {
        errorHandling(error as AxiosError<{ errors?: ApiError }>);
      }
    };
    if (cityId) {
      loadDistricts(cityId);
    }
  }, [cityId, setValue]);

  React.useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if ((resData as Record<string, unknown>).predictions) setLocationOptions((resData as Record<string, unknown>).predictions as Record<string, unknown>[]);
      } catch (error) {
        errorHandling(error as AxiosError<{ errors?: ApiError }>);
      }
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  React.useEffect(() => {
    if (editData !== null) {
      reset((formValues) => ({ ...formValues, ...(editData as unknown as Partial<CompanyFormValues>) }));
    } else {
      reset();
    }
  }, [editData, reset]);

  React.useEffect(() => {
    if (serverErrors !== null) {
      for (let err in serverErrors) {
        setError(err as keyof CompanyFormValues, { type: 'manual', message: serverErrors[err]?.join(' ') });
      }
    } else {
      clearErrors();
    }
  }, [serverErrors, setError, clearErrors]);

  const handleSelectLocation = async (e: React.SyntheticEvent, value: Record<string, unknown> | null) => {
    if (!value || typeof value !== 'object' || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id as string);
      const resultObj = (resData as Record<string, unknown>)?.result as Record<string, unknown> | undefined;
      const geometryObj = resultObj?.geometry as Record<string, unknown> | undefined;
      if (!geometryObj?.location) return;
      const location = geometryObj.location as Record<string, unknown>;
      setValue('location.lat', location.lat as number);
      setValue('location.lng', location.lng as number);
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    }
  };

  return (
    <form id="company-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 10, xl: 10 }}>
          <CompanyFormFields
            control={control}
            t={t}
            allConfig={allConfig}
            districtOptions={districtOptions}
            locationOptions={locationOptions}
            handleSelectLocation={handleSelectLocation}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default CompanyForm;
