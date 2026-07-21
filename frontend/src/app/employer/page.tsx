import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Employer',
  description: 'Browse Employer.',
};

export default function EmployerRootPage() {
  redirect('/employer/dashboard');
}

