import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import TaskTable from "../components/TaskTable";

export default function TaskHistory() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ⚠️ Make sure your backend has this GET route returning an array of tasks
      const response = await api.get("/tasks");

      // If response.data is directly the array OR response.data.tasks is the array
      const taskData = Array.isArray(response.data)
        ? response.data
        : response.data.tasks || [];
      setTasks(taskData);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load task history. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Task History</h2>
          <p className="text-slate-400 mt-1 text-sm">
            View all your processed and pending image tasks.
          </p>
        </div>

        {/* Filters & Search (UI Only for now, wiring will be in polish phase if needed) */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search Task ID..."
              className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          <button className="p-2 border border-slate-700 bg-slate-800/50 text-slate-400 rounded-lg hover:text-slate-200 hover:bg-slate-700 transition-colors">
            <Filter size={18} />
          </button>

          <button
            onClick={fetchTasks}
            disabled={isLoading}
            className="p-2 border border-slate-700 bg-slate-800/50 text-blue-400 rounded-lg hover:text-blue-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Table"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Table */}
      <TaskTable tasks={tasks} isLoading={isLoading} />
    </div>
  );
}
