'use client';

import { useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { contentCreatorAtom } from '~/src/stores/app-store';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '~/src/components/common/Avatar';
import { cn } from '~/src/utils/class-name';
import Link from 'next/link';
import Input from '~/src/components/common/Input';
import { useUserSearch } from '~/src/hooks/useUserSearch';
import { useSession } from 'next-auth/react';

interface FollowingUser {
  id: string;
  name: string | null;
  image: string | null;
}

const fetchFollowing = async (): Promise<FollowingUser[]> => {
  const res = await fetch('/api/users/me/following');
  if (!res.ok) {
    throw new Error('Failed to fetch following list');
  }
  return res.json();
};

interface FollowerSelectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowerSelectionPanel({
  isOpen,
  onClose,
}: FollowerSelectionPanelProps) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults = [], isLoading: isSearching } = useUserSearch(searchTerm);

  const { data: following = [], isLoading: isLoadingFollowing } = useQuery<FollowingUser[]>({
    queryKey: ['following'],
    queryFn: fetchFollowing,
    enabled: isOpen,
  });

  const [contentCreator, setContentCreator] = useAtom(contentCreatorAtom);

  const transition = useTransition(isOpen, {
    from: { transform: 'translateX(-100%)' },
    enter: { transform: 'translateX(0%)' },
    leave: { transform: 'translateX(-100%)' },
  });

  const handleSelectCreator = (
    type: 'recommended' | 'me' | 'user',
    user?: { id: string; name: string | null },
  ) => {
    if (type === 'recommended') {
      setContentCreator({ type: 'recommended' });
    } else if (type === 'me') {
      setContentCreator({ type: 'me' });
    } else if (type === 'user' && user) {
      setContentCreator({
        type: 'user',
        userId: user.id,
        userName: user.name || 'Unknown',
      });
    }
    onClose();
    setSearchTerm('');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}
      {transition(
        (styles, item) =>
          item && (
            <animated.div
              style={styles}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50"
            >
              <div className="p-4">
                <h2 className="text-lg font-bold mb-4">콘텐츠 보기</h2>
                <ul className="space-y-2">
                  {/* Recommended Content */}
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
                      추천
                    </div>
                    <span className="font-semibold">추천 콘텐츠</span>
                  </li>

                  {/* My Content */}
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
                        나
                      </div>
                      <span className="font-semibold">내 콘텐츠</span>
                    </li>
                  )}

                  <li className="py-2">
                    <Input
                      placeholder="사용자 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </li>

                  {/* Search Results */}
                  {searchTerm && (
                    <div className="space-y-1 max-h-40 overflow-y-auto border-t pt-2">
                      {isSearching ? (
                        <p className="text-sm text-gray-500">검색 중...</p>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <li
                            key={user.id}
                            onClick={() => handleSelectCreator('user', user)}
                            className="p-2 rounded-md cursor-pointer flex items-center gap-3 hover:bg-gray-100"
                          >
                            <Avatar size="small">
                              <AvatarImage src={user.image || ''} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium flex-grow">
                              {user.name}
                            </span>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          검색 결과가 없습니다.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Following Users */}
                  <h3 className="text-md font-bold mt-4 mb-2 border-t pt-2">
                    팔로잉 사용자
                  </h3>
                  {isLoadingFollowing ? (
                    <p>로딩 중...</p>
                  ) : following.length > 0 ? (
                    following.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectCreator('user', user)}
                        className={cn(
                          'p-2 rounded-md cursor-pointer flex items-center gap-3 transition-colors',
                          contentCreator.type === 'user' &&
                            contentCreator.userId === user.id
                            ? 'bg-primary-100'
                            : 'hover:bg-gray-100',
                        )}
                      >
                        <Link
                          href={`/users/${user.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                          }}
                          className="flex-shrink-0"
                        >
                          <Avatar size="small">
                            <AvatarImage src={user.image || ''} />
                            <AvatarFallback>
                              {user.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <span className="font-medium flex-grow">
                          {user.name}
                        </span>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      팔로잉하는 사용자가 없습니다.
                    </p>
                  )}
                </ul>
              </div>
            </animated.div>
          ),
      )}
    </>
  );
}
