import DefaultLayout from '@/layouts/DefaultLayout';
import JobSeekerSignUp from '@/views/authPages/JobSeekerSignUp';

export const metadata = {
  title: 'Register',
  description: 'Create a new account.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <JobSeekerSignUp />
    </DefaultLayout>
  );
}
