import DefaultLayout from '@/layouts/DefaultLayout';
import CompanyPage from '@/views/defaultPages/CompanyPage';

export const metadata = {
  title: 'Companies',
  description: 'Browse Companies.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <CompanyPage />
    </DefaultLayout>
  );
}
