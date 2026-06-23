import StaticInfoPage from '@/views/defaultPages/StaticInfoPage';

export const metadata = {
  title: 'Báo lỗi & liên hệ nhà tuyển dụng',
  description: 'Gửi báo lỗi, góp ý hoặc liên hệ hỗ trợ cho khu vực nhà tuyển dụng.',
};

export default function Page() {
  return <StaticInfoPage pageKey="contact" />;
}
