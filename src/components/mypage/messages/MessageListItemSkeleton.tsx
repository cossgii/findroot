const MessageListItemSkeleton = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
      <div className="flex justify-end">
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default MessageListItemSkeleton;
