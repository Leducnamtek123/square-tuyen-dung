import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid2 as Grid } from "@mui/material";
import { EditorState } from 'draft-js';

import errorHandling from '../../../../utils/errorHandling';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import commonService from '../../../../services/commonService';
import useDebounce from '../../../../hooks/useDebounce';
import goongService from '../../../../services/goongService';

import CompanyFormFields from './CompanyFormFields';
import { useConfig } from '@/hooks/useConfig';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { SelectOption } from '../../../../types/models';

export interface CompanyFormValues {
  companyName: string;
  taxCode: string;
  employeeSize: number;
  fieldOperation: string;
  location: { 
    city: number | string; 
    district: number | string; 
    address: string; 
    lat: number | string; 
    lng: number | string 
  };
  since?: Date | null;
  companyEmail: string;
  companyPhone: string;
  websiteUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
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
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);

  const schema = yup.object().shape({
    companyName: yup.string().required(t('companyForm.validation.companyNameRequired', 'Company name is required.')).max(255, t('common:validation.max255')),
    taxCode: yup.string().required(t('companyForm.placeholder.entercompanytaxcode', 'Tax code is required.')).max(30, t('common:validation.max30')),
    employeeSize: yup.number().required(t('companyForm.placeholder.selectcompanysize', 'Company size is required.')).typeError(t('companyForm.placeholder.selectcompanysize')),
    fieldOperation: yup.string().required(t('companyForm.placeholder.entercompanyfieldofoperation', 'Field of operation is required.')).max(255, t('common:validation.max255')),
    location: yup.object().shape({
      city: yup.number().required(t('jobPostForm.validation.cityprovinceisrequired')).typeError(t('jobPostForm.validation.cityprovinceisrequired')),
      district: yup.number().required(t('jobPostForm.validation.districtisrequired')).typeError(t('jobPostForm.validation.districtisrequired')),
      address: yup.string().required(t('jobPostForm.validation.addressisrequired')).max(255, t('common:validation.max255')),
      lat: yup.number().required(t('jobPostForm.validation.latitudeisrequired')).typeError(t('jobPostForm.validation.invalidlatitude')),
      lng: yup.number().required(t('jobPostForm.validation.longitudeisrequired')).typeError(t('jobPostForm.validation.invalidlongitude')),
    }),
    since: yup.date().nullable(),
    companyEmail: yup.string().required(t('jobPostForm.validation.contactpersonemailisrequired')).email(t('jobPostForm.validation.invalidemail')).max(100),
    companyPhone: yup.string().required(t('jobPostForm.validation.contactpersonphoneisrequired')).matches(REGEX_VALIDATE.phoneRegExp, t('jobPostForm.validation.invalidphonenumber')).max(15),
    description: yup.mixed().notRequired(),
  });

  const { control, reset, setValue, setError, clearErrors, handleSubmit } = useForm<CompanyFormValues>({
    resolver: yupResolver(schema) as Resolver<CompanyFormValues>,
    defaultValues: {
      description: EditorState.createEmpty(),
      location: { city: '', district: '', address: '', lat: '', lng: '' },
    },
  });

  const cityId = useWatch({ control, name: 'location.city' });
  const address = useWatch({ control, name: 'location.address' });
  const addressDebounce = useDebounce(address, 500);

  const prevCityIdRef = useRef<number | string | null>(null);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async (id: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(id);
        const results = (resData as unknown as { data: SelectOption[] })?.data || [];
        
        // Only clear district if the cityId has actually changed (user interaction)
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== id) {
          setValue('location.district', '');
        }
        setDistrictOptions(results);
        prevCityIdRef.current = id;
      } catch (error) {
        errorHandling(error as AxiosError<{ errors?: ApiError }>);
      }
    };
    if (cityId) loadDistricts(cityId);
    else {
        setDistrictOptions([]);
        prevCityIdRef.current = null;
    }
  }, [cityId, setValue]);

  // Load Goong location predictions
  useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if (resData.predictions) {
            setLocationOptions(resData.predictions as unknown as SelectOption[]);
        }
      } catch (error) {
          // Silent fail for autocomplete
      }
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  // Load edit data
  useEffect(() => {
    if (editData) {
      reset((formValues) => ({ ...formValues, ...(editData as unknown as Partial<CompanyFormValues>) }));
    }
  }, [editData, reset]);

  // Handle server errors
  useEffect(() => {
    if (serverErrors) {
      for (let err in serverErrors) {
        setError(err as keyof CompanyFormValues, { type: 'manual', message: serverErrors[err]?.join(' ') });
      }
    } else {
      clearErrors();
    }
  }, [serverErrors, setError, clearErrors]);

  const handleSelectLocation = async (e: React.SyntheticEvent, value: string | SelectOption | null) => {
    if (!value || typeof value !== 'object' || !('place_id' in value)) return;
    try {
      const prediction = value as unknown as import('../../../../services/goongService').PlacePrediction;
      const resData = await goongService.getPlaceDetailByPlaceId(prediction.place_id);
      const resultObj = resData?.result;
      const geometryObj = resultObj?.geometry;
      if (!geometryObj?.location) return;
      const location = geometryObj.location;
      setValue('location.lat', location.lat);
      setValue('location.lng', location.lng);
    } catch (error) {
      errorHandling(error as AxiosError<{ errors?: ApiError }>);
    }
  };

  return (
    <form id="company-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, lg: 10 }}>
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
