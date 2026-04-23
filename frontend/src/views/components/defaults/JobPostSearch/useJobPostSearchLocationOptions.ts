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

export const useJobPostSearchLocationOptions = ({
  cityId,
  districtId,
  getValues,
  reset,
}: UseJobPostSearchLocationOptionsParams) => {
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);
  const [wardOptions, setWardOptions] = React.useState<SelectOption[]>([]);
  const [previousCityId, setPreviousCityId] = React.useState<JobPostSearchFormValues['cityId'] | null>(null);
  const [previousDistrictId, setPreviousDistrictId] = React.useState<JobPostSearchFormValues['districtId'] | null>(null);

  React.useEffect(() => {
    const hasCityChanged = previousCityId !== null && previousCityId !== cityId;

    if (hasCityChanged) {
      const currentValues = {
        ...getValues(),
        districtId: '',
        wardId: '',
      };

      reset(currentValues, { keepDefaultValues: true });
    }

    setPreviousCityId(cityId || null);
  }, [cityId, getValues, reset, previousCityId]);

  React.useEffect(() => {
    let isActive = true;

    const loadDistricts = async () => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        if (!isActive) {
          return;
        }

        setDistrictOptions(resData.data?.map((district) => ({ id: district.id, name: district.name })) || []);
      } catch {
        if (isActive) {
          setDistrictOptions([]);
        }
      }
    };

    if (cityId) {
      loadDistricts();
    } else {
      setDistrictOptions([]);
    }

    return () => {
      isActive = false;
    };
  }, [cityId]);

  React.useEffect(() => {
    const hasDistrictChanged = previousDistrictId !== null && previousDistrictId !== districtId;

    if (hasDistrictChanged) {
      const currentValues = {
        ...getValues(),
        wardId: '',
      };

      reset(currentValues, { keepDefaultValues: true });
    }

    setPreviousDistrictId(districtId || null);
  }, [districtId, getValues, reset, previousDistrictId]);

  React.useEffect(() => {
    let isActive = true;

    const loadWards = async () => {
      try {
        const resData = await commonService.getWardsByDistrictId(districtId);
        if (!isActive) {
          return;
        }

        setWardOptions(resData.data?.map((ward) => ({ id: ward.id, name: ward.name })) || []);
      } catch {
        if (isActive) {
          setWardOptions([]);
        }
      }
    };

    if (districtId) {
      loadWards();
    } else {
      setWardOptions([]);
    }

    return () => {
      isActive = false;
    };
  }, [districtId]);

  return {
    districtOptions,
    wardOptions,
  };
};
