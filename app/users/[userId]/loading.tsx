export default function UserProfileLoading() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
