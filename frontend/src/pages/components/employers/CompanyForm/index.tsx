import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Grid from "@mui/material/Grid2";
import { EditorState } from 'draft-js';

import errorHandling from '../../../../utils/errorHandling';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import commonService from '../../../../services/commonService';
import useDebounce from '../../../../hooks/useDebounce';
import goongService from '../../../../services/goongService';

import CompanyFormLoading from './CompanyFormLoading';
import CompanyFormFields from './CompanyFormFields';

interface CompanyFormProps {
  handleUpdate: (data: any) => void;
  editData: any;
  serverErrors?: any;
}

const CompanyForm = ({ handleUpdate, editData, serverErrors = null }: CompanyFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useAppSelector((state) => state.config);
  const [districtOptions, setDistrictOptions] = React.useState<any[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<any[]>([]);

  const schema = yup.object().shape({
    companyName: yup.string().required('Company name is required.').max(255, 'Company name exceeded allowed length.'),
    taxCode: yup.string().required('Tax code is required.').max(30, 'Tax code exceeded allowed length.'),
    employeeSize: yup.number().required('Company size is required.').typeError('Company size is required.'),
    fieldOperation: yup.string().required('Field of operation is required.').max(255, 'Field of operation exceeded allowed length.'),
    location: yup.object().shape({
      city: yup.number().required('City/Province is required.').typeError('City/Province is required.'),
      district: yup.number().required('District is required.').typeError('District is required.'),
      address: yup.string().required('Address is required.').max(255, 'Address exceeded allowed length.'),
      lat: yup.number().required('Latitude is required.').typeError('Invalid latitude.'),
      lng: yup.number().required('Longitude is required.').typeError('Invalid longitude.'),
    }),
    since: yup.date().nullable(),
    companyEmail: yup.string().required('Company email is required.').email('Invalid email.').max(100, 'Company email exceeded allowed length.'),
    companyPhone: yup.string().required('Company phone is required.').matches(REGEX_VALIDATE.phoneRegExp, 'Invalid phone number.').max(15, 'Company phone exceeded allowed length.'),
  });

  const { control, reset, setValue, setError, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: EditorState.createEmpty(),
      location: { city: '', district: '', address: '', lat: '', lng: '' },
    },
  });

  const cityId = useWatch({ control, name: 'location.city' });
  const address = useWatch({ control, name: 'location.address' });
  const addressDebounce = useDebounce(address, 500);

  React.useEffect(() => {
    const loadDistricts = async (cityId: any) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        if (districtOptions.length > 0) setValue('location.district', '');
        setDistrictOptions(resData.data);
      } catch (error: any) {
        errorHandling(error);
      }
    };
    if (cityId) {
      loadDistricts(cityId);
    }
  }, [cityId, setValue, districtOptions.length]);

  React.useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if (resData.predictions) setLocationOptions(resData.predictions as any[]);
      } catch (error: any) {
        errorHandling(error);
      }
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  React.useEffect(() => {
    if (editData !== null) {
      reset((formValues) => ({ ...formValues, ...editData }));
    } else {
      reset();
    }
  }, [editData, reset]);

  React.useEffect(() => {
    if (serverErrors !== null) {
      for (let err in serverErrors) {
        setError(err as any, { type: 400 as any, message: serverErrors[err]?.join(' ') });
      }
    } else {
      (setError as any)();
    }
  }, [serverErrors, setError]);

  const handleSelectLocation = async (e: any, value: any) => {
    if (!value || typeof value !== 'object' || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id) as any;
      if (!resData?.result?.geometry?.location) return;
      setValue('location.lat', resData?.result?.geometry.location.lat || '');
      setValue('location.lng', resData?.result?.geometry.location.lng || '');
    } catch (error: any) {
      errorHandling(error);
    }
  };

  return (
    <form id="company-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 10, xl: 10 }}>
          <CompanyFormFields
            control={control}
            t={t}
            allConfig={allConfig}
            districtOptions={districtOptions}
            locationOptions={locationOptions}
            handleSelectLocation={handleSelectLocation}
          />
        </Grid>
      </Grid>
    </form>
  );
};

CompanyForm.Loading = CompanyFormLoading;

export default CompanyForm;
