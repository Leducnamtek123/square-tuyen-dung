import type { Metadata } from 'next';
import CandidatePracticePage from '@/views/jobSeekerPages/PracticePage';

export const metadata: Metadata = {
  title: 'Ngân Hàng Câu Hỏi & Luyện Tập Phỏng Vấn AI',
  description: 'Trải nghiệm phòng phỏng vấn thử AI tương tác WebRTC, dàn ý trả lời câu hỏi và các mẹo phỏng vấn thực tế.',
};

export default function Page() {
  return <CandidatePracticePage />;
}
