import React, { useMemo, useEffect, useRef } from 'react';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import { useTranslation } from 'react-i18next';
import { EditorState } from 'draft-js';
import useDebounce from '../../../../hooks/useDebounce';
import errorHandling from '../../../../utils/errorHandling';
import commonService from '../../../../services/commonService';
import goongService from '../../../../services/goongService';
import type { PlacePrediction } from '../../../../services/goongService';
import { JobPostFormValues, getJobPostSchema } from './JobPostSchema';
import JobPostFormFields from './JobPostFormFields';
import { useConfig } from '@/hooks/useConfig';
import { useQuestionGroups } from '../hooks/useEmployerQueries';
import type { SelectOption } from '@/types/models';

interface JobPostFormProps {
  handleAddOrUpdate: (data: JobPostFormValues) => void;
  editData: Partial<JobPostFormValues> | null;
  serverErrors: Record<string, string[]> | null;
}

interface PlaceOption extends SelectOption {
  place_id: string;
}

type JobPostFormState = {
  districtOptions: SelectOption[];
  locationOptions: PlaceOption[];
};

type JobPostFormAction =
  | { type: 'setDistrictOptions'; value: SelectOption[] }
  | { type: 'setLocationOptions'; value: PlaceOption[] };

const initialState: JobPostFormState = {
  districtOptions: [],
  locationOptions: [],
};

function reducer(state: JobPostFormState, action: JobPostFormAction): JobPostFormState {
  switch (action.type) {
    case 'setDistrictOptions':
      return { ...state, districtOptions: action.value };
    case 'setLocationOptions':
      return { ...state, locationOptions: action.value };
    default:
      return state;
  }
}

const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }: JobPostFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const { data: groupData } = useQuestionGroups({
    page: 1,
    pageSize: 100 // Load max
  });

  const questionGroupOptions = useMemo(() => {
    if (!groupData?.results) return [];
    return groupData.results.map((g) => ({
      id: g.id,
      name: g.name,
    }));
  }, [groupData]);

  const schema = useMemo(() => getJobPostSchema(t), [t]);

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    clearErrors,
  } = useForm<JobPostFormValues>({
    resolver: typedYupResolver(schema),
    defaultValues: {
      jobDescription: EditorState.createEmpty(),
      jobRequirement: EditorState.createEmpty(),
      benefitsEnjoyed: EditorState.createEmpty(),
      isUrgent: false,
      interviewTemplate: null,
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
        const results = (Array.isArray(resData?.data) ? resData.data : []).map((district) => ({
          id: district.id,
          name: district.name,
        }));
        
        // Only clear district if the cityId has actually changed (user interaction)
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== id) {
          setValue('location.district', '');
        }
        dispatch({ type: 'setDistrictOptions', value: results });
        prevCityIdRef.current = id;
      } catch (error) {
        errorHandling(error);
      }
    };
    if (cityId) loadDistricts(cityId);
    else {
        dispatch({ type: 'setDistrictOptions', value: [] });
        prevCityIdRef.current = null;
    }
  }, [cityId, setValue]);

  // Load location predictions (Goong)
  useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        dispatch({ type: 'setLocationOptions', value: [] });
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        const predictions = Array.isArray(resData?.predictions) ? resData.predictions : [];
        dispatch({
          type: 'setLocationOptions',
          value: predictions.map((prediction: PlacePrediction) => ({
            id: prediction.place_id,
            name: prediction.description,
            place_id: prediction.place_id,
          })),
        });
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
        interviewTemplate: null,
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

  const handleSelectLocation = async (_e: React.SyntheticEvent, value: PlaceOption | null) => {
    if (!value?.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id);
      if (!resData) return;
      const geometryObj = resData.result.geometry;
      if (!geometryObj?.location) return;
      const location = geometryObj.location;
      setValue('location.lng', location.lng);
      setValue('location.lat', location.lat);
    } catch (error) {
        errorHandling(error);
    }
  };

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <JobPostFormFields
        control={control}
        allConfig={allConfig}
        t={t}
        districtOptions={state.districtOptions}
        locationOptions={state.locationOptions}
        interviewTemplateOptions={questionGroupOptions}
        handleSelectLocation={handleSelectLocation}
      />
    </form>
  );
};

export default JobPostForm;
