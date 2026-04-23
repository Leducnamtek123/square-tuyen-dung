import HomeLayout from '@/layouts/HomeLayout';
import HomePage from '@/views/defaultPages/HomePage';

export const metadata = {
  title: 'Page.tsx',
  description: 'Browse Page.tsx.',
};

export default function Page() {
  return (
    <HomeLayout>
      <HomePage />
    </HomeLayout>
  );
}
