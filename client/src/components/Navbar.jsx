import { useState, useRef, useEffect } from "react";
import {
  Bell,
  User,
  Menu,
  LogOut,
  UserCircle,
  History,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { taskService } from "../services/task.service";

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch recent tasks for notifications
  useEffect(() => {
    if (isNotifOpen) {
      taskService
        .getTasks()
        .then((data) => {
          const sortedTasks = (data.tasks || [])
            .filter((t) => t.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setNotifications(sortedTasks);
        })
        .catch(() => console.error("Failed to load notifications"));
    }
  }, [isNotifOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds / 3600 >= 1) return Math.floor(seconds / 3600) + "h ago";
    if (seconds / 60 >= 1) return Math.floor(seconds / 60) + "m ago";
    return "Just now";
  };

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      {/* Left Side: Untouched Original Code */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-200 transition-colors md:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-slate-200 hidden sm:block">
          Overview
        </h2>
      </div>

      {/* Right Side: Option 2 Dropdowns injected here */}
      <div className="flex items-center gap-4">
        {/* 🔔 Notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className={`p-2 relative transition-colors rounded-full ${isNotifOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-[#11151c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800 bg-slate-900/80 font-medium text-slate-200 text-sm">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-start gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      <div className="mt-0.5">
                        {task.status === "completed" && (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500"
                          />
                        )}
                        {task.status === "failed" && (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        {(task.status === "processing" ||
                          task.status === "pending" ||
                          !task.status) && (
                          <Info size={14} className="text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-300">
                          Task{" "}
                          <span className="font-mono text-slate-100">
                            #{task._id.slice(-6).toUpperCase()}
                          </span>{" "}
                          {task.status}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {timeAgo(task.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-5">
                    No recent tasks
                  </p>
                )}
              </div>
              <Link
                to="/history"
                onClick={() => setIsNotifOpen(false)}
                className="block p-2.5 text-center text-xs text-[#7C3AED] hover:bg-slate-800/50 border-t border-slate-800 transition-colors"
              >
                View All History
              </Link>
            </div>
          )}
        </div>

        {/* 👤 Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white hover:ring-2 hover:ring-offset-2 ring-offset-slate-900 hover:ring-slate-700 transition-all"
          >
            <User size={16} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#11151c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800 bg-slate-900/80">
                <p className="text-sm font-medium text-white truncate">
                  Hi, {user?.name || "User"} 👋
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <UserCircle size={16} /> Profile
                </Link>
                <Link
                  to="/history"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <History size={16} /> History
                </Link>
              </div>
              <div className="p-1.5 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
