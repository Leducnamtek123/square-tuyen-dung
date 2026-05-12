import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'Terms of Service',
  description: 'Square recruitment terms of service.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="terms" />
    </DefaultLayout>
  );
}
