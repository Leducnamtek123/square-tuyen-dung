import { redirect } from 'next/navigation';
import { ROUTES } from '@/configs/constants';

export default function Page() {
  redirect(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`);
}
