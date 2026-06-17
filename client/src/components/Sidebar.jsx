import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, History, User } from "lucide-react";

export default function Sidebar() {
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

  return (
    <div className="hidden md:flex w-64 h-screen bg-slate-900 border-r border-slate-800 flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-500 tracking-wider">
          TaskFlow.
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
