import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'Contact',
  description: 'Contact Square recruitment support.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="contact" />
    </DefaultLayout>
  );
}
