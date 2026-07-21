import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'BÃ¡o lá»—i & liÃªn há»‡',
  description: 'Gá»­i bÃ¡o lá»—i, gÃ³p Ã½ hoáº·c liÃªn há»‡ vá»›i InfoHR.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="contact" />
    </DefaultLayout>
  );
}

