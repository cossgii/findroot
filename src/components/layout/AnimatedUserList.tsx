'use client';

import { useTransition, animated } from '@react-spring/web';
import UserListItem from './UserListItem';
import { type ContentCreator } from '~/src/stores/app-store';

interface FollowingUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface AnimatedUserListProps {
  users: FollowingUser[];
  contentCreator: ContentCreator;
  onSelectCreator: (type: 'user', user: FollowingUser) => void;
  onClose: () => void;
}

export default function AnimatedUserList({
  users,
  contentCreator,
  onSelectCreator,
  onClose,
}: AnimatedUserListProps) {
  const transitions = useTransition(users, {
    keys: (item) => item.id,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { mass: 1, tension: 200, friction: 20 },
    trail: 50,
  });

  return transitions((styles, user) => (
    <animated.div style={styles}>
      <UserListItem
        user={user}
        onClick={() => onSelectCreator('user', user)}
        isSelected={
          contentCreator.type === 'user' && contentCreator.userId === user.id
        }
        onProfileLinkClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
    </animated.div>
  ));
}
