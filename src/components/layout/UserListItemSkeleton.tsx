'use client';

import { animated, useSpring } from '@react-spring/web';
import { Avatar, AvatarFallback } from '~/src/components/common/Avatar';

export default function UserListItemSkeleton() {
  const styles = useSpring({
    from: { opacity: 0.5 },
    to: { opacity: 1 },
    loop: { reverse: true },
    config: { duration: 1000 },
  });

  return (
    <animated.li style={styles} className="p-2 flex items-center gap-3">
      <Avatar size="small">
        <AvatarFallback className="bg-gray-300" />
      </Avatar>
      <div className="h-5 w-24 bg-gray-300 rounded-md"></div>
    </animated.li>
  );
}
