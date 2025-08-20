import { atom } from 'jotai';

export interface ToastState {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number; // ms, 0 for indefinite
}

export const toastsAtom = atom<ToastState[]>([]);

export const addToastAtom = atom(
  null,
  (get, set, toast: Omit<ToastState, 'id'>) => {
    const id = Date.now().toString();
    set(toastsAtom, (prev) => [...prev, { ...toast, id }]);
  },
);

export const removeToastAtom = atom(
  null,
  (get, set, id: string) => {
    set(toastsAtom, (prev) => prev.filter((toast) => toast.id !== id));
  },
);
