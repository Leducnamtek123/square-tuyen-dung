import DefaultLayout from '@/layouts/DefaultLayout';
import AboutUsPage from '@/views/defaultPages/AboutUsPage';

export const metadata = {
  title: 'About Us',
  description: 'Browse About Us.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <AboutUsPage />
    </DefaultLayout>
  );
}
