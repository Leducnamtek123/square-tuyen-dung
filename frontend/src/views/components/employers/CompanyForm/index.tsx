import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert, Grid2 as Grid, Stack } from "@mui/material";

import errorHandling from '../../../../utils/errorHandling';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import commonService from '../../../../services/commonService';
import useDebounce from '../../../../hooks/useDebounce';
import goongService from '../../../../services/goongService';
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';

import CompanyFormFields from './CompanyFormFields';
import { useConfig } from '@/hooks/useConfig';
import type { SelectOption } from '../../../../types/models';
import type { PlacePrediction } from '../../../../services/goongService';
import type { CompanyFormValues } from './types';

interface CompanyFormProps {
  handleUpdate: (data: CompanyFormValues) => void;
  editData: Partial<CompanyFormValues> | null;
  serverErrors?: Record<string, string[]> | null;
}

type PlaceOption = SelectOption & { place_id: string };

type CompanyFormContentProps = {
  handleUpdate: (data: CompanyFormValues) => void;
  t: ReturnType<typeof useTranslation>['t'];
  allConfig: ReturnType<typeof useConfig>['allConfig'];
  initialValues: CompanyFormValues;
  serverErrors: Record<string, string[]> | null;
  districtOptions: SelectOption[];
  locationOptions: SelectOption[];
};

const buildInitialValues = (editData: Partial<CompanyFormValues> | null): CompanyFormValues => {
  const baseValues: CompanyFormValues = {
    description: createEditorStateFromHTMLString(''),
    since: null,
    websiteUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    location: { city: '', district: '', address: '', lat: '', lng: '' },
  } as CompanyFormValues;

  return {
    ...baseValues,
    ...editData,
    location: {
      ...baseValues.location,
      ...editData?.location,
    },
  } as CompanyFormValues;
};

const CompanyFormContent = ({
  handleUpdate,
  t,
  allConfig,
  initialValues,
  serverErrors,
  districtOptions,
  locationOptions,
}: CompanyFormContentProps) => {
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
    websiteUrl: yup.string().transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? null : value?.trim() || value)).nullable().notRequired().url(t('common:validation.invalidUrl', 'Please enter a valid URL.')),
    facebookUrl: yup.string().transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? null : value?.trim() || value)).nullable().notRequired().url(t('common:validation.invalidUrl', 'Please enter a valid URL.')),
    youtubeUrl: yup.string().transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? null : value?.trim() || value)).nullable().notRequired().url(t('common:validation.invalidUrl', 'Please enter a valid URL.')),
    linkedinUrl: yup.string().transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? null : value?.trim() || value)).nullable().notRequired().url(t('common:validation.invalidUrl', 'Please enter a valid URL.')),
    description: yup.mixed().notRequired(),
  });

  const { control, setValue, handleSubmit } = useForm<CompanyFormValues>({
    resolver: yupResolver(schema) as Resolver<CompanyFormValues>,
    defaultValues: initialValues,
  });

  const [localDistrictOptions, setLocalDistrictOptions] = useState<SelectOption[]>([]);
  const [localLocationOptions, setLocalLocationOptions] = useState<SelectOption[]>([]);
  const cityId = useWatch({ control, name: 'location.city' });
  const address = useWatch({ control, name: 'location.address' });
  const addressDebounce = useDebounce(address, 500);
  const prevCityIdRef = useRef<number | string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDistricts = async (id: number | string | null) => {
      const nextDistrictOptions: SelectOption[] = [];

      if (id) {
        try {
          const resData = await commonService.getDistrictsByCityId(id);
          const results = (Array.isArray(resData) ? resData : ((resData as { data?: SelectOption[] })?.data || [])) as SelectOption[];
          nextDistrictOptions.push(...results);

          if (prevCityIdRef.current !== null && prevCityIdRef.current !== id) {
            setValue('location.district', '');
          }
          prevCityIdRef.current = id;
        } catch (error) {
          errorHandling(error);
          return;
        }
      } else {
        prevCityIdRef.current = null;
      }

      if (!cancelled) {
        setLocalDistrictOptions(nextDistrictOptions);
      }
    };

    void loadDistricts(cityId);

    return () => {
      cancelled = true;
    };
  }, [cityId, setValue]);

  useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocalLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        const predictions = Array.isArray(resData.predictions) ? resData.predictions : [];
        const mappedOptions: PlaceOption[] = predictions.map((prediction: PlacePrediction) => ({
          id: prediction.place_id,
          name: prediction.description,
          place_id: prediction.place_id,
        }));
        setLocalLocationOptions(mappedOptions);
      } catch {
        // Silent fail for autocomplete
      }
    };
    void loadLocation(addressDebounce);
  }, [addressDebounce]);

  const handleSelectLocation = async (_e: React.SyntheticEvent, value: string | SelectOption | null) => {
    if (!value || typeof value !== 'object' || !('place_id' in value)) return;
    try {
      const placeId = value.place_id as string;
      const resData = await goongService.getPlaceDetailByPlaceId(placeId);
      const resultObj = resData?.result;
      const geometryObj = resultObj?.geometry;
      if (!geometryObj?.location) return;
      const location = geometryObj.location;
      setValue('location.lat', location.lat);
      setValue('location.lng', location.lng);
    } catch (error) {
      errorHandling(error);
    }
  };

  const errorText = serverErrors ? Object.values(serverErrors).flat().join(' ') : '';

  return (
    <form id="company-form" onSubmit={handleSubmit(handleUpdate)}>
      <Stack spacing={2}>
        {errorText ? <Alert severity="error">{errorText}</Alert> : null}
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, lg: 10 }}>
            <CompanyFormFields
              control={control}
              t={t}
              allConfig={allConfig}
              districtOptions={localDistrictOptions}
              locationOptions={localLocationOptions}
              handleSelectLocation={handleSelectLocation}
            />
          </Grid>
        </Grid>
      </Stack>
    </form>
  );
};

const CompanyForm = ({ handleUpdate, editData, serverErrors = null }: CompanyFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  const initialValues = React.useMemo(() => buildInitialValues(editData), [editData]);

  return (
    <CompanyFormContent
      key={JSON.stringify({ editData, serverErrors })}
      handleUpdate={handleUpdate}
      t={t}
      allConfig={allConfig}
      initialValues={initialValues}
      serverErrors={serverErrors}
      districtOptions={[]}
      locationOptions={[]}
    />
  );
};

export default CompanyForm;
