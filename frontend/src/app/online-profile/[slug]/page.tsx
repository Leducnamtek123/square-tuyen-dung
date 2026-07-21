import DefaultLayout from '@/layouts/DefaultLayout';
import OnlineProfilePage from '@/views/jobSeekerPages/OnlineProfilePage';

export const metadata = {
  title: 'Online Profile',
  description: 'Browse Online Profile.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <OnlineProfilePage />
    </DefaultLayout>
  );
}
