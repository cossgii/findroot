'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionExpiryWatcher() {
  const { status } = useSession();
  const setModal = useSetAtom(modalAtom);
  const router = useRouter();
  const pathname = usePathname();
  const prevStatusRef = useRef<string>(status);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    // authenticated → unauthenticated 전환 시에만 발동 (초기 비로그인 상태 제외)
    if (prevStatus === 'authenticated' && status === 'unauthenticated') {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '세션이 만료되었습니다',
          message: '로그인 세션이 만료되었습니다. 계속하려면 다시 로그인해주세요.',
          onConfirm: () =>
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`),
          onCancel: () => {},
        },
      });
    }
  }, [status, setModal, router, pathname]);

  return null;
}
