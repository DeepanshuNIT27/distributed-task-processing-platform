export const ArchitectureCard = () => {
  return (
    <div className="bg-[#11151c] border border-gray-800 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">System Architecture</h2>
        <span className="text-green-400 text-xs flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Live
        </span>
      </div>
      <div className="flex-1 bg-[#0b0e14] border border-gray-800 rounded-xl flex items-center justify-center p-4 text-gray-500 text-sm">
        {/* Placeholder for architecture flow. You can replace this with an SVG later */}
        [ Client ] ➔ [ API Server ] ➔ [ Redis Queue ] ➔ [ Worker Pool ] ➔ [
        Sharp Processor ]
      </div>
    </div>
  );
};
