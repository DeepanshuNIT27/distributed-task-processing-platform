import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // Hook add kiya

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Create Task",
      path: "/create-task",
      icon: <PlusCircle size={20} />,
    },
    { name: "Task History", path: "/history", icon: <History size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="hidden md:flex w-64 h-screen bg-[#0b0f19] border-r border-slate-800 flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          TaskFlow<span className="text-[#7C3AED]">.</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button (Bottom) */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
