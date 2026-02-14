'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePaginatedQuery } from '~/src/hooks/usePaginatedQuery';
import ListItemSkeleton from '~/src/components/mypage/content/ListItemSkeleton';
import Pagination from '~/src/components/common/Pagination';
import { ClientUserSummary } from '~/src/types/shared';
import UserListItem from '~/src/components/layout/UserListItem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '~/src/components/common/Button';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import { addToastAtom, removeToastAtom } from '~/src/stores/toast-store';
import { useRouter } from 'next/navigation';
import { cn } from '~/src/utils/class-name';

type FollowType = 'following' | 'followers';

const ListSkeleton = () => (
  <div className="space-y-3">
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </div>
);

export default function FollowingFollowerTabPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setModal = useSetAtom(modalAtom);
  const addToast = useSetAtom(addToastAtom);
  const removeToast = useSetAtom(removeToastAtom);
  const userId = session?.user?.id || '';

  const [activeFollowTab, setActiveFollowTab] =
    useState<FollowType>('following');

  const {
    data: followingData,
    page: followingPage,
    setPage: setFollowingPage,
    isLoading: isLoadingFollowing,
  } = usePaginatedQuery<ClientUserSummary>({
    queryKey: ['user', userId, 'following'],
    apiEndpoint: `/api/users/me/following`,
    enabled: !!userId && activeFollowTab === 'following',
  });

  const {
    data: followersData,
    page: followersPage,
    setPage: setFollowersPage,
    isLoading: isLoadingFollowers,
  } = usePaginatedQuery<ClientUserSummary>({
    queryKey: ['user', userId, 'followers'],
    apiEndpoint: `/api/users/me/followers`,
    enabled: !!userId && activeFollowTab === 'followers',
  });

  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to follow');
      }
      return res.json();
    },
    onError: (err: Error) => {
      addToast({ id: Date.now().toString(), message: `팔로우 실패: ${err.message}` });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to unfollow');
      }
      return res.json();
    },
    onSuccess: (data, targetUserId) => {
      const toastId = Date.now().toString();
      let actionTaken = false;

      addToast({
        id: toastId,
        message: '언팔로우했습니다.',
        actionLabel: '취소',
        onAction: () => {
          actionTaken = true;
          followMutation.mutate(targetUserId);
          removeToast(toastId);
        },
        onDismiss: () => {
          if (!actionTaken) {
            queryClient.invalidateQueries({
              queryKey: ['user', userId, 'following'],
            });
            queryClient.invalidateQueries({ queryKey: ['following'] });
          }
        },
        duration: 5000,
      });
    },
    onError: (err: Error) => {
      setModal({
        type: 'INFO_MESSAGE',
        props: {
          title: '언팔로우 실패',
          message: err.message || '알 수 없는 오류가 발생했습니다.',
        },
      });
    },
  });

  const handleUnfollow = (targetUserId: string) => {
    if (!session?.user?.id) {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message: '로그인하고 언팔로우할 수 있습니다.',
          onConfirm: () => router.push('/login'),
          onCancel: () => {},
        },
      });
      return;
    }
    unfollowMutation.mutate(targetUserId);
  };

  const renderUserList = (
    users: ClientUserSummary[] | undefined,
    isLoading: boolean,
    page: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    showUnfollowButton: boolean,
  ) => {
    if (isLoading) {
      return <ListSkeleton />;
    }
    if (!users || users.length === 0) {
      return (
        <p className="text-gray-500 text-center py-10">
          {activeFollowTab === 'following'
            ? '팔로잉하는 사용자가 없습니다.'
            : '나를 팔로우하는 사용자가 없습니다.'}
        </p>
      );
    }

    return (
      <>
        <ul className="space-y-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
            >
              <UserListItem
                user={user}
                onClick={() => {}}
                isSelected={false}
                onProfileLinkClick={() => {}}
              />
              {showUnfollowButton && (
                <div className="flex-shrink-0">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUnfollow(user.id)}
                    disabled={unfollowMutation.isPending}
                    className="w-auto"
                  >
                    언팔로우
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="w-full border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Follow Tabs">
          <button
            onClick={() => setActiveFollowTab('following')}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeFollowTab === 'following'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            팔로잉
          </button>
          <button
            onClick={() => setActiveFollowTab('followers')}
            className={cn(
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
              activeFollowTab === 'followers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            팔로워
          </button>
        </nav>
      </div>

      {activeFollowTab === 'following'
        ? renderUserList(
            followingData?.data,
            isLoadingFollowing,
            followingPage,
            followingData?.totalPages || 1,
            setFollowingPage,
            true,
          )
        : renderUserList(
            followersData?.data,
            isLoadingFollowers,
            followersPage,
            followersData?.totalPages || 1,
            setFollowersPage,
            false,
          )}
    </div>
  );
}
