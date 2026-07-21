'use client';
import React from 'react';
import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import type { SelectOption } from '@/types/models';
import commonService from '../../../../services/commonService';
import errorHandling from '../../../../utils/errorHandling';
import { shouldResetChildLocationValue } from '../../../../utils/locationForm';
import type { PersonalProfileFormValues } from './types';

type DistrictOptionsResponse =
  | SelectOption[]
  | {
      data?: SelectOption[] | { results?: SelectOption[] };
      results?: SelectOption[];
    }
  | null
  | undefined;
type CityIdValue = number | string | null | undefined;

export const extractPersonalProfileDistrictOptions = (response: DistrictOptionsResponse): SelectOption[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && typeof response.data === 'object' && Array.isArray(response.data.results)) {
    return response.data.results;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
};

export const resolvePersonalProfileDistrictOptions = (cityId: CityIdValue, response: DistrictOptionsResponse): SelectOption[] => {
  if (cityId === undefined || cityId === null || cityId === '') {
    return [];
  }

  return extractPersonalProfileDistrictOptions(response);
};

export const usePersonalProfileDistrictOptions = (
  control: Control<PersonalProfileFormValues>,
  setValue?: UseFormSetValue<PersonalProfileFormValues>,
) => {
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);
  const cityId = useWatch({ control, name: 'location.city' });
  const prevCityIdRef = React.useRef<string | number | null>(null);

  React.useEffect(() => {
    const loadDistricts = async (id: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(id);
        if (shouldResetChildLocationValue(prevCityIdRef.current, id)) {
          setValue?.('location.district', '');
          setDistrictOptions([]);
        }
        setDistrictOptions(resolvePersonalProfileDistrictOptions(id, resData));
        prevCityIdRef.current = id;
      } catch (error) {
        errorHandling(error);
      }
    };

    if (cityId) {
      void loadDistricts(cityId);
    } else {
      if (shouldResetChildLocationValue(prevCityIdRef.current, cityId)) {
        setValue?.('location.district', '');
      }
      setDistrictOptions([]);
      prevCityIdRef.current = null;
    }
  }, [cityId, setValue]);

  return districtOptions;
};
