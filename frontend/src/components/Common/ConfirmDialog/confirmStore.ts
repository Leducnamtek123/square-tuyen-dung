import { useSyncExternalStore } from 'react';

export type ModalIconType = 'success' | 'error' | 'warning' | 'info' | 'question' | 'logout';

export interface ConfirmDialogOptions {
  title?: string;
  text?: string;
  icon?: ModalIconType;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  open: boolean;
}

const defaultState: ConfirmDialogState = {
  open: false,
  title: '',
  text: '',
  icon: 'info',
  showCancelButton: true,
  confirmButtonText: 'Đồng ý',
  cancelButtonText: 'Hủy',
};

let currentState: ConfirmDialogState = { ...defaultState };
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const confirmDialogStore = {
  getSnapshot: () => currentState,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  show: (options: ConfirmDialogOptions) => {
    currentState = {
      ...defaultState,
      ...options,
      open: true,
    };
    emitChange();
  },
  close: () => {
    currentState = {
      ...currentState,
      open: false,
    };
    emitChange();
  },
};

export function useConfirmDialogState() {
  return useSyncExternalStore(
    confirmDialogStore.subscribe,
    confirmDialogStore.getSnapshot,
    () => defaultState
  );
}
