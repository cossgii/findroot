'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '~/src/utils/class-name';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  overlayClassName,
  contentClassName,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalElement(document.getElementById('modal-root'));

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalElement) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
      // 핵심 위치/표시 규칙만 인라인 스타일로 보장
      style={{
        position: 'fixed',
        display: 'grid',
        placeItems: 'center',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 9999,
      }}
      // 나머지 디자인은 클래스로 적용
      className={cn('bg-black/50 p-4', overlayClassName)}
    >
      <div
        ref={modalRef}
        // 컨텐츠 박스의 핵심 위치 규칙만 인라인 스타일로 보장
        style={{ position: 'relative' }}
        // 나머지 디자인은 클래스로 적용
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto',
          contentClassName,
        )}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>,
    portalElement,
  );
}
