import * as yup from 'yup';

export interface CandidateStep1Values {
  desiredJobTitle: string;
  careerId: number | string;
  cityId: number | string;
  typeOfWorkplace: number;
  address?: string;
  lat?: number | string | null;
  lng?: number | string | null;
}

export interface CandidateStep2Values {
  skills: string[];
  experience: number;
  isSalaryNegotiable: boolean;
  salaryMin?: number | string;
  salaryMax?: number | string;
  academicLevel?: number;
}

export interface CandidateStep3Values {
  fileId?: number | null;
  fileName?: string;
  fileUrl?: string;
}

export interface CandidateFullFormValues
  extends CandidateStep1Values,
    CandidateStep2Values,
    CandidateStep3Values {}

export const createCandidateStep1Schema = (t: (key: any, defaultVal?: any) => any) =>
  yup.object({
    desiredJobTitle: yup
      .string()
      .trim()
      .required(t('onboarding.validation.desiredJobTitleRequired', 'Vui lòng nhập vị trí công việc mong muốn.')),
    careerId: yup
      .mixed()
      .required(t('onboarding.validation.careerRequired', 'Vui lòng chọn ngành nghề chính.'))
      .test(
        'is-valid-career',
        t('onboarding.validation.careerRequired', 'Vui lòng chọn ngành nghề chính.'),
        (val) => val !== '' && val !== null && val !== undefined,
      ),
    cityId: yup
      .mixed()
      .required(t('onboarding.validation.cityRequired', 'Vui lòng chọn địa điểm làm việc mong muốn.'))
      .test(
        'is-valid-city',
        t('onboarding.validation.cityRequired', 'Vui lòng chọn địa điểm làm việc mong muốn.'),
        (val) => val !== '' && val !== null && val !== undefined,
      ),
    typeOfWorkplace: yup.number().default(1),
  });

export const createCandidateStep2Schema = (t: (key: any, defaultVal?: any) => any) =>
  yup.object({
    skills: yup
      .array()
      .of(yup.string().required())
      .min(1, t('onboarding.validation.skillsMin', 'Vui lòng chọn hoặc nhập ít nhất 1 kỹ năng.'))
      .required(t('onboarding.validation.skillsMin', 'Vui lòng chọn hoặc nhập ít nhất 1 kỹ năng.')),
    experience: yup.number().default(1),
    isSalaryNegotiable: yup.boolean().default(false),
    salaryMin: yup.number().optional().nullable(),
    salaryMax: yup
      .number()
      .optional()
      .nullable()
      .test(
        'salary-min-max',
        t('onboarding.validation.salaryRangeInvalid', 'Lương tối thiểu không được lớn hơn lương tối đa.'),
        function (val) {
          const { salaryMin, isSalaryNegotiable } = this.parent;
          if (isSalaryNegotiable) return true;
          if (salaryMin && val && Number(salaryMin) > Number(val)) {
            return false;
          }
          return true;
        },
      ),
    academicLevel: yup.number().default(3),
  });

export const createCandidateStep3Schema = () =>
  yup.object({
    fileId: yup.number().nullable().optional(),
    fileName: yup.string().optional(),
    fileUrl: yup.string().optional(),
  });
