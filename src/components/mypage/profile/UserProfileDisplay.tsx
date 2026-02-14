'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';
import { ClientUser as User } from '~/src/types/shared';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/src/components/common/Avatar';
import { Share2, Check } from 'lucide-react';

interface UserProfileDisplayProps {
  user: User;
}

export default function UserProfileDisplay({ user }: UserProfileDisplayProps) {
  const { data: session } = useSession();
  const addToast = useSetAtom(addToastAtom);
  const [isCopied, setIsCopied] = useState(false);

  const handleShareProfile = async () => {
    if (!session?.user?.id) return;

    const profileUrl = `${window.location.origin}/users/${session.user.id}`;
    const shareData = {
      title: `${user.name || 'FindRoot 사용자'}님의 프로필`,
      text: `FindRoot에서 ${
        user.name || 'FindRoot 사용자'
      }님의 맛집과 루트를 확인해보세요!`,
      url: profileUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(profileUrl);
        addToast({
          id: Date.now().toString(),
          message: '프로필 주소가 복사되었습니다.',
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share/Copy failed:', err);
      addToast({
        id: Date.now().toString(),
        message: '공유/복사에 실패했습니다.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <Link
        href={`/users/${user.id}`}
        className="flex flex-col items-center space-y-4 group"
        aria-label="내 공개 프로필 보기"
      >
        <div className="transition-transform duration-200 ease-in-out group-hover:scale-110">
          <Avatar size="large">
            <AvatarImage
              src={user.image || ''}
              alt={user.name || 'User Avatar'}
            />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-2xl font-bold group-hover:underline">
          {user.name || '이름 없음'}
        </h2>
      </Link>
      <div className="flex items-center gap-2">
        <p className="text-gray-600">{user.loginId}</p>
        <button
          onClick={handleShareProfile}
          disabled={isCopied}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:cursor-not-allowed"
          aria-label="프로필 공유"
        >
          {isCopied ? (
            <Check size={18} className="text-green-500" />
          ) : (
            <Share2 size={18} className="text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}