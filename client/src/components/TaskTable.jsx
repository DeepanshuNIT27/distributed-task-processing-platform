import { CheckCircle2, Clock, XCircle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { api } from "../services/api"; // 🔥 Added API service for retry

export default function TaskTable({ tasks = [], isLoading = false }) {
  // 🔥 Added State for loading spinner on the specific button
  const [retryingId, setRetryingId] = useState(null);

  // 🔥 Phase 9.4: Handle Retry Click
  const handleRetry = async (taskId) => {
    if (!taskId) return;
    setRetryingId(taskId);

    try {
      // Calling the Retry API created in Phase 9.1
      await api.post(`/tasks/retry/${taskId}`);
      console.log(`✅ Task ${taskId} sent for retry!`);
      // Note: Since you have real-time progress (7.4), the websocket should auto-update the status to 'processing' here!
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

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <CheckCircle2 size={14} /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">
            <Loader2 size={14} className="animate-spin" /> Processing
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
            <XCircle size={14} /> Failed
          </span>
        );
      default: // pending/queued
        return (
          <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-xs font-medium border border-slate-500/20">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-800/30 border border-slate-700 rounded-xl">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 text-sm border-b border-slate-700">
              <th className="font-medium p-4 pl-6">Task ID</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4">Progress</th>
              <th className="font-medium p-4">Created At</th>
              {/* 🔥 Added Action Column Header */}
              <th className="font-medium p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300 divide-y divide-slate-700/50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-slate-500">
                  No tasks found. Go to Create Task to upload an image.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task._id || task.taskId}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-4 pl-6 font-mono text-xs text-slate-400">
                    {task._id || task.taskId}
                  </td>
                  <td className="p-4">{getStatusBadge(task.status)}</td>
                  <td className="p-4">
                    {/* Placeholder for 7.4 (Live Progress) */}
                    <div className="flex items-center gap-3">
                      <span className="font-medium w-8">
                        {task.progress || 0}%
                      </span>
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(task.createdAt).toLocaleString()}
                  </td>
                  {/* 🔥 Added Action Column Cell */}
                  <td className="p-4 text-right pr-6">
                    {task.status === "failed" ? (
                      <button
                        onClick={() => handleRetry(task._id || task.taskId)}
                        disabled={retryingId === (task._id || task.taskId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {retryingId === (task._id || task.taskId) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Retry
                      </button>
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
