'use client';
import React from 'react';
import { useWatch, type Control } from 'react-hook-form';
import type { SelectOption } from '@/types/models';
import commonService from '../../../../services/commonService';
import errorHandling from '../../../../utils/errorHandling';
import type { PersonalProfileFormValues } from './types';

export const usePersonalProfileDistrictOptions = (control: Control<PersonalProfileFormValues>) => {
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);
  const cityId = useWatch({ control, name: 'location.city' });
  const prevCityIdRef = React.useRef<string | number | null>(null);

  React.useEffect(() => {
    const loadDistricts = async (id: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(id);
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== id) {
          setDistrictOptions([]);
        }
        const results = (Array.isArray(resData) ? resData : ((resData as { results?: unknown[] })?.results || [])) as SelectOption[];
        setDistrictOptions(results);
        prevCityIdRef.current = id;
      } catch (error) {
        errorHandling(error);
      }
    };

    if (cityId) {
      void loadDistricts(cityId);
    }
  }, [cityId]);

  return districtOptions;
};
