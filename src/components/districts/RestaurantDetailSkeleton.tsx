const RestaurantDetailSkeleton = () => {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>

      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>

      <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>

      <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>

      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>

      <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>

      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="w-12 h-12 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

export default RestaurantDetailSkeleton;
