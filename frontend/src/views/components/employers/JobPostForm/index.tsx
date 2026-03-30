import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';
import useDebounce from '../../../../hooks/useDebounce';
import errorHandling from '../../../../utils/errorHandling';
import commonService from '../../../../services/commonService';
import goongService from '../../../../services/goongService';
import { useAppSelector } from '../../../../redux/hooks';
import { JobPostFormValues, getJobPostSchema } from './JobPostSchema';
import JobPostFormFields from './JobPostFormFields';
import { useConfig } from '@/hooks/useConfig';
import { PaginatedResponse } from '@/types/api';
import type { AxiosError } from 'axios';
import type { ApiError } from '../../../../types/api';
import type { Resolver } from 'react-hook-form';

interface JobPostFormProps {
  handleAddOrUpdate: (data: JobPostFormValues) => void;
  editData: Record<string, unknown> | null;
  serverErrors: Record<string, string[]> | null;
}

const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }: JobPostFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  
  const [districtOptions, setDistrictOptions] = React.useState<Record<string, unknown>[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<Record<string, unknown>[]>([]);

  const schema = React.useMemo(() => getJobPostSchema(t), [t]);

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
  } = useForm<JobPostFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<JobPostFormValues>,
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

  const prevCityIdRef = React.useRef<number | string | null>(null);
  React.useEffect(() => {
    const loadDistricts = async (cityId: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        // Only clear district if the cityId has actually changed (user interaction)
        // and it's not the initial load (prevCityIdRef.current is not null).
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== cityId) {
          setValue('location.district', '');
        }
        setDistrictOptions(((resData as unknown as PaginatedResponse<Record<string, unknown>>)?.results || []) as Record<string, unknown>[]);
        prevCityIdRef.current = cityId;
      } catch (error) {
        errorHandling(error as AxiosError<{ errors?: ApiError }>);
      }
    };
    if (cityId) loadDistricts(cityId);
  }, [cityId, setValue]);

  React.useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if ((resData as Record<string, unknown>)?.predictions) setLocationOptions((resData as Record<string, unknown>).predictions as Record<string, unknown>[]);
      } catch (error) {}
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  React.useEffect(() => {
    if (editData) {
      reset((formValues) => ({ ...formValues, ...(editData as unknown as Partial<JobPostFormValues>) }));
    } else {
      reset();
    }
  }, [editData, reset]);

  React.useEffect(() => {
    if (serverErrors !== null) {
      for (let err in serverErrors) {
        setError(err as keyof JobPostFormValues, {
          type: 'manual',
          message: serverErrors[err]?.join(' '),
        });
      }
    }
  }, [serverErrors, setError, reset]);

  const handleSelectLocation = async (e: React.SyntheticEvent, value: Record<string, unknown> | null) => {
    if (!value || typeof value !== 'object' || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id as string);
      const resultObj = (resData as Record<string, unknown>)?.result as Record<string, unknown> | undefined;
      const geometryObj = resultObj?.geometry as Record<string, unknown> | undefined;
      if (!geometryObj?.location) return;
      const location = geometryObj.location as Record<string, unknown>;
      setValue('location.lng', location.lng as number | string);
      setValue('location.lat', location.lat as number | string);
    } catch (error) {}
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
