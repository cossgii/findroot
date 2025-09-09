const ListItemSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between animate-pulse">
      <div className="flex-grow pr-4">
        <div className="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <div className="w-16 h-8 bg-gray-300 rounded-lg"></div>
        <div className="w-16 h-8 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default ListItemSkeleton;
