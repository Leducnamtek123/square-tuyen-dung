import * as yup from 'yup';

export interface EmployerStep1Values {
  companyName: string;
  taxCode?: string;
  employeeSize?: number;
  fieldOperation?: string;
  cityId?: number | string;
  districtId?: number | string;
  address?: string;
  websiteUrl?: string;
  logoId?: number | null;
  logoUrl?: string;
}

export interface EmployerStep2Values {
  recruiterName: string;
  recruiterTitle?: string;
  recruiterPhone?: string;
  recruiterEmail?: string;
  hiringNeeds?: string[];
  description?: string;
}

export interface EmployerStep3Values {
  gpkdFileId?: number | null;
  gpkdFileName?: string;
  gpkdFileUrl?: string;
}

export interface EmployerFullFormValues
  extends EmployerStep1Values,
    EmployerStep2Values,
    EmployerStep3Values {}

export const createEmployerStep1Schema = (t: (key: any, defaultVal?: any) => any) =>
  yup.object({
    companyName: yup
      .string()
      .trim()
      .required(t('employerOnboarding.validation.companyNameRequired', 'Vui lòng nhập tên công ty / doanh nghiệp.')),
    taxCode: yup.string().trim().optional(),
    employeeSize: yup.number().default(2),
    fieldOperation: yup.string().optional(),
    cityId: yup.mixed().optional(),
    districtId: yup.mixed().optional(),
    address: yup.string().trim().optional(),
    websiteUrl: yup.string().trim().optional(),
    logoId: yup.number().nullable().optional(),
    logoUrl: yup.string().optional(),
  });

export const createEmployerStep2Schema = (t: (key: any, defaultVal?: any) => any) =>
  yup.object({
    recruiterName: yup
      .string()
      .trim()
      .required(t('employerOnboarding.validation.recruiterNameRequired', 'Vui lòng nhập họ tên người phụ trách tuyển dụng.')),
    recruiterTitle: yup.string().trim().optional(),
    recruiterPhone: yup.string().trim().optional(),
    recruiterEmail: yup.string().email('Email không hợp lệ').trim().optional(),
    hiringNeeds: yup.array().of(yup.string()).optional(),
    description: yup.string().trim().optional(),
  });

export const createEmployerStep3Schema = () =>
  yup.object({
    gpkdFileId: yup.number().nullable().optional(),
    gpkdFileName: yup.string().optional(),
    gpkdFileUrl: yup.string().optional(),
  });
