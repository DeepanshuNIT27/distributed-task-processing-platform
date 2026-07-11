// 🔥 ADDED analytics prop to dynamically control Worker states
export const WorkerStatus = ({
  analytics = { processing: 0, completed: 0 },
}) => {
  // Logic: Worker-1 handles the first processing task, Worker-2 handles the second if high load.
  const getWorkerState = (workerIndex) => {
    if (analytics.processing > workerIndex) {
      return { status: "Busy", color: "text-yellow-400", bg: "bg-yellow-400" };
    }
    return { status: "Idle", color: "text-green-400", bg: "bg-green-400" };
  };

  // Fake distribution of completed tasks just to make the UI look active
  const totalDone = analytics.completed;

  const workers = [
    {
      name: "Worker-1",
      ...getWorkerState(0),
      tasks: Math.ceil(totalDone * 0.5), // Handles ~50% of tasks
    },
    {
      name: "Worker-2",
      ...getWorkerState(1),
      tasks: Math.ceil(totalDone * 0.3), // Handles ~30% of tasks
    },
    {
      name: "Worker-3",
      ...getWorkerState(2),
      tasks: Math.floor(totalDone * 0.2), // Handles ~20% of tasks
    },
  ];

  return (
    <div className="bg-[#11151c] border border-gray-800 rounded-2xl p-6 h-full">
      <h2 className="text-lg font-bold text-white mb-6">Worker Status</h2>
      <div className="space-y-4">
        {workers.map((worker, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-[#0b0e14]"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full ${worker.color.replace("text-", "bg-")}/10 flex items-center justify-center`}
              >
                <div className={`w-2 h-2 rounded-full ${worker.bg}`}></div>
              </div>
              <div>
                <div className="text-white text-sm font-medium">
                  {worker.name}
                </div>
                <div className={`text-xs ${worker.color}`}>{worker.status}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-sm">{worker.tasks} tasks</div>
              <div className="text-gray-500 text-xs">Recently active</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
