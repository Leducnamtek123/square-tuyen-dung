import { redirect } from 'next/navigation';
import { ROUTES } from '@/configs/constants';

export default function Page({ params }: { params: { id: string } }) {
  redirect(`/${ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', params.id)}`);
}
