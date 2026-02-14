import { atom } from 'jotai';

export interface ToastState {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  onDismiss?: () => void;
}

export const toastsAtom = atom<ToastState[]>([]);

export const addToastAtom = atom(
  null,
  (get, set, toast: ToastState) => {
    set(toastsAtom, (prev) => [...prev, toast]);
  },
);

export const removeToastAtom = atom(null, (get, set, id: string) => {
  const toast = get(toastsAtom).find((t) => t.id === id);
  if (toast && toast.onDismiss) {
    toast.onDismiss();
  }
  set(toastsAtom, (prev) => prev.filter((toast) => toast.id !== id));
});
