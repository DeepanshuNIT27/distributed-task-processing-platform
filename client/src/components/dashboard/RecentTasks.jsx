import { useNavigate } from "react-router-dom"; // 1. Added Import

export const RecentTasks = ({ tasks }) => {
  const navigate = useNavigate(); // 2. Initialized Hook

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-purple-400 bg-purple-400/10";
    }
  };

  return (
    <div className="bg-[#11151c] border border-gray-800 rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Recent Tasks</h2>
        {/* 3. Added onClick to navigate to History */}
        <button
          onClick={() => navigate("/history")}
          className="text-sm text-gray-400 hover:text-white px-3 py-1 border border-gray-800 rounded-lg transition"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="text-gray-500 border-b border-gray-800">
            <tr>
              <th className="pb-3 font-medium">Task ID</th>
              <th className="pb-3 font-medium">File Name</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium w-1/4">Progress</th>
              <th className="pb-3 font-medium text-right">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {!tasks || tasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No recent tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                /* 4. Added onClick to navigate to specific dynamic Task ID */
                <tr
                  key={task._id}
                  onClick={() => navigate(`/task/${task._id}`)}
                  className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-4 font-mono text-gray-400">
                    #{task._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-4 text-gray-300">
                    {task.fileName || "Unknown"}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center w-max gap-2 ${getStatusColor(task.status)}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {task.status || "Pending"}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 w-8">
                        {task.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-gray-400">
                    {new Date(task.createdAt).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
