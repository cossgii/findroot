export default function RouteLoading() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="h-9 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 h-28 bg-gray-100" />
          ))}
        </div>
        <div className="h-[400px] bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
