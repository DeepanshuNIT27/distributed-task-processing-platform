import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Loader2,
  ChevronDown,
  CheckCircle2,
  Info,
  XCircle,
  PlusSquare,
  List,
  Activity,
} from "lucide-react";
import { taskService } from "../services/task.service";

// Components
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { RecentTasks } from "../components/dashboard/RecentTasks";
import { WorkerStatus } from "../components/dashboard/WorkerStatus";
import { ArchitectureCard } from "../components/dashboard/ArchitectureCard";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // --- 1. DYNAMIC GRAPH LOGIC ---
  const generateChartData = (allTasks) => {
    const days = 7;
    // Pichle 7 din ka blank array banao
    const data = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      return {
        date: d,
        completed: 0,
        failed: 0,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });

    // Actual tasks ko unke din ke hisaab se count karo
    allTasks.forEach((task) => {
      if (!task.createdAt) return;
      const taskDate = new Date(task.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      const dayMatch = data.find(
        (d) => d.date.getTime() === taskDate.getTime(),
      );
      if (dayMatch) {
        if (task.status === "completed") dayMatch.completed++;
        if (task.status === "failed") dayMatch.failed++;
      }
    });

    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.completed, d.failed)),
      1,
    );

    // SVG coordinates generate karo (width 210, height 120 ke scale pe)
    const getPoints = (type) => {
      return data
        .map((d, i) => {
          const x = i * (210 / (days - 1));
          const y = 120 - (d[type] / maxVal) * 100; // 100 is max height limit for graph lines
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
    };

    return {
      completedPoints: getPoints("completed"),
      failedPoints: getPoints("failed"),
      labels: data.map((d) => d.label),
    };
  };

  const chartData = generateChartData(tasks);

  // --- 2. DYNAMIC NOTIFICATIONS LOGIC ---
  const recentNotifications = [...tasks]
    .filter((t) => t.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3); // Sirf top 3

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hr ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " min ago";
    return "Just now";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin text-[#7C3AED]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400">
          Welcome back,{" "}
          <span className="text-[#A855F7] font-medium">
            {user?.name || "User"}
          </span>{" "}
          👋
        </p>
      </div>

      {/* Row 1: Top Stats Grid */}
      <StatsGrid />

      {/* Row 2: Recent Tasks & Worker Status (Side-by-Side, Equal Height) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 items-stretch">
        <div className="xl:col-span-2 h-full">
          <RecentTasks tasks={tasks} />
        </div>
        <div className="xl:col-span-1 h-full">
          <WorkerStatus />
        </div>
      </div>

      {/* Row 3: 4 Widgets in a 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Widget 1: DYNAMIC Processing Performance Chart */}
        <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-slate-200">
              Processing Performance
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 cursor-pointer hover:text-white transition">
              Last 7 Days <ChevronDown size={12} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-slate-400">Failed</span>
            </div>
          </div>
          <div className="relative h-32 w-full flex-1 mt-auto">
            {/* Real Dynamic SVG */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 210 120"
            >
              <path
                d={chartData.completedPoints}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={chartData.failedPoints}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-t border-slate-600"></div>
              <div className="w-full border-t border-slate-600"></div>
              <div className="w-full border-t border-slate-600"></div>
              <div className="w-full border-t border-slate-600"></div>
            </div>
          </div>
          <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/50">
            {chartData.labels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        </div>

        {/* Widget 2: System Nodes (Worker Status Detailed) */}
        <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-slate-200">
                System Nodes
              </h3>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Node-Alpha
                    </p>
                    <p className="text-xs text-emerald-400">Online</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Sharp Processor</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Loader2
                      size={14}
                      className="text-amber-500 animate-spin"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Node-Beta
                    </p>
                    <p className="text-xs text-amber-400">Processing</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Queue Active</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition">
            View Redis Cluster
          </button>
        </div>

        {/* Widget 3: DYNAMIC Recent Notifications */}
        <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-slate-200">
                Recent Notifications
              </h3>
            </div>
            <div className="space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {task.status === "completed" && (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500"
                          />
                        )}
                        {task.status === "processing" && (
                          <Info size={14} className="text-blue-500" />
                        )}
                        {task.status === "failed" && (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        {(task.status === "pending" || !task.status) && (
                          <Info size={14} className="text-slate-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Task{" "}
                        <span className="text-slate-100 font-mono">
                          #{task._id.slice(-6).toUpperCase()}
                        </span>{" "}
                        {task.status === "completed"
                          ? "completed successfully"
                          : task.status === "failed"
                            ? "failed to process"
                            : "is currently processing"}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {timeAgo(task.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  No recent activity found.
                </p>
              )}
            </div>
          </div>
          <Link
            to="/history"
            className="block text-center w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            View All Notifications
          </Link>
        </div>

        {/* Widget 4: Quick Actions */}
        <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none transform translate-x-4 translate-y-4">
            <Activity size={120} className="text-[#7C3AED]" />
          </div>
          <h3 className="text-sm font-medium text-slate-200 mb-6 relative z-10">
            Quick Actions
          </h3>
          <div className="space-y-4 relative z-10">
            <Link
              to="/create-task"
              className="flex items-center gap-4 group/item"
            >
              <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center border border-[#7C3AED]/20 group-hover/item:border-[#7C3AED]/50 transition">
                <PlusSquare size={18} className="text-[#A855F7]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover/item:text-white transition">
                  Create New Task
                </p>
                <p className="text-[10px] text-slate-500">
                  Upload and process a new task
                </p>
              </div>
            </Link>

            <Link to="/history" className="flex items-center gap-4 group/item">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover/item:border-blue-500/50 transition">
                <List size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover/item:text-white transition">
                  View All Tasks
                </p>
                <p className="text-[10px] text-slate-500">
                  Browse all your tasks
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: System Architecture (Full Width at Bottom) */}
      <div className="w-full mt-6">
        <ArchitectureCard />
      </div>
    </div>
  );
}
