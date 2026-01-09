'use client';

import React from 'react';
import { useTransition, animated } from '@react-spring/web';
import { RoutePurpose } from '@prisma/client';

interface PurposeSelectionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPurpose: (purpose: RoutePurpose) => void;
}

const purposeMap: Record<RoutePurpose, { title: string; description: string }> = {
  ENTIRE: { title: '전체', description: '모든 목적의 루트 보기' },
  COUPLE: { title: '커플', description: '연인과 함께하는 로맨틱한 데이트' },
  FAMILY: { title: '가족', description: '온 가족이 함께 즐기는 나들이' },
  GATHERING: { title: '모임', description: '친구, 동료와 함께하는 즐거운 시간' },
  SOLO: { title: '나홀로', description: '혼자서 즐기는 여유로운 시간' },
};

const purposes = Object.keys(purposeMap) as RoutePurpose[];

export default function PurposeSelectionOverlay({
  isOpen,
  onClose,
  onSelectPurpose,
}: PurposeSelectionOverlayProps) {
  const overlayTransition = useTransition(isOpen, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 200 },
  });

  const modalTransition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(50px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(50px)' },
    config: { duration: 300 },
    delay: 50,
  });

  const cardTransitions = useTransition(isOpen ? purposes : [], {
    keys: (item) => item,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: (item, i) => async (next) => {
      await new Promise((resolve) => setTimeout(resolve, i * 50));
      await next({ opacity: 1, transform: 'translateY(0px)' });
    },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { duration: 200 },
    trail: 50,
  });

  return overlayTransition(
    (styles, item) =>
      item && (
        <animated.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          style={styles}
          onClick={onClose}
        >
          {modalTransition(
            (modalStyles, modalItem) =>
              modalItem && (
                <animated.div
                  className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-8"
                  style={modalStyles}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">
                      어떤 목적의 루트를 찾으시나요?
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-gray-100 font-bold text-2xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cardTransitions((cardStyles, purpose) => (
                      <animated.div
                        key={purpose}
                        className="border rounded-lg p-6 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-200"
                        style={cardStyles}
                        onClick={() => onSelectPurpose(purpose)}
                      >
                        <h3 className="text-2xl font-semibold mb-2">
                          {purposeMap[purpose].title}
                        </h3>
                        <p className="text-gray-600">
                          {purposeMap[purpose].description}
                        </p>
                      </animated.div>
                    ))}
                  </div>
                </animated.div>
              ),
          )}
        </animated.div>
      ),
  );
}