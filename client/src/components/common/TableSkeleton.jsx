export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full animate-pulse">
      <div className="border-b border-gray-800 pb-3 mb-3 flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-800 rounded flex-1"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="py-4 border-b border-gray-800/50 flex gap-4">
          <div className="h-4 bg-gray-800 rounded w-1/5"></div>
          <div className="h-4 bg-gray-800 rounded w-1/5"></div>
          <div className="h-4 bg-gray-800 rounded w-1/5"></div>
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
};
