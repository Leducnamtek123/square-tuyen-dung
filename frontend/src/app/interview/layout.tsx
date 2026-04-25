/**
 * Layout for /interview/* pages.
 *
 * This is a deliberately ISOLATED layout — it intentionally does NOT
 * include the global DefaultLayout / EmployerLayout. Interview rooms are
 * full-screen, standalone experiences. The layout's sole responsibilities
 * are:
 *  1. Load LiveKit component styles in a scoped way (no MUI/Tailwind bleed)
 *  2. Set a black bg on the <html> so there is no flash of white
 */
import './livekit.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview Room | Square Tuyển Dụng',
  description: 'Join your online interview session.',
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // data-lk-theme is required for @livekit/components-styles selectors to apply
  return <div data-lk-theme="default" style={{ minHeight: '100svh' }}>{children}</div>;
}
