import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'Employer FAQ',
  description: 'Employer frequently asked questions.',
};

export default function Page() {
  return <StaticInfoPage pageKey="faq" />;
}
