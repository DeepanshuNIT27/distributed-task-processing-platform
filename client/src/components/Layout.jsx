import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* 1. FIXED SIDEBAR WRAPPER: Scroll hone par hilega nahi */}
      <div className="fixed top-0 left-0 h-screen w-64 z-40">
        <Sidebar />
      </div>

      {/* 2. MAIN CONTENT: Sidebar ki width (64) ke barabar margin-left (ml-64) de diya */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen w-[calc(100%-16rem)]">
        <Navbar />

        {/* Pages render here */}
        <div className="p-4 md:p-8 flex flex-col gap-8 flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
