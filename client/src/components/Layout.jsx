import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#050816] text-white overflow-hidden font-sans">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* 3. Top Navbar */}
        <Navbar />

        {/* 4. Page Content (Outlet renders Dashboard, History, etc.) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
