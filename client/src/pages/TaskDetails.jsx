import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "../services/api";
import { useTaskSocket } from "../hooks/useTaskSocket";

// 🔥 SDE FIX: Hardcode hata diya, env var se link aayega fallback ke sath
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [status, setStatus] = useState("pending");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load via API
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        const data = res.data.task;
        setTask(data);
        setStatus(data.status);
        setProgress(data.progress || 0);
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  // 2. Live Socket Sync via Hook
  const handleSocketEvent = useCallback((type, data) => {
    if (type === "processing") setStatus("processing");
    if (type === "progress") {
      setStatus("processing");
      setProgress(data.progress);
    }
    if (type === "completed") {
      setStatus("completed");
      setProgress(100);
      setTask((prev) => ({ ...prev, outputs: data.outputs }));
    }
    if (type === "failed") {
      setStatus("failed");
      setTask((prev) => ({ ...prev, errorDetails: data.error }));
    }
  }, []);

  useTaskSocket(id, handleSocketEvent);

  // Status Badge Helper
  const renderStatusBadge = () => {
    if (status === "completed")
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={16} /> Completed
        </span>
      );
    if (status === "processing")
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Loader2 size={16} className="animate-spin" /> Processing ({progress}
          %)
        </span>
      );
    if (status === "failed")
      return (
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle size={16} /> Failed
        </span>
      );
    return (
      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <Clock size={16} /> Queued
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
        Loading Task Details...
      </div>
    );
  }

  // ⚡ SDE Polish: API Safety Check
  if (!task || !task?.originalImage) {
    return (
      <div className="text-red-400 text-center mt-10 p-4 bg-red-500/10 rounded-lg border border-red-500/20 max-w-lg mx-auto">
        Task data is incomplete or not found!
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-4">
          <Link
            to="/history"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3">
              Task Details
              {renderStatusBadge()}
            </h2>
            <p className="text-slate-400 font-mono text-sm mt-1">ID: {id}</p>
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex justify-between text-sm font-medium mb-3">
          <span className="text-slate-300">Live Progress</span>
          <span className="text-blue-400">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${status === "failed" ? "bg-red-500" : status === "completed" ? "bg-emerald-500" : "bg-blue-500 relative overflow-hidden"}`}
            style={{ width: `${progress}%` }}
          >
            {status === "processing" && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
          </div>
        </div>
        {status === "failed" && (
          <p className="text-red-400 text-sm mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            Error:{" "}
            {task.errorDetails || "Unknown error occurred during processing."}
          </p>
        )}
      </div>

      {/* Original Image vs Outputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Original File */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="text-slate-400" /> Original Upload
          </h3>
          <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 p-2 flex items-center justify-center overflow-hidden min-h-[300px]">
            <img
              src={task.originalImage}
              alt="Original"
              className="max-w-full max-h-[400px] object-contain rounded"
            />
          </div>
        </div>

        {/* Right: Processed Outputs */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" /> Processed
            Versions
          </h3>

          {status === "completed" && task.outputs ? (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(task.outputs).map(([key, filename]) => (
                <div
                  key={key}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col gap-2 group relative"
                >
                  <div className="h-32 bg-slate-800 rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={`${BACKEND_URL}/outputs/${filename}`}
                      alt={key}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300 capitalize">
                      {key}
                    </p>
                  </div>
                  <a
                    href={`${BACKEND_URL}/outputs/${filename}`}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-blue-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm rounded-lg backdrop-blur-sm"
                  >
                    Open Image
                  </a>
                </div>
              ))}
            </div>
          ) : status === "failed" ? (
            <div className="h-full flex items-center justify-center text-slate-500 bg-slate-900 rounded-lg border border-slate-700">
              Processing failed. No outputs generated.
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 bg-slate-900 rounded-lg border border-slate-700 border-dashed">
              <Loader2 size={32} className="animate-spin mb-3 opacity-50" />
              <p>Waiting for worker to finish...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
