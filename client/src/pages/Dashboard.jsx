import { useState, useEffect } from "react";
import { getStats, getRecentTasks, getHealth } from "../services/dashboardApi";
// ❌ Yahan se Sidebar aur Topbar ke imports hata diye hain
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { RecentTasks } from "../components/dashboard/RecentTasks";
import { HealthCard } from "../components/dashboard/HealthCard";
import { ArchitectureCard } from "../components/dashboard/ArchitectureCard";
import { WorkerStatus } from "../components/dashboard/WorkerStatus";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, tasksData, healthData] = await Promise.all([
          getStats(),
          getRecentTasks(),
          getHealth(),
        ]);

        setStats(statsData);
        setRecentTasks(tasksData);
        setHealth(healthData);
      } catch (error) {
        console.error("❌ Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 🔥 FIX: Hata diya h-screen aur flex, ab ye sirf tera main content hai
  return (
    <div className="w-full space-y-6 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-2 flex items-center gap-2">
          Welcome back, Ayush Kumar <span className="text-xl">👋</span>
        </p>
      </div>

      {/* Row 1: Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Row 2: Architecture, Health & Worker Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HealthCard health={health} />
        </div>
        <div className="lg:col-span-1">
          <ArchitectureCard />
        </div>
        <div className="lg:col-span-1">
          <WorkerStatus />
        </div>
      </div>

      {/* Row 3: Recent Tasks Table */}
      <RecentTasks tasks={recentTasks} />
    </div>
  );
};

export default Dashboard;
