const RestaurantCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex-grow pr-4 animate-pulse">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="animate-pulse">
        <div className="w-12 h-12 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

export default RestaurantCardSkeleton;
