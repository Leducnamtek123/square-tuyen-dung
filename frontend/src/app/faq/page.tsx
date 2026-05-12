import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="faq" />
    </DefaultLayout>
  );
}
