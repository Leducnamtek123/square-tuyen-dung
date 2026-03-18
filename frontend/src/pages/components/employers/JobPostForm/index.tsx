import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Alert } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { EditorState } from 'draft-js';
import dayjs from 'dayjs';
import { DATE_OPTIONS, REGEX_VALIDATE } from '../../../../configs/constants';
import useDebounce from '../../../../hooks/useDebounce';
import errorHandling from '../../../../utils/errorHandling';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/controls/DatePickerCustom';
import CheckboxCustom from '../../../../components/controls/CheckboxCustom';
import commonService from '../../../../services/commonService';
import RichTextEditorCustom from '../../../../components/controls/RichTextEditorCustom';
import TextFieldAutoCompleteCustom from '../../../../components/controls/TextFieldAutoCompleteCustom';
import goongService from '../../../../services/goongService';
import { useAppSelector } from '../../../../redux/hooks';

interface JobPostFormProps {
  handleAddOrUpdate: (data: any) => void;
  editData: any;
  serverErrors: any;
}

interface JobPostFormValues {
  jobName?: string;
  career?: number | string;
  position?: number | string;
  experience?: number | string;
  typeOfWorkplace?: number | string;
  jobType?: number | string;
  quantity?: number | string;
  genderRequired?: string;
  salaryMin?: number | string;
  salaryMax?: number | string;
  academicLevel?: number | string;
  deadline?: Date | string;
  jobDescription: EditorState;
  jobRequirement: EditorState;
  benefitsEnjoyed: EditorState;
  location: {
    city: number | string;
    district: number | string;
    address: string;
    lat: number | string;
    lng: number | string;
  };
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  isUrgent?: boolean;
}



const JobPostForm = ({ handleAddOrUpdate, editData, serverErrors }: JobPostFormProps) => {

  const { t } = useTranslation('employer');

  const { allConfig } = useAppSelector((state) => state.config);

  const [districtOptions, setDistrictOptions] = React.useState<any[]>([]);

  const [locationOptions, setLocationOptions] = React.useState<any[]>([]);

  const schema = yup.object().shape({

    jobName: yup

      .string()

      .required(t('jobPostForm.validation.jobnameisrequired', 'Job name is required.'))

      .max(200, t('jobPostForm.validation.jobnameexceededallowedlength', 'Job name exceeded allowed length.')),

    career: yup

      .number()

      .required(t('jobPostForm.validation.careerisrequired', 'Career is required.'))

      .typeError(t('jobPostForm.validation.careerisrequired', 'Career is required.')),

    position: yup

      .number()

      .required(t('jobPostForm.validation.positionisrequired', 'Position is required.'))

      .typeError(t('jobPostForm.validation.positionisrequired', 'Position is required.')),

    experience: yup

      .number()

      .required(t('jobPostForm.validation.experienceisrequired', 'Experience is required.'))

      .typeError(t('jobPostForm.validation.experienceisrequired', 'Experience is required.')),

    typeOfWorkplace: yup

      .number()

      .required(t('jobPostForm.validation.workplaceisrequired', 'Workplace is required.'))

      .typeError(t('jobPostForm.validation.workplaceisrequired', 'Workplace is required.')),

    jobType: yup

      .number()

      .required(t('jobPostForm.validation.jobtypeisrequired', 'Job type is required.'))

      .typeError(t('jobPostForm.validation.jobtypeisrequired', 'Job type is required.')),

    quantity: yup

      .number()

      .required(t('jobPostForm.validation.numberofvacanciesisrequired', 'Number of vacancies is required.'))

      .typeError(t('jobPostForm.validation.invalidnumberofvacancies', 'Invalid number of vacancies.'))

      .min(1, t('jobPostForm.validation.atleastonevacancyisrequired', 'At least one vacancy is required.')),

    genderRequired: yup

      .string()

      .required(t('jobPostForm.validation.genderrequirementisrequired', 'Gender requirement is required.'))

      .typeError(t('jobPostForm.validation.genderrequirementisrequired', 'Gender requirement is required.')),

    salaryMin: yup

      .number()

      .required(t('jobPostForm.validation.minimumsalaryisrequired', 'Minimum salary is required.'))

      .typeError(t('jobPostForm.validation.invalidminimumsalary', 'Invalid minimum salary.'))

      .min(0, t('jobPostForm.validation.invalidminimumsalary', 'Invalid minimum salary.'))

      .test(

        'minimum-wage-comparison',

        t('jobPostForm.validation.minSalaryLess', 'Minimum salary must be less than maximum salary.'),

        function (value) {

          return !(value >= this.parent.salaryMax);

        }

      ),

    salaryMax: yup

      .number()

      .required(t('jobPostForm.validation.maximumsalaryisrequired', 'Maximum salary is required.'))

      .typeError(t('jobPostForm.validation.invalidmaximumsalary', 'Invalid maximum salary.'))

      .min(0, t('jobPostForm.validation.invalidmaximumsalary', 'Invalid maximum salary.'))

      .test(

        'maximum-wage-comparison',

        t('jobPostForm.validation.maxSalaryGreater', 'Maximum salary must be greater than minimum salary.'),

        function (value) {

          return !(value <= this.parent.salaryMin);

        }

      ),

    academicLevel: yup

      .number()

      .required(t('jobPostForm.validation.academiclevelisrequired', 'Academic level is required.'))

      .typeError(t('jobPostForm.validation.academiclevelisrequired', 'Academic level is required.')),

    deadline: yup

      .date()

      .required(t('jobPostForm.validation.applicationdeadlineisrequired', 'Application deadline is required.'))

      .typeError(t('jobPostForm.validation.invalidapplicationdeadline', 'Invalid application deadline.'))

      .min(dayjs().add(1, 'day').toDate(), t('jobPostForm.validation.deadlinemustbeaftertoday', 'Deadline must be after today.')),

    jobDescription: yup

      .mixed()

      .test(

        'editorContent',

        t('jobPostForm.validation.jobDescRequired', 'Job description is required.'),

        (value: any) => value?.getCurrentContent?.()?.hasText?.()

      ),

    jobRequirement: yup

      .mixed()

      .test(

        'editorContent',

        t('jobPostForm.validation.jobReqRequired', 'Job requirement is required.'),

        (value: any) => value?.getCurrentContent?.()?.hasText?.()

      ),

    benefitsEnjoyed: yup

      .mixed()

      .test(

        'editorContent',

        t('jobPostForm.validation.benefitsRequired', 'Benefits are required.'),

        (value: any) => value?.getCurrentContent?.()?.hasText?.()

      ),

    location: yup.object().shape({

      city: yup

        .number()

        .required(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.'))

        .typeError(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')),

      district: yup

        .number()

        .required(t('jobPostForm.validation.districtisrequired', 'District is required.'))

        .typeError(t('jobPostForm.validation.districtisrequired', 'District is required.')),

      address: yup

        .string()

        .required(t('jobPostForm.validation.addressisrequired', 'Address is required.'))

        .max(255, t('jobPostForm.validation.addressexceededallowedlength', 'Address exceeded allowed length.')),

      lat: yup

        .number()

        .required(t('jobPostForm.validation.latitudeisrequired', 'Latitude is required.'))

        .typeError(t('jobPostForm.validation.invalidlatitude', 'Invalid latitude.')),

      lng: yup

        .number()

        .required(t('jobPostForm.validation.longitudeisrequired', 'Longitude is required.'))

        .typeError(t('jobPostForm.validation.invalidlongitude', 'Invalid longitude.')),

    }),

    contactPersonName: yup

      .string()

      .required(t('jobPostForm.validation.contactpersonnameisrequired', 'Contact person name is required.'))

      .max(100, t('jobPostForm.validation.contactpersonnameexceededallowedlength', 'Contact person name exceeded allowed length.')),

    contactPersonPhone: yup

      .string()

      .required(t('jobPostForm.validation.contactpersonphoneisrequired', 'Contact person phone is required.'))

      .matches(REGEX_VALIDATE.phoneRegExp, t('jobPostForm.validation.invalidphonenumber', 'Invalid phone number.'))

      .max(15, t('jobPostForm.validation.contactpersonphoneexceededallowedlength', 'Contact person phone exceeded allowed length.')),

    contactPersonEmail: yup

      .string()

      .required(t('jobPostForm.validation.contactpersonemailisrequired', 'Contact person email is required.'))
      .email(t('jobPostForm.validation.invalidemail', 'Invalid email.'))
      .max(100, t('jobPostForm.validation.contactpersonemailexceededallowedlength', 'Contact person email exceeded allowed length.')),
    isUrgent: yup.boolean().default(false),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    formState: { errors: formErrors },
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

    const loadDistricts = async (cityId: number | string) => {

      try {

        const resData = await commonService.getDistrictsByCityId(cityId);

        if (districtOptions.length > 0) setValue('location.district', '');

        setDistrictOptions((resData as any).data || []);

      } catch (error: any) {

        errorHandling(error);

      } finally {

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

        if ((resData as any)?.predictions) setLocationOptions((resData as any).predictions);

      } catch (error) {}

    };

    loadLocation(addressDebounce);

  }, [addressDebounce]);

  React.useEffect(() => {

    if (editData) {

      reset((formValues) => ({

        ...formValues,

        ...editData,

      }));

    } else {

      reset();

    }

  }, [editData, reset]);

  React.useEffect(() => {

    if (serverErrors !== null)

      for (let err in serverErrors) {

        setError(err as any, {

          type: 'manual',

          message: serverErrors[err]?.join(' '),
        });

    }

  }, [serverErrors, setError, reset]);

  const handleSelectLocation = async (e: any, value: any) => {
    if (!value || typeof value !== 'object' || !value.place_id) {
      return;
    }

    try {

      const resData = await goongService.getPlaceDetailByPlaceId(

        value.place_id
      );

      if (!(resData as any)?.result?.geometry?.location) {
        return;
      }
      const location = (resData as any).result.geometry.location;
      setValue('location.lng', location.lng);
      setValue('location.lat', location.lat);

    } catch (error) {}

  };

  return (

    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>

      <Grid container spacing={2}>

        <Grid size={12}>

          <Alert severity="warning">

            {t('jobPostForm.warning', 'When you update the post, it will be pending approval!')}

          </Alert>

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="jobName"

            title={t('jobPostForm.title.jobtitle', 'Job Title')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.enterjobtitle', 'Enter job title')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <SingleSelectCustom

            name="career"

            control={control}

            options={allConfig?.careerOptions || []}

            title={t('jobPostForm.title.career', 'Career')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectcareer', 'Select career')}

          />

        </Grid>

        <Grid size={6}>

          <SingleSelectCustom

            name="position"

            control={control}

            options={allConfig?.positionOptions || []}

            title={t('jobPostForm.title.position', 'Position')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectposition', 'Select position')}

          />

        </Grid>

        <Grid size={6}>

          <SingleSelectCustom

            name="experience"

            control={control}

            options={allConfig?.experienceOptions || []}

            title={t('jobPostForm.title.experience', 'Experience')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectrequiredexperience', 'Select required experience')}

          />

        </Grid>

        <Grid size={6}>

          <SingleSelectCustom

            name="typeOfWorkplace"

            control={control}

            options={allConfig?.typeOfWorkplaceOptions || []}

            title={t('jobPostForm.title.workplace', 'Workplace')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectworkplace', 'Select workplace')}

          />

        </Grid>

        <Grid size={6}>

          <SingleSelectCustom

            name="jobType"

            control={control}

            options={allConfig?.jobTypeOptions || []}

            title={t('jobPostForm.title.jobtype', 'Job Type')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectjobtype', 'Select job type')}

          />

        </Grid>

        <Grid size={6}>
          <TextFieldCustom
            name="quantity"
            title={t('jobPostForm.title.numberofvacancies', 'Number of Vacancies')}
            placeholder={t('jobPostForm.placeholder.enternumberofvacancies', 'Enter number of vacancies')}
            error={!!(formErrors as any).quantity}
            showRequired={true}
            control={control}
            type="number"
          />
        </Grid>

        <Grid size={6}>

          <SingleSelectCustom

            name="genderRequired"

            control={control}

            options={allConfig?.genderOptions || []}

            title={t('jobPostForm.title.genderrequirement', 'Gender Requirement')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectgenderrequirement', 'Select gender requirement')}

          />

        </Grid>

        <Grid size={6}>

          <TextFieldCustom

            name="salaryMin"

            title={t('jobPostForm.title.minimumsalary', 'Minimum Salary')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.enterminimumsalary', 'Enter minimum salary')}

            control={control}

            type="number"

          />

        </Grid>

        <Grid size={6}>

          <TextFieldCustom

            name="salaryMax"

            title={t('jobPostForm.title.maximumsalary', 'Maximum Salary')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.entermaximumsalary', 'Enter maximum salary')}

            control={control}

            type="number"

          />

        </Grid>

        <Grid size={6}>

          <SingleSelectCustom

            name="academicLevel"

            control={control}

            options={allConfig?.academicLevelOptions || []}

            title={t('jobPostForm.title.academiclevel', 'Academic Level')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectacademiclevel', 'Select academic level')}

          />

        </Grid>

        <Grid size={6}>

          <DatePickerCustom

            name="deadline"

            control={control}

            showRequired={true}

            title={t('jobPostForm.title.applicationdeadline', 'Application Deadline')}

            minDate={DATE_OPTIONS.tomorrow}

          />

        </Grid>

        <Grid size={12}>

          <RichTextEditorCustom

            name="jobDescription"

            control={control}

            title={t('jobPostForm.title.jobdescription', 'Job Description')}

            showRequired={true}

          />

        </Grid>

        <Grid size={12}>

          <RichTextEditorCustom

            name="jobRequirement"

            control={control}

            title={t('jobPostForm.title.jobrequirement', 'Job Requirement')}

            showRequired={true}

          />

        </Grid>

        <Grid size={12}>

          <RichTextEditorCustom

            name="benefitsEnjoyed"

            control={control}

            title={t('jobPostForm.title.benefits', 'Benefits')}

            showRequired={true}

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

            title={t('jobPostForm.title.cityprovince', 'City/Province')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectcityprovince', 'Select city/province')}

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

            name="location.district"

            control={control}

            options={districtOptions}

            title={t('jobPostForm.title.district', 'Ward/Commune')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.selectdistrict', 'Select ward/commune')}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldAutoCompleteCustom

            name="location.address"

            title={t('jobPostForm.title.address', 'Address')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.enteraddress', 'Enter address')}

            control={control}

            options={locationOptions}

            loading={true}

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

            title={t('jobPostForm.title.latitude', 'Latitude')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.enterlatitudecoordinateofthecompanyonthemap', 'Enter latitude coordinate of the company on the map.')}

            helperText={t('jobPostForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')}

            control={control}

            type="number"

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

            title={t('jobPostForm.title.longitude', 'Longitude')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.enterlongitudecoordinateofthecompanyonthemap', 'Enter longitude coordinate of the company on the map.')}

            helperText={t('jobPostForm.helperText.automaticallyfilledifyouchooseasuggestedaddress', 'Automatically filled if you choose a suggested address.')}

            control={control}

            type="number"

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="contactPersonName"

            title={t('jobPostForm.title.contactpersonname', 'Contact Person Name')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.entercontactpersonname', 'Enter contact person name')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="contactPersonPhone"

            title={t('jobPostForm.title.contactpersonphone', 'Contact Person Phone')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.entercontactpersonphone', 'Enter contact person phone')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <TextFieldCustom

            name="contactPersonEmail"

            title={t('jobPostForm.title.contactpersonemail', 'Contact Person Email')}

            showRequired={true}

            placeholder={t('jobPostForm.placeholder.entercontactpersonemail', 'Enter contact person email')}

            control={control}

          />

        </Grid>

        <Grid size={12}>

          <CheckboxCustom name="isUrgent" control={control} title={t('jobPostForm.title.urgent', 'Urgent')} />

        </Grid>

      </Grid>

    </form>

  );

};

export default JobPostForm;

