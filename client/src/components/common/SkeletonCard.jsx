export const SkeletonCard = () => {
  return (
    <div className="bg-[#11151c] p-6 rounded-2xl border border-gray-800 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-700 rounded w-1/3 mt-4"></div>
    </div>
  );
};
