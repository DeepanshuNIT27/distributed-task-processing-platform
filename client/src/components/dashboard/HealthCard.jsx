export const HealthCard = ({ health }) => {
  return (
    <div className="bg-[#11151c] border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">System Health</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-[#0b0e14] p-3 rounded-lg border border-gray-800">
          <span className="text-gray-400">Worker Status</span>
          <span
            className={`flex items-center gap-2 text-sm ${health?.worker === "online" ? "text-green-400" : "text-red-400"}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {health?.worker?.toUpperCase() || "OFFLINE"}
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#0b0e14] p-3 rounded-lg border border-gray-800">
          <span className="text-gray-400">Redis Queue</span>
          <span
            className={`flex items-center gap-2 text-sm ${health?.redis === "connected" ? "text-green-400" : "text-red-400"}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {health?.redis?.toUpperCase() || "DISCONNECTED"}
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#0b0e14] p-3 rounded-lg border border-gray-800">
          <span className="text-gray-400">Database</span>
          <span
            className={`flex items-center gap-2 text-sm ${health?.database === "connected" ? "text-green-400" : "text-red-400"}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {health?.database?.toUpperCase() || "DISCONNECTED"}
          </span>
        </div>
      </div>
    </div>
  );
};
