import { toast as sonnerToast } from 'sonner';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import { Alert, AlertDescription, AlertTitle } from '@/voice-ai/components/livekit/alert';

export function toastAlert(toast) {
  sonnerToast.custom((id) => (
    <AlertToast id={id} title={toast.title} description={toast.description} />
  ));
}

export function AlertToast({ id, title, description }) {
  return (
    <Alert onClick={() => sonnerToast.dismiss(id)} className="bg-accent w-full md:w-[364px]">
      <WarningIcon weight="bold" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
