import DefaultLayout from '@/layouts/DefaultLayout';
import CandidateLoginPage from '@/views/jobSeekerPages/CandidateLoginPage';

export const metadata = {
  title: 'Interview Login',
  description: 'Browse Interview Login.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <CandidateLoginPage />
    </DefaultLayout>
  );
}
