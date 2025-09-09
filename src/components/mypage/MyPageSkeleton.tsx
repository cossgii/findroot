import ListItemSkeleton from '~/src/components/mypage/content/ListItemSkeleton';

const MyPageSkeleton = () => {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-pulse">
      <div className="w-full border-b border-gray-200 mb-8">
        <div className="flex space-x-8 h-12">
          <div className="w-16 bg-gray-300 rounded-t-lg"></div>
          <div className="w-24 bg-gray-300 rounded-t-lg"></div>
          <div className="w-16 bg-gray-300 rounded-t-lg"></div>
          <div className="w-24 bg-gray-300 rounded-t-lg"></div>
        </div>
      </div>
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
