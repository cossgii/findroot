'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '~/src/components/common/Button';
import { useSetAtom } from 'jotai';
import { modalAtom } from '~/src/stores/app-store';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

const fetchFollowStatus = async (followingId: string) => {
  const res = await fetch(`/api/users/${followingId}/follow/status`);
  if (!res.ok) {
    throw new Error('Failed to fetch follow status');
  }
  const data = await res.json();
  return data.isFollowing;
};

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const setModal = useSetAtom(modalAtom);
  const router = useRouter();

  const { data: isFollowing, isLoading: isStatusLoading } = useQuery<
    boolean,
    Error
  >({
    queryKey: ['followStatus', session?.user?.id, targetUserId],
    queryFn: () => fetchFollowStatus(targetUserId),
    enabled:
      sessionStatus === 'authenticated' &&
      !!session?.user?.id &&
      session.user.id !== targetUserId,
    initialData: initialIsFollowing,
  });

  const handleSettled = () => {
    queryClient.invalidateQueries({
      queryKey: ['followStatus', session?.user?.id, targetUserId],
    });
    if (session?.user?.id) {
      queryClient.invalidateQueries({
        queryKey: ['user', session.user.id, 'following'],
      });
    }
    queryClient.invalidateQueries({
      queryKey: ['user', targetUserId, 'followers'],
    });
    queryClient.invalidateQueries({ queryKey: ['user', session?.user?.id] });
  };

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to follow');
      }
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['followStatus', session?.user?.id, targetUserId],
      });
      const previousStatus = queryClient.getQueryData([
        'followStatus',
        session?.user?.id,
        targetUserId,
      ]);
      queryClient.setQueryData(
        ['followStatus', session?.user?.id, targetUserId],
        true,
      );
      return { previousStatus };
    },
    onError: (err: Error, variables, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          ['followStatus', session?.user?.id, targetUserId],
          context.previousStatus,
        );
      }
      alert(`팔로우 실패: ${err.message}`);
    },
    onSettled: handleSettled,
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
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
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['followStatus', session?.user?.id, targetUserId],
      });
      const previousStatus = queryClient.getQueryData([
        'followStatus',
        session?.user?.id,
        targetUserId,
      ]);
      queryClient.setQueryData(
        ['followStatus', session?.user?.id, targetUserId],
        false,
      );
      return { previousStatus };
    },
    onError: (err: Error, variables, context) => {
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          ['followStatus', session?.user?.id, targetUserId],
          context.previousStatus,
        );
      }
      alert(`언팔로우 실패: ${err.message}`);
    },
    onSettled: handleSettled,
  });

  const handleFollowToggle = () => {
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      setModal({
        type: 'LOGIN_PROMPT',
        props: {
          title: '로그인이 필요합니다',
          message: '로그인하고 다른 사용자를 팔로우해보세요!',
          onConfirm: () => router.push('/login'),
          onCancel: () => {},
        },
      });
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const isLoading =
    isStatusLoading || followMutation.isPending || unfollowMutation.isPending;

  if (session?.user?.id === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      size="small"
      className="w-auto px-4 py-2"
      variant={isFollowing ? 'outlined' : 'primary'}
    >
      {isLoading ? '처리 중...' : isFollowing ? '팔로잉' : '팔로우'}
    </Button>
  );
}
