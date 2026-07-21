import type { CompanyFormData } from './types';

export type CompanyFormValidationData = CompanyFormData;

export type CompanyFormValidationErrors = Partial<Record<
  | 'companyName'
  | 'taxCode'
  | 'companyEmail'
  | 'companyPhone'
  | 'employeeSize'
  | 'fieldOperation'
  | 'websiteUrl'
  | 'since'
  | 'city'
  | 'district'
  | 'ward'
  | 'address',
  string
>>;

const PHONE_PATTERN = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
const EMPLOYEE_SIZE_CHOICES = new Set([1, 2, 3, 4]);

const isBlank = (value: unknown) => !String(value ?? '').trim();

const isPositiveInteger = (value: unknown) => (
  typeof value === 'number' && Number.isInteger(value) && value > 0
);

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isFutureDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() > today.getTime();
};

export const getCompanyFormValidationErrors = (
  formData: CompanyFormValidationData,
): CompanyFormValidationErrors => {
  const errors: CompanyFormValidationErrors = {};
  const companyName = String(formData.companyName ?? '').trim();
  const taxCode = String(formData.taxCode ?? '').trim();
  const companyEmail = String(formData.companyEmail ?? '').trim();
  const companyPhone = String(formData.companyPhone ?? '').trim();
  const fieldOperation = String(formData.fieldOperation ?? '').trim();
  const websiteUrl = String(formData.websiteUrl ?? '').trim();
  const since = String(formData.since ?? '').trim();
  const address = String(formData.location?.address ?? '').trim();
  const employeeSize = Number(formData.employeeSize);

  if (!companyName) {
    errors.companyName = 'companyNameRequired';
  } else if (companyName.length > 255) {
    errors.companyName = 'companyNameMax';
  }

  if (!taxCode) {
    errors.taxCode = 'taxCodeRequired';
  } else if (taxCode.length > 30) {
    errors.taxCode = 'taxCodeMax';
  }

  if (!companyEmail) {
    errors.companyEmail = 'companyEmailRequired';
  } else if (companyEmail.length > 100) {
    errors.companyEmail = 'companyEmailMax';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
    errors.companyEmail = 'companyEmailInvalid';
  }

  if (!companyPhone) {
    errors.companyPhone = 'companyPhoneRequired';
  } else if (companyPhone.length > 15) {
    errors.companyPhone = 'companyPhoneMax';
  } else if (!PHONE_PATTERN.test(companyPhone)) {
    errors.companyPhone = 'companyPhoneInvalid';
  }

  if (!Number.isInteger(employeeSize) || !EMPLOYEE_SIZE_CHOICES.has(employeeSize)) {
    errors.employeeSize = 'employeeSizeInvalid';
  }

  if (!fieldOperation) {
    errors.fieldOperation = 'fieldOperationRequired';
  } else if (fieldOperation.length > 255) {
    errors.fieldOperation = 'fieldOperationMax';
  }

  if (websiteUrl) {
    if (websiteUrl.length > 300) {
      errors.websiteUrl = 'websiteUrlMax';
    } else if (!isValidUrl(websiteUrl)) {
      errors.websiteUrl = 'websiteUrlInvalid';
    }
  }

  if (since) {
    const future = isFutureDate(since);
    if (future === null) {
      errors.since = 'sinceInvalid';
    } else if (future) {
      errors.since = 'sinceFuture';
    }
  }

  if (!formData.location || isBlank(formData.location.city)) {
    errors.city = 'cityRequired';
  } else if (!isPositiveInteger(formData.location.city)) {
    errors.city = 'cityInvalid';
  }

  if (!formData.location || isBlank(formData.location.district)) {
    errors.district = 'districtRequired';
  } else if (!isPositiveInteger(formData.location.district)) {
    errors.district = 'districtInvalid';
  }

  if (formData.location?.ward !== null && formData.location?.ward !== undefined && !isPositiveInteger(formData.location.ward)) {
    errors.ward = 'wardInvalid';
  }

  if (!address) {
    errors.address = 'addressRequired';
  } else if (address.length > 255) {
    errors.address = 'addressMax';
  }

  return errors;
};
