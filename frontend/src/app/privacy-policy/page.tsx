import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Square recruitment privacy policy.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="privacy" />
    </DefaultLayout>
  );
}
