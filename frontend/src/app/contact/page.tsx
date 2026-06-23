import DefaultLayout from '@/layouts/DefaultLayout';
import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'Báo lỗi & liên hệ',
  description: 'Gửi báo lỗi, góp ý hoặc liên hệ với Square.',
};

export default function Page() {
  return (
    <DefaultLayout>
      <StaticInfoPage pageKey="contact" />
    </DefaultLayout>
  );
}
