import type { JobPostNotification } from '../../../types/models';
import type { JobPostNotificationPayload } from '../../../services/adminManagementService';

export type JobNotificationsDialogMode = 'add' | 'edit';

export type JobNotificationsFormData = JobPostNotificationPayload;

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
  frequency: 7,
  position: null,
  experience: null,
  career: null,
  city: null,
  isActive: false,
});

