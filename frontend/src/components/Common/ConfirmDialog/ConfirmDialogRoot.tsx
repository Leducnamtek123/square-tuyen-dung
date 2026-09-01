'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  useConfirmDialogState,
  confirmDialogStore,
  type ModalIconType,
} from './confirmStore';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Info,
  LogOut,
} from 'lucide-react';

const ICON_CONFIG: Record<
  ModalIconType,
  {
    bg: string;
    darkBg: string;
    color: string;
    darkColor: string;
    ring: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  logout: {
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/60',
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    ring: 'ring-blue-100/60 dark:ring-blue-900/40',
    icon: LogOut,
  },
  question: {
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/60',
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    ring: 'ring-blue-100/60 dark:ring-blue-900/40',
    icon: HelpCircle,
  },
  warning: {
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/60',
    color: 'text-amber-600',
    darkColor: 'dark:text-amber-400',
    ring: 'ring-amber-100/60 dark:ring-amber-900/40',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/60',
    color: 'text-emerald-600',
    darkColor: 'dark:text-emerald-400',
    ring: 'ring-emerald-100/60 dark:ring-emerald-900/40',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-50',
    darkBg: 'dark:bg-red-950/60',
    color: 'text-red-600',
    darkColor: 'dark:text-red-400',
    ring: 'ring-red-100/60 dark:ring-red-900/40',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-950/60',
    color: 'text-sky-600',
    darkColor: 'dark:text-sky-400',
    ring: 'ring-sky-100/60 dark:ring-sky-900/40',
    icon: Info,
  },
};

/**
 * Safely renders dialog text. If text contains inline HTML tags (e.g. <strong>, <b>, <span>),
 * parses them into styled React nodes without leaking raw HTML tags to the UI.
 */
function renderFormattedMessage(content?: React.ReactNode): React.ReactNode {
  if (!content) return null;
  if (typeof content !== 'string') return content;
  if (!/<[a-z][\s\S]*>/i.test(content)) return content;

  // Split by supported inline formatting tags
  const parts = content.split(/(<strong[^>]*>[\s\S]*?<\/strong>|<b[^>]*>[\s\S]*?<\/b>|<span[^>]*>[\s\S]*?<\/span>)/gi);

  return parts.map((part, index) => {
    const strongMatch = part.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i) || part.match(/<b[^>]*>([\s\S]*?)<\/b>/i);
    if (strongMatch) {
      return (
        <strong
          key={index}
          className="mx-0.5 inline-block rounded-md bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300"
        >
          {strongMatch[1]}
        </strong>
      );
    }

    const spanMatch = part.match(/<span[^>]*>([\s\S]*?)<\/span>/i);
    if (spanMatch) {
      return (
        <span key={index} className="font-semibold text-slate-900 dark:text-slate-100">
          {spanMatch[1]}
        </span>
      );
    }

    // Strip any stray unknown tags safely
    const cleanText = part.replace(/<[^>]*>?/gm, '');
    return cleanText;
  });
}

export function ConfirmDialogRoot() {
  const {
    open,
    title,
    text,
    icon = 'info',
    showCancelButton = true,
    confirmButtonText = 'Đồng ý',
    cancelButtonText = 'Hủy',
    onConfirm,
    onCancel,
  } = useConfirmDialogState();

  const iconConfig = ICON_CONFIG[icon] || ICON_CONFIG.info;
  const IconComponent = iconConfig.icon;
  const isDanger = icon === 'error' || icon === 'warning';

  const handleConfirm = () => {
    confirmDialogStore.close();
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    confirmDialogStore.close();
    if (onCancel) {
      onCancel();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCancel();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[420px] rounded-2xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl ${iconConfig.bg} ${iconConfig.darkBg} ${iconConfig.color} ${iconConfig.darkColor} ring-4 ${iconConfig.ring} shadow-sm`}
          >
            <IconComponent className="h-7 w-7 stroke-[2.2]" />
          </div>
          <AlertDialogHeader className="space-y-2">
            {title && (
              <AlertDialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </AlertDialogTitle>
            )}
            {text && (
              <AlertDialogDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 text-center">
                {renderFormattedMessage(text)}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="mt-4 gap-2.5 sm:gap-3">
          {showCancelButton && (
            <AlertDialogCancel
              onClick={handleCancel}
              className="h-10 rounded-xl px-5 text-sm font-semibold border-slate-200 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all duration-150"
            >
              {cancelButtonText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            variant={isDanger ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className={`h-10 rounded-xl px-5 text-sm font-bold text-white transition-all duration-150 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25'
            }`}
          >
            {confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialogRoot;
