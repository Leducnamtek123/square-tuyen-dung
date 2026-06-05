import type { JobPostNotification } from '../../../types/models';
import type { JobPostNotificationPayload } from '../../../services/adminManagementService';
import { BACKEND_CHOICE_VALUES } from '../../../utils/backendChoiceValues';

export type JobNotificationsDialogMode = 'add' | 'edit';

export type JobNotificationsFormData = JobPostNotificationPayload;
export type JobNotificationFormValidationErrors = Partial<Record<
  'jobName' | 'salary' | 'frequency' | 'position' | 'experience' | 'career' | 'city',
  string
>>;

export const JOB_NOTIFICATION_FREQUENCY_OPTIONS = BACKEND_CHOICE_VALUES.frequencyNotification;
export const DEFAULT_JOB_NOTIFICATION_FREQUENCY = JOB_NOTIFICATION_FREQUENCY_OPTIONS[0];

export const normalizeJobNotificationFrequency = (value: number | null | undefined): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && JOB_NOTIFICATION_FREQUENCY_OPTIONS.includes(numericValue)
    ? numericValue
    : DEFAULT_JOB_NOTIFICATION_FREQUENCY;
};

const getOptionalNumber = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
};

const isValidChoiceValue = (value: number | null | undefined, choices: number[]) => (
  value === null || value === undefined || choices.includes(Number(value))
);

const isValidOptionalPositiveInteger = (value: number | null | undefined) => {
  const numericValue = getOptionalNumber(value);
  return numericValue === null || (Number.isInteger(numericValue) && numericValue > 0);
};

export const getJobNotificationFormValidationErrors = (
  formData: JobNotificationsFormData,
): JobNotificationFormValidationErrors => {
  const errors: JobNotificationFormValidationErrors = {};
  const jobName = formData.jobName.trim();

  if (!jobName) {
    errors.jobName = 'jobNameRequired';
  } else if (jobName.length > 255) {
    errors.jobName = 'jobNameMax';
  }

  const salary = getOptionalNumber(formData.salary);
  if (salary !== null) {
    if (!Number.isInteger(salary)) {
      errors.salary = 'numberInteger';
    } else if (salary < 0) {
      errors.salary = 'salaryMin';
    }
  }

  if (!JOB_NOTIFICATION_FREQUENCY_OPTIONS.includes(Number(formData.frequency))) {
    errors.frequency = 'frequencyInvalid';
  }

  if (!isValidChoiceValue(formData.position, BACKEND_CHOICE_VALUES.position)) {
    errors.position = 'choiceInvalid';
  }

  if (!isValidChoiceValue(formData.experience, BACKEND_CHOICE_VALUES.experience)) {
    errors.experience = 'choiceInvalid';
  }

  if (!isValidOptionalPositiveInteger(formData.career)) {
    errors.career = 'idInvalid';
  }

  if (!isValidOptionalPositiveInteger(formData.city)) {
    errors.city = 'idInvalid';
  }

  return errors;
};

export type JobNotificationsPageState = {
  searchTerm: string;
  openDialog: boolean;
  dialogMode: JobNotificationsDialogMode;
  currentNotification: JobPostNotification | null;
  formData: JobNotificationsFormData;
  openDeleteDialog: boolean;
};

export const createEmptyJobNotificationFormData = (): JobNotificationsFormData => ({
  jobName: '',
  salary: null,
  frequency: DEFAULT_JOB_NOTIFICATION_FREQUENCY,
  position: null,
  experience: null,
  career: null,
  city: null,
  isActive: false,
});
