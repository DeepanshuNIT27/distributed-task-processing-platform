import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Calendar,
  Eye,
  Download,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { api } from "../services/api";
import { TableSkeleton } from "../components/common/TableSkeleton";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

// 🔥 ADDED: Import socket instance
import { socket } from "../services/socket";

export default function TaskHistory() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [retryingId, setRetryingId] = useState(null);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/tasks");
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

  useEffect(() => {
    fetchTasks();
  }, []);

  // 🔥 ADDED: Phase 9.6 - Socket Event Listeners for Live Updates
  useEffect(() => {
    // Socket connect karo
    socket.connect();

    // Universal update handler
    const handleTaskUpdate = (data) => {
      // Backend generally sends { taskId, progress, status, ... }
      const targetId = data.taskId || data._id;
      if (!targetId) return;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === targetId ? { ...task, ...data } : task,
        ),
      );
    };

    // Listen to standard events emitted by backend QueueEvents
    socket.on("task_progress", handleTaskUpdate);
    socket.on("task_completed", handleTaskUpdate);
    socket.on("task_failed", handleTaskUpdate);
    socket.on("task_updated", handleTaskUpdate); // Catch-all if backend uses this

    // Cleanup on unmount
    return () => {
      socket.off("task_progress", handleTaskUpdate);
      socket.off("task_completed", handleTaskUpdate);
      socket.off("task_failed", handleTaskUpdate);
      socket.off("task_updated", handleTaskUpdate);
      socket.disconnect();
    };
  }, []);

  // 🔥 ADDED: Phase 9.6 - Join Socket Rooms dynamically for active tasks
  useEffect(() => {
    // Sirf un tasks ke room join karo jo abhi complete ya fail nahi hue hain
    const activeTasks = tasks.filter(
      (t) => t.status === "pending" || t.status === "processing",
    );

    activeTasks.forEach((task) => {
      socket.emit("join-task-room", task._id);
    });

    return () => {
      activeTasks.forEach((task) => {
        socket.emit("leave-task-room", task._id);
      });
    };
  }, [tasks]); // Re-run when tasks array changes

  const handleRetry = async (taskId) => {
    if (!taskId) return;
    setRetryingId(taskId);

    try {
      await api.post(`/api/tasks/${taskId}/retry`);
      console.log(`✅ Task ${taskId} sent for retry!`);
      await fetchTasks();
    } catch (error) {
      console.error("Retry Error:", error);
      alert(
        "Failed to retry task: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setRetryingId(null);
    }
  };

  // --- DYNAMIC PAGINATION LOGIC ---
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  // --- UI HELPERS ---
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="flex items-center gap-1.5 w-max px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={14} /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center gap-1.5 w-max px-2.5 py-1 rounded-full text-xs font-medium bg-[#7C3AED]/10 text-[#A855F7] border border-[#7C3AED]/20">
            <Loader2 size={14} className="animate-spin" /> Processing
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1.5 w-max px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={14} /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 w-max px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-8 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Task History
        </h1>
        <p className="text-slate-400 text-sm">All your tasks in one place</p>
      </div>

      <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 flex flex-col flex-1">
        {/* Filters & Search Row */}
        <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative">
              <select className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-slate-600 cursor-pointer">
                <option>All Status</option>
                <option>Completed</option>
                <option>Processing</option>
                <option>Failed</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>

            {/* Types Dropdown */}
            <div className="relative">
              <select className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-slate-600 cursor-pointer">
                <option>All Types</option>
                <option>Image Processing</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 hidden sm:flex">
              <Calendar size={16} className="text-slate-500" />
              <input
                type="text"
                placeholder="Start date"
                className="bg-transparent w-20 focus:outline-none placeholder:text-slate-500"
              />
              <span className="text-slate-600">+</span>
              <input
                type="text"
                placeholder="End date"
                className="bg-transparent w-20 focus:outline-none placeholder:text-slate-500"
              />
              <Calendar size={16} className="text-slate-500" />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 w-full xl:w-64"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1">
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : error ? (
            <ErrorState
              title="Failed to load tasks"
              message={error}
              onRetry={fetchTasks}
            />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No Tasks Found"
              description="You haven't processed any images yet. Upload an image to get started."
              actionText="Create Task"
              actionLink="/create-task"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white">
                <thead className="text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="pb-4 font-medium px-4">Task ID</th>
                    <th className="pb-4 font-medium px-4">Type</th>
                    <th className="pb-4 font-medium px-4">Status</th>
                    <th className="pb-4 font-medium px-4 w-1/4">Progress</th>
                    <th className="pb-4 font-medium px-4 text-right">
                      Created At
                    </th>
                    <th className="pb-4 font-medium px-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {currentTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono text-slate-400">
                        #{task._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        Image Processing
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ease-out ${task.status === "failed" ? "bg-red-500" : task.status === "completed" ? "bg-[#7C3AED]" : "bg-[#7C3AED]"}`}
                              style={{
                                width: `${task.progress || (task.status === "completed" ? 100 : 0)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-slate-400 w-9 text-xs">
                            {task.progress ||
                              (task.status === "completed" ? 100 : 0)}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400 text-xs">
                        {new Date(task.createdAt).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-4 text-slate-400">
                          <button
                            onClick={() => navigate(`/task/${task._id}`)}
                            className="hover:text-white transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          {task.status === "completed" && (
                            <button
                              className="hover:text-[#7C3AED] transition"
                              title="Download Outputs"
                            >
                              <Download size={18} />
                            </button>
                          )}

                          {task.status === "failed" && (
                            <button
                              onClick={() => handleRetry(task._id)}
                              disabled={retryingId === task._id}
                              className="hover:text-blue-400 transition disabled:opacity-50"
                              title="Retry Failed Task"
                            >
                              {retryingId === task._id ? (
                                <Loader2
                                  size={18}
                                  className="animate-spin text-blue-400"
                                />
                              ) : (
                                <RefreshCw size={18} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dynamic Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-800">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition ${
                  currentPage === index + 1
                    ? "bg-[#7C3AED] text-white border-none"
                    : "border border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
