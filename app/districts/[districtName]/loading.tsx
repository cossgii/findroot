export default function DistrictLoading() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-[400px] bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
