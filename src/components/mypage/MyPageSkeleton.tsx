import ListItemSkeleton from '~/src/components/mypage/content/ListItemSkeleton';

interface MyPageSkeletonProps {
  showTabs?: boolean;
}

const MyPageSkeleton = ({ showTabs = true }: MyPageSkeletonProps) => {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-pulse">
      {showTabs && (
        <div className="w-full border-b border-gray-200 mb-8">
          <div className="-mb-px flex space-x-8" aria-label="Tabs">
            <div className="py-4 px-1">
              <div className="w-12 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="py-4 px-1">
              <div className="w-20 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="py-4 px-1">
              <div className="w-16 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="py-4 px-1">
              <div className="w-20 h-5 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow-md mb-6 h-28">
        <div className="w-full h-full bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-3">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </div>
    </div>
  );
};

export default MyPageSkeleton;