import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ImageIcon,
  Check,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import { taskService } from "../services/task.service";
import { useTaskSocket } from "../hooks/useTaskSocket";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

export default function TaskDetails() {
  const { id } = useParams();

  // --- TERA EXISTING LOGIC & STATES (100% Untouched) ---
  const [task, setTask] = useState(null);
  const [status, setStatus] = useState("pending");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getTaskById(id);
        const taskData = data.task;
        setTask(taskData);
        setStatus(taskData.status);
        setProgress(taskData.progress || 0);
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 size={32} className="animate-spin mb-4 text-[#7C3AED]" />
        Loading Task Details...
      </div>
    );
  }

  if (!task || !task?.originalImage) {
    return (
      <div className="text-red-400 text-center mt-10 p-4 bg-red-500/10 rounded-lg border border-red-500/20 max-w-lg mx-auto">
        Task data is incomplete or not found!
      </div>
    );
  }

  // --- UI HELPERS FOR TARGET DESIGN ---
  const circleRadius = 60;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circleCircumference - (progress / 100) * circleCircumference;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-8">
      {/* Header (Breadcrumb Style) */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Task Details
        </h1>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Link to="/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
          <span>&gt;</span>
          <span className="text-slate-200">Task Details</span>
        </div>
      </div>

      {/* Task ID & Status Badge Row */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white font-mono">
          #{id.slice(-6).toUpperCase()}
        </h2>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-2 ${
            status === "completed"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : status === "failed"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : status === "processing"
                  ? "bg-[#7C3AED]/10 text-[#A855F7] border border-[#7C3AED]/20"
                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
          }`}
        >
          {status === "processing" && (
            <Loader2 size={14} className="animate-spin" />
          )}
          {status === "completed" && <CheckCircle2 size={14} />}
          {status === "failed" && <XCircle size={14} />}
          {status === "pending" && <Clock size={14} />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* 3-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: Live Progress */}
        <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-sm font-medium text-slate-200 w-full mb-8">
            Progress
          </h3>

          <div className="relative flex items-center justify-center mb-8">
            <svg width="200" height="200" className="transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-800"
              />
              {/* Progress Circle */}
              <circle
                cx="100"
                cy="100"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-out ${
                  status === "failed"
                    ? "text-red-500"
                    : status === "completed"
                      ? "text-emerald-500"
                      : "text-[#7C3AED]"
                }`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          <p
            className={`font-medium mb-8 ${
              status === "failed"
                ? "text-red-400"
                : status === "completed"
                  ? "text-emerald-400"
                  : "text-[#A855F7] animate-pulse"
            }`}
          >
            {status === "processing"
              ? "Processing..."
              : status === "completed"
                ? "Done!"
                : status === "failed"
                  ? "Failed"
                  : "Waiting in queue..."}
          </p>

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Started At</span>
              <span className="text-slate-200">
                {formatDate(task.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Estimated Time</span>
              <span className="text-slate-200">~ 45 - 60 sec</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Status Timeline */}
        <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-200 mb-8">
            Status Timeline
          </h3>

          <div className="relative border-l-2 border-slate-800 ml-4 space-y-8">
            {/* Step 1: Created */}
            <div className="relative pl-8">
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <Check size={12} className="text-emerald-500" />
              </div>
              <h4 className="text-sm font-medium text-emerald-400">
                Task Created
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {formatDate(task.createdAt)}
              </p>
            </div>

            {/* Step 2: Queued */}
            <div className="relative pl-8">
              <div
                className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  status !== "pending"
                    ? "bg-emerald-500/20 border-emerald-500"
                    : "bg-[#7C3AED]/20 border-[#7C3AED]"
                }`}
              >
                {status !== "pending" ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                )}
              </div>
              <h4
                className={`text-sm font-medium ${status !== "pending" ? "text-emerald-400" : "text-slate-200"}`}
              >
                Queued
              </h4>
              <p className="text-xs text-slate-500 mt-1">Sent to Redis</p>
            </div>

            {/* Step 3: Processing */}
            <div className="relative pl-8">
              <div
                className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  status === "completed"
                    ? "bg-emerald-500/20 border-emerald-500"
                    : status === "failed"
                      ? "bg-red-500/20 border-red-500"
                      : status === "processing"
                        ? "bg-[#7C3AED]/20 border-[#7C3AED]"
                        : "bg-slate-800 border-slate-600"
                }`}
              >
                {status === "completed" && (
                  <Check size={12} className="text-emerald-500" />
                )}
                {status === "failed" && (
                  <XCircle size={12} className="text-red-500" />
                )}
                {status === "processing" && (
                  <Loader2 size={12} className="animate-spin text-[#7C3AED]" />
                )}
              </div>
              <h4
                className={`text-sm font-medium ${
                  status === "completed"
                    ? "text-emerald-400"
                    : status === "failed"
                      ? "text-red-400"
                      : status === "processing"
                        ? "text-[#A855F7]"
                        : "text-slate-500"
                }`}
              >
                Processing
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Sharp Image Processor
              </p>
            </div>

            {/* Step 4: Completed/Failed */}
            <div className="relative pl-8">
              <div
                className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  status === "completed"
                    ? "bg-emerald-500/20 border-emerald-500"
                    : status === "failed"
                      ? "bg-red-500/20 border-red-500"
                      : "bg-slate-800 border-slate-600"
                }`}
              >
                {status === "completed" && (
                  <Check size={12} className="text-emerald-500" />
                )}
                {status === "failed" && (
                  <XCircle size={12} className="text-red-500" />
                )}
              </div>
              <h4
                className={`text-sm font-medium ${
                  status === "completed"
                    ? "text-emerald-400"
                    : status === "failed"
                      ? "text-red-400"
                      : "text-slate-500"
                }`}
              >
                {status === "failed" ? "Failed" : "Completed"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {status === "failed"
                  ? task.errorDetails
                  : status === "completed"
                    ? "Ready to download"
                    : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Output Versions & Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 flex-1">
            <h3 className="text-sm font-medium text-slate-200 mb-6">
              Output Versions
            </h3>

            {status === "completed" && task.outputs ? (
              <div className="space-y-4">
                {Object.entries(task.outputs).map(([key, filename]) => (
                  <div
                    key={key}
                    className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition"
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`${BACKEND_URL}/outputs/${filename}`}
                        alt={key}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-200 capitalize">
                        {key}
                      </h4>
                      <p className="text-xs text-slate-500">Processed File</p>
                    </div>
                    <a
                      href={`${BACKEND_URL}/outputs/${filename}`}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            ) : status === "failed" ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-red-500/5 rounded-xl border border-red-500/10">
                <AlertCircle size={32} className="text-red-500 mb-3" />
                <p className="text-sm font-medium text-red-400">
                  Processing Failed
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  No outputs generated
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Skeletons while processing */}
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl opacity-30"
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-slate-800 rounded animate-pulse"></div>
                      <div className="h-2 w-12 bg-slate-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-[#11151c] border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl font-medium text-sm transition">
              Cancel Task
            </button>
            <a
              href={task.originalImage}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
            >
              <Eye size={16} /> View Original
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
