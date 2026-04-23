import JobSeekerLayout from '@/layouts/JobSeekerLayout';
import NotificationPage from '@/views/defaultPages/NotificationPage';

export const metadata = {
  title: 'Notifications',
  description: 'Browse Notifications.',
};

export default function Page() {
  return (
    <JobSeekerLayout>
      <NotificationPage />
    </JobSeekerLayout>
  );
}
