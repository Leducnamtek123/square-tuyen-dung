/**
 * Isolated layout for employer /interviews/session/[id] pages.
 * Loads LiveKit CSS without bleeding into the rest of the employer layout.
 * This layout renders INSTEAD of EmployerLayout for this specific route segment.
 */
import '@/app/interview/livekit.css';

export default function EmployerInterviewSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
