import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';
import useDebounce from '../../../../hooks/useDebounce';
import errorHandling from '../../../../utils/errorHandling';
import commonService from '../../../../services/commonService';
import goongService from '../../../../services/goongService';
import { JobPostFormValues, getJobPostSchema } from './JobPostSchema';
import JobPostFormFields from './JobPostFormFields';
import { useConfig } from '@/hooks/useConfig';
import { PaginatedResponse } from '@/types/api';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';

interface JobPostFormProps {
  handleAddOrUpdate: (data: JobPostFormValues) => void;
  editData: Record<string, unknown> | null;
  serverErrors: Record<string, string[]> | null;
}

const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }: JobPostFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  
  const [districtOptions, setDistrictOptions] = useState<Record<string, unknown>[]>([]);
  const [locationOptions, setLocationOptions] = useState<Record<string, unknown>[]>([]);

  const schema = useMemo(() => getJobPostSchema(t), [t]);

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    clearErrors,
  } = useForm<JobPostFormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      jobDescription: EditorState.createEmpty(),
      jobRequirement: EditorState.createEmpty(),
      benefitsEnjoyed: EditorState.createEmpty(),
      isUrgent: false,
      location: {
        city: '',
        district: '',
        address: '',
        lat: '',
        lng: '',
      },
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
        const results = (((resData as any)?.results || (Array.isArray(resData) ? resData : [])) as Record<string, unknown>[]);
        
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

  // Load location predictions (Goong)
  useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if ((resData as Record<string, unknown>)?.predictions) {
            setLocationOptions((resData as Record<string, unknown>).predictions as Record<string, unknown>[]);
        }
      } catch (error) {
          // Silent fail for autocomplete
      }
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  // Handle edit data loading
  useEffect(() => {
    if (editData) {
      reset((formValues) => ({ ...formValues, ...(editData as Partial<JobPostFormValues>) }));
    } else {
      reset({
        jobDescription: EditorState.createEmpty(),
        jobRequirement: EditorState.createEmpty(),
        benefitsEnjoyed: EditorState.createEmpty(),
        isUrgent: false,
        location: { city: '', district: '', address: '', lat: '', lng: '' },
      });
    }
  }, [editData, reset]);

  // Handle server errors
  useEffect(() => {
    if (serverErrors) {
      for (let err in serverErrors) {
        setError(err as keyof JobPostFormValues, {
          type: 'manual',
          message: serverErrors[err]?.join(' '),
        });
      }
    } else {
        clearErrors();
    }
  }, [serverErrors, setError, clearErrors]);

  const handleSelectLocation = async (_e: React.SyntheticEvent, value: Record<string, unknown> | null) => {
    if (!value || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id as string);
      if (!resData) return;
      const geometryObj = resData.result.geometry;
      if (!geometryObj?.location) return;
      const location = geometryObj.location;
      setValue('location.lng', location.lng);
      setValue('location.lat', location.lat);
    } catch (error) {
        errorHandling(error as AxiosError<{ errors?: ApiError }>);
    }
  };

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <JobPostFormFields
        control={control}
        allConfig={allConfig}
        t={t}
        districtOptions={districtOptions}
        locationOptions={locationOptions}
        handleSelectLocation={handleSelectLocation}
      />
    </form>
  );
};

export default JobPostForm;
