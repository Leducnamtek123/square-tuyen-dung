import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Grid2 as Grid } from "@mui/material";
import { EditorState } from 'draft-js';

import errorHandling from '../../../../utils/errorHandling';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import commonService from '../../../../services/commonService';
import useDebounce from '../../../../hooks/useDebounce';
import goongService from '../../../../services/goongService';

import CompanyFormLoading from './CompanyFormLoading';
import CompanyFormFields from './CompanyFormFields';
import { useConfig } from '@/hooks/useConfig';

interface CompanyFormProps {
  handleUpdate: (data: any) => void;
  editData: any;
  serverErrors?: any;
}

const CompanyForm = ({ handleUpdate, editData, serverErrors = null }: CompanyFormProps) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();
  const [districtOptions, setDistrictOptions] = React.useState<any[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<any[]>([]);

  const schema = yup.object().shape({
    companyName: yup.string().required(t('jobPostForm.validation.jobnameisrequired', 'Company name is required.')).max(255, t('jobPostForm.validation.jobnameexceededallowedlength', 'Company name exceeded allowed length.')),
    taxCode: yup.string().required(t('companyForm.placeholder.entercompanytaxcode', 'Tax code is required.')).max(30, t('jobPostForm.validation.jobnameexceededallowedlength', 'Tax code exceeded allowed length.')),
    employeeSize: yup.number().required(t('companyForm.placeholder.selectcompanysize', 'Company size is required.')).typeError(t('companyForm.placeholder.selectcompanysize', 'Company size is required.')),
    fieldOperation: yup.string().required(t('companyForm.placeholder.entercompanyfieldofoperation', 'Field of operation is required.')).max(255, t('jobPostForm.validation.jobnameexceededallowedlength', 'Field of operation exceeded allowed length.')),
    location: yup.object().shape({
      city: yup.number().required(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')).typeError(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')),
      district: yup.number().required(t('jobPostForm.validation.districtisrequired', 'District is required.')).typeError(t('jobPostForm.validation.districtisrequired', 'District is required.')),
      address: yup.string().required(t('jobPostForm.validation.addressisrequired', 'Address is required.')).max(255, t('jobPostForm.validation.addressexceededallowedlength', 'Address exceeded allowed length.')),
      lat: yup.number().required(t('jobPostForm.validation.latitudeisrequired', 'Latitude is required.')).typeError(t('jobPostForm.validation.invalidlatitude', 'Invalid latitude.')),
      lng: yup.number().required(t('jobPostForm.validation.longitudeisrequired', 'Longitude is required.')).typeError(t('jobPostForm.validation.invalidlongitude', 'Invalid longitude.')),
    }),
    since: yup.date().nullable(),
    companyEmail: yup.string().required(t('jobPostForm.validation.contactpersonemailisrequired', 'Company email is required.')).email(t('jobPostForm.validation.invalidemail', 'Invalid email.')).max(100, t('jobPostForm.validation.jobnameexceededallowedlength', 'Company email exceeded allowed length.')),
    companyPhone: yup.string().required(t('jobPostForm.validation.contactpersonphoneisrequired', 'Company phone is required.')).matches(REGEX_VALIDATE.phoneRegExp, t('jobPostForm.validation.invalidphonenumber', 'Invalid phone number.')).max(15, t('jobPostForm.validation.jobnameexceededallowedlength', 'Company phone exceeded allowed length.')),
    description: yup.mixed().notRequired(),
  });

  const { control, reset, setValue, setError, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: EditorState.createEmpty(),
      location: { city: '' as unknown as number, district: '' as unknown as number, address: '', lat: '' as unknown as number, lng: '' as unknown as number },
    },
  });

  const cityId = useWatch({ control, name: 'location.city' });
  const address = useWatch({ control, name: 'location.address' });
  const addressDebounce = useDebounce(address, 500);

  const prevCityIdRef = React.useRef<any>(null);

  React.useEffect(() => {
    const loadDistricts = async (cityId: any) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        // Only clear district if the cityId has actually changed (user interaction)
        // and it's not the initial load (prevCityIdRef.current is not null).
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== cityId) {
          setValue('location.district', '' as unknown as number);
        }
        setDistrictOptions(resData?.data || []);
        prevCityIdRef.current = cityId;
      } catch (error: any) {
        errorHandling(error);
      }
    };
    if (cityId) {
      loadDistricts(cityId);
    }
  }, [cityId, setValue]);

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

export default CompanyForm;
