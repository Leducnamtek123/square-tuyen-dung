import * as yup from 'yup';
import { EditorState } from 'draft-js';
import dayjs from 'dayjs';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import type { TFunction } from 'i18next';

export interface JobPostFormValues {
  jobName?: string;
  career?: number | string;
  position?: number | string;
  interviewTemplate?: number | string | null;
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
  isHot?: boolean;
}

export const getJobPostSchema = (t: TFunction<string | string[], undefined>) => 
  yup.object().shape({
    jobName: yup.string().required(t('jobPostForm.validation.jobnameisrequired', 'Job name is required.')).max(200, t('jobPostForm.validation.jobnameexceededallowedlength', 'Job name exceeded allowed length.')),
    interviewTemplate: yup.number().nullable().typeError(t('jobPostForm.validation.interviewtemplateinvalid', 'Invalid Interview Template selection.')),
    career: yup.number().required(t('jobPostForm.validation.careerisrequired', 'Career is required.')).typeError(t('jobPostForm.validation.careerisrequired', 'Career is required.')),
    position: yup.number().required(t('jobPostForm.validation.positionisrequired', 'Position is required.')).typeError(t('jobPostForm.validation.positionisrequired', 'Position is required.')),
    experience: yup.number().required(t('jobPostForm.validation.experienceisrequired', 'Experience is required.')).typeError(t('jobPostForm.validation.experienceisrequired', 'Experience is required.')),
    typeOfWorkplace: yup.number().required(t('jobPostForm.validation.workplaceisrequired', 'Workplace is required.')).typeError(t('jobPostForm.validation.workplaceisrequired', 'Workplace is required.')),
    jobType: yup.number().required(t('jobPostForm.validation.jobtypeisrequired', 'Job type is required.')).typeError(t('jobPostForm.validation.jobtypeisrequired', 'Job type is required.')),
    quantity: yup.number().required(t('jobPostForm.validation.numberofvacanciesisrequired', 'Number of vacancies is required.')).typeError(t('jobPostForm.validation.invalidnumberofvacancies', 'Invalid number of vacancies.')).min(1, t('jobPostForm.validation.atleastonevacancyisrequired', 'At least one vacancy is required.')),
    genderRequired: yup.string().required(t('jobPostForm.validation.genderrequirementisrequired', 'Gender requirement is required.')).typeError(t('jobPostForm.validation.genderrequirementisrequired', 'Gender requirement is required.')),
    salaryMin: yup.number().required(t('jobPostForm.validation.minimumsalaryisrequired', 'Minimum salary is required.')).typeError(t('jobPostForm.validation.invalidminimumsalary', 'Invalid minimum salary.')).min(0, t('jobPostForm.validation.invalidminimumsalary', 'Invalid minimum salary.')).test('minimum-wage-comparison', t('jobPostForm.validation.minSalaryLess', 'Minimum salary must be less than maximum salary.'), function (value) { return !(value >= this.parent.salaryMax); }),
    salaryMax: yup.number().required(t('jobPostForm.validation.maximumsalaryisrequired', 'Maximum salary is required.')).typeError(t('jobPostForm.validation.invalidmaximumsalary', 'Invalid maximum salary.')).min(0, t('jobPostForm.validation.invalidmaximumsalary', 'Invalid maximum salary.')).test('maximum-wage-comparison', t('jobPostForm.validation.maxSalaryGreater', 'Maximum salary must be greater than minimum salary.'), function (value) { return !(value <= this.parent.salaryMin); }),
    academicLevel: yup.number().required(t('jobPostForm.validation.academiclevelisrequired', 'Academic level is required.')).typeError(t('jobPostForm.validation.academiclevelisrequired', 'Academic level is required.')),
    deadline: yup.date().required(t('jobPostForm.validation.applicationdeadlineisrequired', 'Application deadline is required.')).typeError(t('jobPostForm.validation.invalidapplicationdeadline', 'Invalid application deadline.')).min(dayjs().add(1, 'day').toDate(), t('jobPostForm.validation.deadlinemustbeaftertoday', 'Deadline must be after today.')),
    jobDescription: yup.mixed().test('editorContent', t('jobPostForm.validation.jobDescRequired', 'Job description is required.'), (value) => (value as EditorState)?.getCurrentContent?.()?.hasText?.()),
    jobRequirement: yup.mixed().test('editorContent', t('jobPostForm.validation.jobReqRequired', 'Job requirement is required.'), (value) => (value as EditorState)?.getCurrentContent?.()?.hasText?.()),
    benefitsEnjoyed: yup.mixed().test('editorContent', t('jobPostForm.validation.benefitsRequired', 'Benefits are required.'), (value) => (value as EditorState)?.getCurrentContent?.()?.hasText?.()),
    location: yup.object().shape({
      city: yup.number().required(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')).typeError(t('jobPostForm.validation.cityprovinceisrequired', 'City/Province is required.')),
      district: yup.number().required(t('jobPostForm.validation.districtisrequired', 'District is required.')).typeError(t('jobPostForm.validation.districtisrequired', 'District is required.')),
      address: yup.string().required(t('jobPostForm.validation.addressisrequired', 'Address is required.')).max(255, t('jobPostForm.validation.addressexceededallowedlength', 'Address exceeded allowed length.')),
      lat: yup.number().required(t('jobPostForm.validation.latitudeisrequired', 'Latitude is required.')).typeError(t('jobPostForm.validation.invalidlatitude', 'Invalid latitude.')),
      lng: yup.number().required(t('jobPostForm.validation.longitudeisrequired', 'Longitude is required.')).typeError(t('jobPostForm.validation.invalidlongitude', 'Invalid longitude.')),
    }),
    contactPersonName: yup.string().required(t('jobPostForm.validation.contactpersonnameisrequired', 'Contact person name is required.')).max(100, t('jobPostForm.validation.contactpersonnameexceededallowedlength', 'Contact person name exceeded allowed length.')),
    contactPersonPhone: yup.string().required(t('jobPostForm.validation.contactpersonphoneisrequired', 'Contact person phone is required.')).matches(REGEX_VALIDATE.phoneRegExp, t('jobPostForm.validation.invalidphonenumber', 'Invalid phone number.')).max(15, t('jobPostForm.validation.contactpersonphoneexceededallowedlength', 'Contact person phone exceeded allowed length.')),
    contactPersonEmail: yup.string().required(t('jobPostForm.validation.contactpersonemailisrequired', 'Contact person email is required.')).email(t('jobPostForm.validation.invalidemail', 'Invalid email.')).max(100, t('jobPostForm.validation.contactpersonemailexceededallowedlength', 'Contact person email exceeded allowed length.')),
    isUrgent: yup.boolean(),
    isHot: yup.boolean(),
  });
