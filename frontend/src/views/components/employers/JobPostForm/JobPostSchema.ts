import * as yup from 'yup';
import dayjs from 'dayjs';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import type { TFunction } from 'i18next';
import { BACKEND_CHOICE_VALUES } from '@/utils/backendChoiceValues';

type EditorState = import('draft-js').EditorState;

const MAX_JOB_POST_SALARY = 2_147_483_647;

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
    lat?: number | string | null;
    lng?: number | string | null;
  };
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  isUrgent?: boolean;
  isHot?: boolean;
}

export const getJobPostSchema = (t: TFunction<string | string[], undefined>) => 
  yup.object().shape({
    jobName: yup.string().required(t('jobPostForm.validation.jobnameisrequired')).max(255, t('jobPostForm.validation.jobnameexceededallowedlength')),
    interviewTemplate: yup.number().nullable().typeError(t('jobPostForm.validation.interviewtemplateinvalid')),
    career: yup.number().required(t('jobPostForm.validation.careerisrequired')).typeError(t('jobPostForm.validation.careerisrequired')),
    position: yup
      .number()
      .required(t('jobPostForm.validation.positionisrequired'))
      .oneOf(BACKEND_CHOICE_VALUES.position, t('jobPostForm.validation.choiceInvalid'))
      .typeError(t('jobPostForm.validation.positionisrequired')),
    experience: yup
      .number()
      .required(t('jobPostForm.validation.experienceisrequired'))
      .oneOf(BACKEND_CHOICE_VALUES.experience, t('jobPostForm.validation.choiceInvalid'))
      .typeError(t('jobPostForm.validation.experienceisrequired')),
    typeOfWorkplace: yup
      .number()
      .required(t('jobPostForm.validation.workplaceisrequired'))
      .oneOf(BACKEND_CHOICE_VALUES.typeOfWorkplace, t('jobPostForm.validation.choiceInvalid'))
      .typeError(t('jobPostForm.validation.workplaceisrequired')),
    jobType: yup
      .number()
      .required(t('jobPostForm.validation.jobtypeisrequired'))
      .oneOf(BACKEND_CHOICE_VALUES.jobType, t('jobPostForm.validation.choiceInvalid'))
      .typeError(t('jobPostForm.validation.jobtypeisrequired')),
    quantity: yup.number().required(t('jobPostForm.validation.numberofvacanciesisrequired')).typeError(t('jobPostForm.validation.invalidnumberofvacancies')).integer(t('jobPostForm.validation.invalidnumberofvacancies')).min(1, t('jobPostForm.validation.atleastonevacancyisrequired')),
    genderRequired: yup
      .string()
      .required(t('jobPostForm.validation.genderrequirementisrequired'))
      .oneOf(BACKEND_CHOICE_VALUES.gender, t('jobPostForm.validation.choiceInvalid'))
      .typeError(t('jobPostForm.validation.genderrequirementisrequired')),
    salaryMin: yup.number().required(t('jobPostForm.validation.minimumsalaryisrequired')).typeError(t('jobPostForm.validation.invalidminimumsalary')).integer(t('jobPostForm.validation.invalidminimumsalary')).min(0, t('jobPostForm.validation.invalidminimumsalary')).max(MAX_JOB_POST_SALARY, t('jobPostForm.validation.salaryTooLarge')).test('minimum-wage-comparison', t('jobPostForm.validation.minSalaryLess'), function (value) { return !(value > this.parent.salaryMax); }),
    salaryMax: yup.number().required(t('jobPostForm.validation.maximumsalaryisrequired')).typeError(t('jobPostForm.validation.invalidmaximumsalary')).integer(t('jobPostForm.validation.invalidmaximumsalary')).min(0, t('jobPostForm.validation.invalidmaximumsalary')).max(MAX_JOB_POST_SALARY, t('jobPostForm.validation.salaryTooLarge')).test('maximum-wage-comparison', t('jobPostForm.validation.maxSalaryGreater'), function (value) { return !(value < this.parent.salaryMin); }),
    academicLevel: yup
      .number()
      .required(t('jobPostForm.validation.academiclevelisrequired'))
      .oneOf(BACKEND_CHOICE_VALUES.academicLevel, t('jobPostForm.validation.choiceInvalid'))
      .typeError(t('jobPostForm.validation.academiclevelisrequired')),
    deadline: yup.date().required(t('jobPostForm.validation.applicationdeadlineisrequired')).typeError(t('jobPostForm.validation.invalidapplicationdeadline')).min(dayjs().startOf('day').toDate(), t('jobPostForm.validation.deadlinemustbeaftertoday')),
    jobDescription: yup.mixed().test('editorContent', t('jobPostForm.validation.jobDescRequired'), (value) => (value as EditorState)?.getCurrentContent?.()?.hasText?.()),
    jobRequirement: yup.mixed().test('editorContent', t('jobPostForm.validation.jobReqRequired'), (value) => (value as EditorState)?.getCurrentContent?.()?.hasText?.()),
    benefitsEnjoyed: yup.mixed().test('editorContent', t('jobPostForm.validation.benefitsRequired'), (value) => (value as EditorState)?.getCurrentContent?.()?.hasText?.()),
    location: yup.object().shape({
      city: yup.number().required(t('jobPostForm.validation.cityprovinceisrequired')).typeError(t('jobPostForm.validation.cityprovinceisrequired')),
      district: yup.number().required(t('jobPostForm.validation.districtisrequired')).typeError(t('jobPostForm.validation.districtisrequired')),
      address: yup.string().required(t('jobPostForm.validation.addressisrequired')).max(255, t('jobPostForm.validation.addressexceededallowedlength')),
      lat: yup.number().nullable().transform((value, originalValue) => originalValue === '' ? null : value).typeError(t('jobPostForm.validation.invalidlatitude')),
      lng: yup.number().nullable().transform((value, originalValue) => originalValue === '' ? null : value).typeError(t('jobPostForm.validation.invalidlongitude')),
    }),
    contactPersonName: yup.string().required(t('jobPostForm.validation.contactpersonnameisrequired')).max(100, t('jobPostForm.validation.contactpersonnameexceededallowedlength')),
    contactPersonPhone: yup.string().required(t('jobPostForm.validation.contactpersonphoneisrequired')).matches(REGEX_VALIDATE.phoneRegExp, t('jobPostForm.validation.invalidphonenumber')).max(15, t('jobPostForm.validation.contactpersonphoneexceededallowedlength')),
    contactPersonEmail: yup.string().required(t('jobPostForm.validation.contactpersonemailisrequired')).email(t('jobPostForm.validation.invalidemail')).max(100, t('jobPostForm.validation.contactpersonemailexceededallowedlength')),
    isUrgent: yup.boolean(),
    isHot: yup.boolean(),
  });
