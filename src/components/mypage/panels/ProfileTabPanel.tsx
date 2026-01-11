'use client';

import { useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '~/src/stores/toast-store';
import { ClientUser as User } from '~/src/types/shared';
import Button from '~/src/components/common/Button';
import UserProfileDisplay from '~/src/components/mypage/profile/UserProfileDisplay';
import UserProfileEditForm from '~/src/components/mypage/profile/UserProfileEditForm';
import ChangePasswordForm from '~/src/components/mypage/profile/ChangePasswordForm';

const fetchUserProfileData = async (): Promise<User> => {
  const res = await fetch('/api/users/me');
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
};

export default function ProfileTabPanel() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const addToast = useSetAtom(addToastAtom);

  const { data: user } = useSuspenseQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: fetchUserProfileData,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = (updatedUser: User) => {
    queryClient.setQueryData(['user', 'me'], updatedUser);
    setIsEditing(false);
  };

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
        addToast({ message: '프로필 주소가 복사되었습니다.' });
      }
    } catch (err) {
      console.error('Share/Copy failed:', err);
    }
  };

  const isCredentialsUser = user.password !== null;

  if (isChangingPassword) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <ChangePasswordForm
          onSuccess={() => setIsChangingPassword(false)}
          onCancel={() => setIsChangingPassword(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {isEditing ? (
        <UserProfileEditForm
          user={user}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <UserProfileDisplay user={user} />
          <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={() => setIsEditing(true)} className="w-auto px-6">
              프로필 수정
            </Button>
            <Button
              onClick={handleShareProfile}
              variant="secondary"
              className="w-auto px-6"
            >
              프로필 공유하기
            </Button>
            {isCredentialsUser && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outlined"
                className="w-auto px-6"
              >
                비밀번호 변경
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
