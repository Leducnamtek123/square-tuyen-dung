import React from 'react';
import type { UseFormGetValues, UseFormReset } from 'react-hook-form';
import commonService from '../../../../services/commonService';
import type { SelectOption } from '../../../../types/models';
import type { JobPostSearchFormValues } from './types';

type UseJobPostSearchLocationOptionsParams = {
  cityId: JobPostSearchFormValues['cityId'];
  districtId: JobPostSearchFormValues['districtId'];
  getValues: UseFormGetValues<JobPostSearchFormValues>;
  reset: UseFormReset<JobPostSearchFormValues>;
};

type LocationOptionsState = {
  districtOptions: SelectOption[];
  wardOptions: SelectOption[];
};

type LocationOptionsAction =
  | { type: 'districtsLoaded'; options: SelectOption[] }
  | { type: 'wardsLoaded'; options: SelectOption[] };

const locationOptionsReducer = (
  state: LocationOptionsState,
  action: LocationOptionsAction
): LocationOptionsState => {
  switch (action.type) {
    case 'districtsLoaded':
      return {
        ...state,
        districtOptions: action.options,
      };
    case 'wardsLoaded':
      return {
        ...state,
        wardOptions: action.options,
      };
    default:
      return state;
  }
};

const initialLocationOptionsState: LocationOptionsState = {
  districtOptions: [],
  wardOptions: [],
};

export const useJobPostSearchLocationOptions = ({
  cityId,
  districtId,
  getValues,
  reset,
}: UseJobPostSearchLocationOptionsParams) => {
  const [state, dispatch] = React.useReducer(locationOptionsReducer, initialLocationOptionsState);
  const previousCityIdRef = React.useRef<JobPostSearchFormValues['cityId'] | null>(null);
  const previousDistrictIdRef = React.useRef<JobPostSearchFormValues['districtId'] | null>(null);

  React.useEffect(() => {
    const previousCityId = previousCityIdRef.current;
    const hasCityChanged = previousCityId !== null && previousCityId !== cityId;

    if (hasCityChanged) {
      const currentValues = {
        ...getValues(),
        districtId: '',
        wardId: '',
      };

      reset(currentValues, { keepDefaultValues: true });
    }

    previousCityIdRef.current = cityId || null;
  }, [cityId, getValues, reset]);

  React.useEffect(() => {
    let isActive = true;

    const loadDistricts = async () => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        if (!isActive) {
          return;
        }

        dispatch({
          type: 'districtsLoaded',
          options: resData.data?.map((district) => ({ id: district.id, name: district.name })) || [],
        });
      } catch {
        if (isActive) {
          dispatch({ type: 'districtsLoaded', options: [] });
        }
      }
    };

    if (cityId) {
      loadDistricts();
    } else {
      dispatch({ type: 'districtsLoaded', options: [] });
    }

    return () => {
      isActive = false;
    };
  }, [cityId]);

  React.useEffect(() => {
    const previousDistrictId = previousDistrictIdRef.current;
    const hasDistrictChanged = previousDistrictId !== null && previousDistrictId !== districtId;

    if (hasDistrictChanged) {
      const currentValues = {
        ...getValues(),
        wardId: '',
      };

      reset(currentValues, { keepDefaultValues: true });
    }

    previousDistrictIdRef.current = districtId || null;
  }, [districtId, getValues, reset]);

  React.useEffect(() => {
    let isActive = true;

    const loadWards = async () => {
      try {
        const resData = await commonService.getWardsByDistrictId(districtId);
        if (!isActive) {
          return;
        }

        dispatch({
          type: 'wardsLoaded',
          options: resData.data?.map((ward) => ({ id: ward.id, name: ward.name })) || [],
        });
      } catch {
        if (isActive) {
          dispatch({ type: 'wardsLoaded', options: [] });
        }
      }
    };

    if (districtId) {
      loadWards();
    } else {
      dispatch({ type: 'wardsLoaded', options: [] });
    }

    return () => {
      isActive = false;
    };
  }, [districtId]);

  return {
    districtOptions: state.districtOptions,
    wardOptions: state.wardOptions,
  };
};
