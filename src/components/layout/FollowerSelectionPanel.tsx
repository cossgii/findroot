'use client';

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
import Link from 'next/link'; // Moved to top

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
  const { data: following = [], isLoading } = useQuery<FollowingUser[]>({
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
    user: { id: string; name: string | null } | null,
  ) => {
    if (user) {
      setContentCreator({
        type: 'user',
        userId: user.id,
        userName: user.name || 'Unknown',
      });
    } else {
      setContentCreator({ type: 'recommended' });
    }
    onClose();
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
                  <li
                    onClick={() => handleSelectCreator(null)}
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

                  {/* Following Users */}
                  {isLoading ? (
                    <p>로딩 중...</p>
                  ) : (
                    following.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectCreator(user)}
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
                  )}
                </ul>
              </div>
            </animated.div>
          ),
      )}
    </>
  );
}
