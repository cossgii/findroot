'use client';

import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { toastsAtom, removeToastAtom } from '~/src/stores/toast-store';
import { cn } from '~/src/utils/class-name';

export default function Toast() {
  const [toasts] = useAtom(toastsAtom);
  const removeToast = useSetAtom(removeToastAtom);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col items-end space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg shadow-lg text-white',
            'bg-gray-800 min-w-[250px] max-w-sm',
          )}
        >
          <p className="flex-grow text-sm font-medium">{toast.message}</p>
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                removeToast(toast.id);
              }}
              className="ml-4 px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-sm font-semibold"
            >
              {toast.actionLabel}
            </button>
          )}
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-gray-400 hover:text-white"
            aria-label="알림 닫기"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
