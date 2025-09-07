'use client';

import { useState } from 'react';
import { ClientUser as User } from '~/src/types/shared';
import Button from '~/src/components/common/Button';
import UserProfileDisplay from '~/src/components/mypage/profile/UserProfileDisplay';
import UserProfileEditForm from '~/src/components/mypage/profile/UserProfileEditForm';
import ChangePasswordForm from '~/src/components/mypage/profile/ChangePasswordForm';

interface ProfileTabPanelProps {
  user: User;
  onProfileUpdated: (updatedUser: User) => void;
}

export default function ProfileTabPanel({
  user,
  onProfileUpdated,
}: ProfileTabPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = (updatedUser: User) => {
    onProfileUpdated(updatedUser);
    setIsEditing(false);
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
