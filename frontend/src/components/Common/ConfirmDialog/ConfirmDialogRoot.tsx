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
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  logout: {
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/50',
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    icon: LogOut,
  },
  question: {
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/50',
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    icon: HelpCircle,
  },
  warning: {
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/50',
    color: 'text-amber-600',
    darkColor: 'dark:text-amber-400',
    icon: AlertTriangle,
  },
  success: {
    bg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/50',
    color: 'text-emerald-600',
    darkColor: 'dark:text-emerald-400',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-50',
    darkBg: 'dark:bg-red-950/50',
    color: 'text-red-600',
    darkColor: 'dark:text-red-400',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-950/50',
    color: 'text-sky-600',
    darkColor: 'dark:text-sky-400',
    icon: Info,
  },
};

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
      <AlertDialogContent>
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${iconConfig.bg} ${iconConfig.darkBg} ${iconConfig.color} ${iconConfig.darkColor} ring-8 ring-slate-50 dark:ring-slate-800/40`}
          >
            <IconComponent className="h-7 w-7 stroke-[2.2]" />
          </div>
          <AlertDialogHeader className="space-y-1.5">
            {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
            {text && (
              <AlertDialogDescription className="text-center">
                {text}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter>
          {showCancelButton && (
            <AlertDialogCancel onClick={handleCancel}>
              {cancelButtonText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            variant={isDanger ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialogRoot;
