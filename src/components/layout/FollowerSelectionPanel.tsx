'use client';

import { useState, useRef, useCallback } from 'react';
import {
  animated,
  useTransition as useSpringTransition,
} from '@react-spring/web';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { contentCreatorAtom } from '~/src/stores/app-store';
import { cn } from '~/src/utils/class-name';
import Input from '~/src/components/common/Input';
import { useUserSearch } from '~/src/hooks/useUserSearch';
import { useSession } from 'next-auth/react';
import UserListItemSkeleton from './UserListItemSkeleton';
import { User as UserIcon, Star } from 'lucide-react';
import AnimatedUserList from './AnimatedUserList';
import { useRouter } from 'next/navigation';

interface FollowingUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface FollowingApiResponse {
  data: FollowingUser[];
  nextCursor?: string;
}

const fetchFollowing = async (
  cursor?: string,
): Promise<FollowingApiResponse> => {
  const params = new URLSearchParams();
  if (cursor) {
    params.append('cursor', cursor);
  }
  params.append('limit', '8');

  const res = await fetch(`/api/users/me/following?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch following list');
  }
  return res.json();
};

interface FollowerSelectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isUserPage?: boolean;
}

export default function FollowerSelectionPanel({
  isOpen,
  onClose,
  isUserPage = false,
}: FollowerSelectionPanelProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults = [], isLoading: isSearching } =
    useUserSearch(searchTerm);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingFollowing,
  } = useInfiniteQuery<FollowingApiResponse>({
    queryKey: ['following'],
    queryFn: ({ pageParam }) => fetchFollowing(pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: isOpen,
  });

  const following = data?.pages.flatMap((page) => page.data) ?? [];

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const [contentCreator, setContentCreator] = useAtom(contentCreatorAtom);

  const panelTransition = useSpringTransition(isOpen, {
    from: { transform: 'translateX(-100%)' },
    enter: { transform: 'translateX(0%)' },
    leave: { transform: 'translateX(-100%)' },
  });

  const handleSelectCreator = (
    type: 'recommended' | 'me' | 'user',
    user?: FollowingUser,
  ) => {
    if (isUserPage && type === 'user' && user) {
      router.push(`/users/${user.id}`);
    } else {
      if (type === 'recommended') {
        setContentCreator({ type: 'recommended' });
      } else if (type === 'me') {
        setContentCreator({ type: 'me' });
      } else if (type === 'user' && user) {
        setContentCreator({
          type: 'user',
          userId: user.id,
          userName: user.name || 'Unknown',
          userImage: user.image,
        });
      }
    }
    onClose();
    setSearchTerm('');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}
      {panelTransition(
        (styles, item) =>
          item && (
            <animated.div
              style={styles}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 flex flex-col"
              data-cy="follower-selection-panel"
            >
              <div className="p-4 flex-shrink-0">
                {!isUserPage && (
                  <ul className="flex justify-center gap-2 mb-4">
                    <li
                      onClick={() => handleSelectCreator('recommended')}
                      className={cn(
                        'p-2 rounded-md cursor-pointer flex items-center gap-3 transition-colors',
                        contentCreator.type === 'recommended'
                          ? 'bg-primary-100'
                          : 'hover:bg-gray-100',
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                        <Star size={18} />
                      </div>
                      <span className="font-semibold">추천</span>
                    </li>
                    {session?.user?.id && (
                      <li
                        onClick={() => handleSelectCreator('me')}
                        className={cn(
                          'p-2 rounded-md cursor-pointer flex items-center gap-3 transition-colors',
                          contentCreator.type === 'me'
                            ? 'bg-primary-100'
                            : 'hover:bg-gray-100',
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          <UserIcon size={18} />
                        </div>
                        <span className="font-semibold">my</span>
                      </li>
                    )}
                  </ul>
                )}

                <h3 className="text-md font-bold mt-4 mb-2 border-t pt-2">
                  팔로잉 사용자
                </h3>
                <div className="py-2">
                  <Input
                    placeholder="사용자 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div
                className="flex-grow overflow-y-auto px-4"
                data-cy="follower-list-scroll-area"
              >
                {searchTerm ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto pt-2">
                    {isSearching ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <UserListItemSkeleton key={i} />
                      ))
                    ) : searchResults.length > 0 ? (
                      <AnimatedUserList
                        users={searchResults}
                        contentCreator={contentCreator}
                        onSelectCreator={handleSelectCreator}
                        onClose={onClose}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">
                        검색 결과가 없습니다.
                      </p>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {isLoadingFollowing && !data ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <UserListItemSkeleton key={i} />
                      ))
                    ) : following.length > 0 ? (
                      <>
                        <AnimatedUserList
                          users={following}
                          contentCreator={contentCreator}
                          onSelectCreator={handleSelectCreator}
                          onClose={onClose}
                        />
                        <div ref={lastElementRef} className="h-1" />
                        {isFetchingNextPage && <UserListItemSkeleton />}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        팔로잉하는 사용자가 없습니다.
                      </p>
                    )}
                  </ul>
                )}
              </div>
            </animated.div>
          ),
      )}
    </>
  );
}
