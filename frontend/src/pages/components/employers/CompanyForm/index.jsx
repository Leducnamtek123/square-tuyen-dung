import React from 'react';

import { useTranslation } from 'react-i18next';

import { useSelector } from 'react-redux';

import { useForm, useWatch } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { Skeleton } from "@mui/material";

import Grid from "@mui/material/Grid2";

import { EditorState } from 'draft-js';

import errorHandling from '../../../../utils/errorHandling';

import { REGEX_VATIDATE } from '../../../../configs/constants';

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';

import DatePickerCustom from '../../../../components/controls/DatePickerCustom';

import commonService from '../../../../services/commonService';

import useDebounce from '../../../../hooks/useDebounce';

import TextFieldAutoCompleteCustom from '../../../../components/controls/TextFieldAutoCompleteCustom';

import goongService from '../../../../services/goongService';

import RichTextEditorCustom from '../../../../components/controls/RichTextEditorCustom';

const CompanyForm = ({ handleUpdate, editData, serverErrors = null }) => {

  const { t } = useTranslation('employer');

  const { allConfig } = useSelector((state) => state.config);

  const [districtOptions, setDistrictOptions] = React.useState([]);

  const [locationOptions, setLocationOptions] = React.useState([]);

  const schema = yup.object().shape({

    companyName: yup

      .string()

      .required('Company name is required.')

      .max(255, 'Company name exceeded allowed length.'),

    taxCode: yup

      .string()

      .required('Tax code is required.')

      .max(30, 'Tax code exceeded allowed length.'),

    employeeSize: yup

      .number()

      .required('Company size is required.')

      .typeError('Company size is required.'),

    fieldOperation: yup

      .string()

      .required('Field of operation is required.')

      .max(255, 'Field of operation exceeded allowed length.'),

    location: yup.object().shape({

      city: yup

        .number()

        .required('City/Province is required.')

        .typeError('City/Province is required.'),

      district: yup

        .number()

        .required('District is required.')

        .typeError('District is required.'),

      address: yup

        .string()

        .required('Address is required.')

        .max(255, 'Address exceeded allowed length.'),

      lat: yup

        .number()

        .required('Latitude is required.')

        .typeError('Invalid latitude.'),

      lng: yup

        .number()

        .required('Longitude is required.')

        .typeError('Invalid longitude.'),

    }),

    since: yup.date().nullable(),

    companyEmail: yup

      .string()

      .required('Company email is required.')

      .email('Invalid email.')

      .max(100, 'Company email exceeded allowed length.'),

    companyPhone: yup

      .string()

      .required('Company phone is required.')

      .matches(REGEX_VATIDATE.phoneRegExp, 'Invalid phone number.')

      .max(15, 'Company phone exceeded allowed length.'),

  });

  const { control, reset, setValue, setError, handleSubmit } = useForm({

    resolver: yupResolver(schema),

    defaultValues: {

      description: EditorState.createEmpty(),

      location: {

        city: '',

        district: '',

        address: '',

        lat: '',

        lng: '',

      },

    },

  });

  const cityId = useWatch({

    control,

    name: 'location.city',

  });

  const address = useWatch({

    control,

    name: 'location.address',

  });

  const addressDebounce = useDebounce(address, 500);

  React.useEffect(() => {

    const loadDistricts = async (cityId) => {

      try {

        const resData = await commonService.getDistrictsByCityId(cityId);

        if (districtOptions.length > 0) setValue('location.district', '');

        setDistrictOptions(resData.data);

      } catch (error) {

        errorHandling(error);

      } finally {

      }

    };

    if (cityId) {

      loadDistricts(cityId);

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [cityId, setValue]);

  React.useEffect(() => {

    const loadLocation = async (input) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }

      try {

        const resData = await goongService.getPlaces(input);

        if (resData.predictions) setLocationOptions(resData.predictions);

      } catch (error) {

        errorHandling(error);

      }

    };

    loadLocation(addressDebounce);

  }, [addressDebounce]);

  React.useEffect(() => {

    if (editData !== null)

      reset((formValues) => ({

        ...formValues,

        ...editData,

      }));

    else reset();

  }, [editData, reset]);

  // show server errors

  React.useEffect(() => {

    if (serverErrors !== null)

      for (let err in serverErrors) {

        setError(err, {

          type: 400,

          message: serverErrors[err]?.join(' '),

        });

      }

    else {

      setError();

    }

  }, [serverErrors, setError]);

  const handleSelectLocation = async (e, value) => {
    if (!value || typeof value !== 'object' || !value.place_id) {
      return;
    }

    try {

      const resData = await goongService.getPlaceDetailByPlaceId(

        value.place_id

      );

      if (!resData?.result?.geometry?.location) {
        return;
      }

      setValue('location.lat', resData?.result?.geometry.location.lat || '');

      setValue('location.lng', resData?.result?.geometry.location.lng || '');

    } catch (error) {

      errorHandling(error);

    }

  };

  return (

    <form id="company-form" onSubmit={handleSubmit(handleUpdate)}>

      <Grid container>

        <Grid

          size={{

            xs: 12,

            sm: 12,

            md: 12,

            lg: 10,

            xl: 10

          }}>

          <Grid container spacing={2}>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 12,

                lg: 12,

                xl: 12

              }}>

              <TextFieldCustom

                name="companyName"

                title={t('companyForm.title.companyname', 'Company Name')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.entercompanyname', 'Enter company name')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="taxCode"

                title={t('companyForm.title.taxcode', 'Tax Code')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.entercompanytaxcode', 'Enter company tax code')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <SingleSelectCustom

                name="employeeSize"

                control={control}

                options={allConfig?.employeeSizeOptions || []}

                title={t('companyForm.title.companysize', 'Company Size')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.selectcompanysize', 'Select company size')}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="fieldOperation"

                title={t('companyForm.title.fieldofoperation', 'Field of Operation')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.entercompanyfieldofoperation', 'Enter company field of operation')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <DatePickerCustom

                name="since"

                control={control}

                title={t('companyForm.title.foundeddate', 'Founded Date')}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="websiteUrl"

                title={t('companyForm.title.websiteurl', 'Website URL')}

                placeholder={t('companyForm.placeholder.entercompanywebsiteurl', 'Enter company website URL')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="facebookUrl"

                title={t('companyForm.title.facebookurl', 'Facebook URL')}

                placeholder={t('companyForm.placeholder.enterfacebookurl', 'Enter Facebook URL')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="youtubeUrl"

                title={t('companyForm.title.youtubeurl', 'Youtube URL')}

                placeholder={t('companyForm.placeholder.enteryoutubeurl', 'Enter Youtube URL')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="linkedinUrl"

                title={t('companyForm.title.linkedinurl', 'Linkedin URL')}

                placeholder={t('companyForm.placeholder.enterlinkedinurl', 'Enter Linkedin URL')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="companyEmail"

                title={t('companyForm.title.companyemail', 'Company Email')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.entercompanyemail', 'Enter company email')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="companyPhone"

                title={t('companyForm.title.phonenumber', 'Phone Number')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.entercompanyphonenumber', 'Enter company phone number')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <SingleSelectCustom

                name="location.city"

                control={control}

                options={allConfig?.cityOptions || []}

                title={t('companyForm.title.cityprovince', 'City/Province')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.selectcityprovince', 'Select city/province')}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <SingleSelectCustom

                options={districtOptions}

                name="location.district"

                control={control}

                title={t('companyForm.title.district', 'Ward/Commune')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.selectdistrict', 'Select ward/commune')}

              />

            </Grid>

            <Grid size={12}>

              <TextFieldAutoCompleteCustom

                name="location.address"

                title={t('companyForm.title.address', 'Address')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.enteraddress', 'Enter address')}

                control={control}

                options={locationOptions}

                handleSelect={handleSelectLocation}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="location.lat"

                title={t('companyForm.title.latitude', 'Latitude')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.enterlatitudecoordinateonthemap', 'Enter latitude coordinate on the map.')}

                helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')}

                control={control}

              />

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 6,

                lg: 6,

                xl: 6

              }}>

              <TextFieldCustom

                name="location.lng"

                title={t('companyForm.title.longitude', 'Longitude')}

                showRequired={true}

                placeholder={t('companyForm.placeholder.enterlongitudecoordinateonthemap', 'Enter longitude coordinate on the map.')}

                helperText={t('companyForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')}

                control={control}

              />

            </Grid>

            <Grid size={12}>

              <RichTextEditorCustom

                name="description"

                control={control}

                title={t('companyForm.title.additionaldescription', 'Additional Description')}

              />

            </Grid>

          </Grid>

        </Grid>

      </Grid>

    </form>

  );

};

const Loading = () => {

  const { t } = useTranslation('employer');

  return (

    <Grid container>

      <Grid

        size={{

          xs: 12,

          sm: 12,

          md: 12,

          lg: 10,

          xl: 10

        }}>

        <Grid container spacing={2}>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <Skeleton height={50} />

          </Grid>

          <Grid size={12}>

            <Skeleton height={50} />

          </Grid>

          <Grid size={12}>

            <Skeleton height={50} />

          </Grid>

        </Grid>

      </Grid>

    </Grid>

  );

};

CompanyForm.Loading = Loading;

export default CompanyForm;
