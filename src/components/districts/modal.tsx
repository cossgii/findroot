'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '~/src/utils/class-name';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // 모달 열리면 스크롤 방지
    } else {
      document.body.style.overflow = 'unset'; // 모달 닫히면 스크롤 허용
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset'; // 컴포넌트 언마운트 시 스크롤 허용
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose(); // 모달 외부 클릭 시 닫기
        }
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto',
          className
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
    document.body // body 태그에 포탈로 렌더링
  );
}
