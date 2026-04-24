import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import { useTranslation } from 'react-i18next';
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
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';
import { Alert, Stack } from '@mui/material';

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

const buildInitialValues = (editData: Partial<JobPostFormValues> | null): JobPostFormValues => {
  const baseValues: JobPostFormValues = {
    jobDescription: createEditorStateFromHTMLString(''),
    jobRequirement: createEditorStateFromHTMLString(''),
    benefitsEnjoyed: createEditorStateFromHTMLString(''),
    isUrgent: false,
    interviewTemplate: null,
    location: { city: '', district: '', address: '', lat: '', lng: '' },
  } as JobPostFormValues;

  return {
    ...baseValues,
    ...editData,
    location: {
      ...baseValues.location,
      ...editData?.location,
    },
  } as JobPostFormValues;
};

const JobPostFormContent = ({
  handleAddOrUpdate,
  editData,
  serverErrors,
}: {
  handleAddOrUpdate: (data: JobPostFormValues) => void;
  editData: Partial<JobPostFormValues> | null;
  serverErrors: Record<string, string[]> | null;
}) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { data: groupData } = useQuestionGroups({ page: 1, pageSize: 100 });
  const questionGroupOptions = useMemo(() => {
    if (!groupData?.results) return [];
    return groupData.results.map((g) => ({ id: g.id, name: g.name }));
  }, [groupData]);
  const schema = useMemo(() => getJobPostSchema(t), [t]);
  const initialValues = React.useMemo(() => buildInitialValues(editData), [editData]);

  const { handleSubmit, control, setValue } = useForm<JobPostFormValues>({
    resolver: typedYupResolver(schema),
    defaultValues: initialValues,
  });

  const cityId = useWatch({ control, name: 'location.city' });
  const address = useWatch({ control, name: 'location.address' });
  const addressDebounce = useDebounce(address, 500);
  const prevCityIdRef = useRef<number | string | null>(null);

  useEffect(() => {
    const loadDistricts = async (id: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(id);
        const results = (Array.isArray(resData?.data) ? resData.data : []).map((district) => ({
          id: district.id,
          name: district.name,
        }));

        if (prevCityIdRef.current !== null && prevCityIdRef.current !== id) {
          setValue('location.district', '');
        }
        dispatch({ type: 'setDistrictOptions', value: results });
        prevCityIdRef.current = id;
      } catch (error) {
        errorHandling(error);
      }
    };

    if (cityId) void loadDistricts(cityId);
    else {
      dispatch({ type: 'setDistrictOptions', value: [] });
      prevCityIdRef.current = null;
    }
  }, [cityId, setValue]);

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
      } catch {
        // Silent fail for autocomplete
      }
    };
    void loadLocation(addressDebounce);
  }, [addressDebounce]);

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

  const errorText = serverErrors ? Object.values(serverErrors).flat().join(' ') : '';

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <Stack spacing={2}>
        {errorText ? <Alert severity="error">{errorText}</Alert> : null}
        <JobPostFormFields
          control={control}
          allConfig={allConfig}
          t={t}
          districtOptions={state.districtOptions}
          locationOptions={state.locationOptions}
          interviewTemplateOptions={questionGroupOptions}
          handleSelectLocation={handleSelectLocation}
        />
      </Stack>
    </form>
  );
};

const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }: JobPostFormProps) => {
  const formKey = React.useMemo(() => JSON.stringify({ editData, serverErrors }), [editData, serverErrors]);
  return <JobPostFormContent key={formKey} handleAddOrUpdate={handleAddOrUpdate} editData={editData} serverErrors={serverErrors} />;
};

export default JobPostForm;
