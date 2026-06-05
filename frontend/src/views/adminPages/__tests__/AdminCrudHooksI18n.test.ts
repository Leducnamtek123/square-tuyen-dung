import { readFileSync } from 'fs';
import { join } from 'path';

const cases = [
  {
    file: '../BannersPage/hooks/useBanners.ts',
    namespace: 'banners',
    hardCoded: [
      'Banner added successfully',
      'An error occurred while adding the banner',
      'Banner updated successfully',
      'An error occurred while updating the banner',
      'Banner deleted successfully',
      'An error occurred while deleting the banner',
    ],
  },
  {
    file: '../CareersPage/hooks/useCareers.ts',
    namespace: 'careers',
    hardCoded: [
      'Career added successfully',
      'An error occurred while adding the career',
      'Career updated successfully',
      'An error occurred while updating the career',
      'Career deleted successfully',
      'An error occurred while deleting the career',
    ],
  },
  {
    file: '../CitiesPage/hooks/useCities.ts',
    namespace: 'cities',
    hardCoded: [
      'City added successfully',
      'An error occurred while adding the city',
      'City updated successfully',
      'An error occurred while updating the city',
      'City deleted successfully',
      'An error occurred while deleting the city',
    ],
  },
  {
    file: '../DistrictsPage/hooks/useDistricts.ts',
    namespace: 'districts',
    hardCoded: [
      'District added successfully',
      'An error occurred while adding the district',
      'District updated successfully',
      'An error occurred while updating the district',
      'District deleted successfully',
      'An error occurred while deleting the district',
    ],
  },
  {
    file: '../FeedbacksPage/hooks/useFeedbacks.ts',
    namespace: 'feedbacks',
    toastKeys: ['updateSuccess', 'updateError', 'deleteSuccess', 'deleteError'],
    hardCoded: [
      'Feedback updated successfully',
      'An error occurred while updating the feedback',
      'Feedback deleted successfully',
      'An error occurred while deleting the feedback',
    ],
  },
  {
    file: '../JobActivityPage/hooks/useJobActivities.ts',
    namespace: 'jobActivity',
    toastKeys: ['updateSuccess', 'updateError', 'deleteSuccess', 'deleteError'],
    hardCoded: [
      'Activity updated successfully',
      'An error occurred while updating the activity',
      'Activity deleted successfully',
      'An error occurred while deleting the activity',
    ],
  },
  {
    file: '../JobNotificationsPage/hooks/useJobNotifications.ts',
    namespace: 'jobNotifications',
    toastKeys: ['createSuccess', 'createError', 'updateSuccess', 'updateError', 'deleteSuccess', 'deleteError'],
    hardCoded: [
      'Notification created successfully',
      'An error occurred while creating the notification',
      'Notification updated successfully',
      'An error occurred while updating the notification',
      'Notification deleted successfully',
      'An error occurred while deleting the notification',
    ],
  },
  {
    file: '../JobsPage/hooks/useJobs.ts',
    namespace: 'jobs',
    toastKeys: [
      'updateSuccess',
      'updateError',
      'approveSuccess',
      'approveError',
      'rejectSuccess',
      'rejectError',
      'deleteSuccess',
      'deleteError',
    ],
    hardCoded: [
      'Job post updated successfully',
      'Error updating job post',
      'Job post approved',
      'Error approving job post',
      'Job post rejected',
      'Error rejecting job post',
      'Job post deleted',
      'Error deleting job post',
    ],
  },
  {
    file: '../ProfilesPage/hooks/useProfiles.ts',
    namespace: 'profiles',
    hardCoded: [
      'Candidate profile added successfully',
      'An error occurred while adding the candidate profile',
      'Profile updated',
      'Error updating profile',
      'Profile deleted',
      'Error deleting profile',
    ],
  },
  {
    file: '../ResumesPage/hooks/useResumes.ts',
    namespace: 'resumes',
    hardCoded: [
      'Resume added successfully',
      'An error occurred while adding the resume',
      'Resume updated successfully',
      'An error occurred while updating the resume',
      'Resume deleted successfully',
      'An error occurred while deleting the resume',
    ],
  },
];

const defaultToastKeys = [
  'addSuccess',
  'addError',
  'updateSuccess',
  'updateError',
  'deleteSuccess',
  'deleteError',
];

describe('admin CRUD hooks i18n', () => {
  it.each(cases)('$file does not hard-code mutation toast copy', ({ file, namespace, hardCoded, toastKeys = defaultToastKeys }) => {
    const source = readFileSync(join(__dirname, file), 'utf8');

    hardCoded.forEach((text) => {
      expect(source).not.toContain(text);
    });

    toastKeys.forEach((key) => {
      expect(source).toContain(`admin:pages.${namespace}.toast.${key}`);
    });
  });

  it.each(cases)('admin.pages.$namespace has Vietnamese and English toast entries', ({ namespace, toastKeys = defaultToastKeys }) => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../i18n/locales/en/admin.json'), 'utf8'));

    toastKeys.forEach((key) => {
      expect(vi.pages?.[namespace]?.toast?.[key]).toEqual(expect.any(String));
      expect(en.pages?.[namespace]?.toast?.[key]).toEqual(expect.any(String));
    });
  });
});
