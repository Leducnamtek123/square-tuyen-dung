import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerLogin from '@/views/authPages/JobSeekerLogin';

export const metadata = {
  title: 'Login',
  description: 'Browse Login.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <JobSeekerLogin />
    </DefaultLayout>
  );
}
