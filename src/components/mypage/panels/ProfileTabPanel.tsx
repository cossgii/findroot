'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import Button from '~/src/components/common/button';
import UserProfileDisplay from '~/src/components/mypage/profile/UserProfileDisplay';
import UserProfileEditForm from '~/src/components/mypage/profile/UserProfileEditForm';

interface ProfileTabPanelProps {
  user: User;
  onProfileUpdated: (updatedUser: User) => void;
}

export default function ProfileTabPanel({
  user,
  onProfileUpdated,
}: ProfileTabPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedUser: User) => {
    onProfileUpdated(updatedUser);
    setIsEditing(false);
  };

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
          <div className="mt-6 flex justify-center">
            <Button onClick={() => setIsEditing(true)} className="w-auto px-6">
              프로필 수정
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
