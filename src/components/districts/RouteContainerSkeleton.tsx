import React from 'react';
import ListItemSkeleton from '~/src/components/mypage/content/ListItemSkeleton';

const RouteContainerSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </div>
  );
};

export default RouteContainerSkeleton;
