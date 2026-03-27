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

interface JobPostFormProps {
  handleAddOrUpdate: (data: any) => void;
  editData: any;
  serverErrors: any;
}

const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }: JobPostFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  
  const [districtOptions, setDistrictOptions] = React.useState<any[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<any[]>([]);

  const schema = React.useMemo(() => getJobPostSchema(t), [t]);

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
  } = useForm<JobPostFormValues>({
    resolver: yupResolver(schema),
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

  React.useEffect(() => {
    const loadDistricts = async (cityId: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        if (districtOptions.length > 0) setValue('location.district', '');
        setDistrictOptions(Array.isArray(resData) ? resData : ((resData as any)?.results || (resData as any)?.data || []));
      } catch (error: any) {
        errorHandling(error);
      }
    };
    if (cityId) loadDistricts(cityId);
  }, [cityId, setValue, districtOptions.length]);

  React.useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if ((resData as any)?.predictions) setLocationOptions((resData as any).predictions);
      } catch (error) {}
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  React.useEffect(() => {
    if (editData) {
      reset((formValues: any) => ({ ...formValues, ...editData }));
    } else {
      reset();
    }
  }, [editData, reset]);

  React.useEffect(() => {
    if (serverErrors !== null) {
      for (let err in serverErrors) {
        setError(err as any, {
          type: 'manual',
          message: serverErrors[err]?.join(' '),
        });
      }
    }
  }, [serverErrors, setError, reset]);

  const handleSelectLocation = async (e: React.SyntheticEvent, value: any) => {
    if (!value || typeof value !== 'object' || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id);
      if (!(resData as any)?.result?.geometry?.location) return;
      const location = (resData as any).result.geometry.location;
      setValue('location.lng', location.lng);
      setValue('location.lat', location.lat);
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
