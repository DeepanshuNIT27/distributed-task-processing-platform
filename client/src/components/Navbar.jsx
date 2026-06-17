import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-slate-200">Overview</h2>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
