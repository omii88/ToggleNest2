import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ActivityItem from "../components/ActivityItem";
import CreateTaskPopup from "../components/CreateTask";
import CreateProjectPopup from "../components/CreateProject";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import "../theme/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);

  // 🔥 Load dashboard stats + activity
  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data.stats);
      setRecentActivity(res.data.recentActivity);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // 🔥 Load tasks
  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data);
    } catch (err) {
      console.error("Task load error:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadTasks();
  }, []);

  // 🔢 Task stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length || 1;

  const sprintChartData = [
    { name: "Completed", value: completedTasks },
    { name: "Remaining", value: totalTasks - completedTasks },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar
        openTaskPopup={() => setShowTaskPopup(true)}
        openProjectPopup={() => setShowProjectPopup(true)}
      />

      <div className="dashboard-content">
        <Topbar />

        <h2>Dashboard Overview</h2>
        <p className="muted-text">Welcome back! Here's what's happening.</p>

        {/* 🔹 TOP STAT CARDS */}
        {stats && (
          <div className="stats-grid">
            <StatCard title="Workspaces" value={stats.workspaces} />
            <StatCard title="Members" value={stats.members} />
            <StatCard title="Projects" value={stats.projects} />
            <StatCard title="Sprints" value={stats.sprints} />
            <StatCard title="Boards" value={stats.boards} />
          </div>
        )}

        {/* 🔹 ACTIVITY + CHART */}
        <div className="bottom-grid">
          <div className="activity card card--glow">
            <h3>Recent Activity</h3>

            {recentActivity.length === 0 ? (
              <p className="empty-text">No recent activity</p>
            ) : (
              recentActivity.map((item, i) => (
                <ActivityItem
                  key={i}
                  user="System"
                  action={`${item.type}: ${item.action}`}
                  time={new Date(item.time).toLocaleString()}
                />
              ))
            )}
          </div>

          <div className="progress card card--glow">
            <h3>Sprint Progress</h3>

            <div className="sprint-chart-wrapper">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={sprintChartData}
                    innerRadius={55}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#334155" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="sprint-chart-center">
                <h4>{completedTasks}/{tasks.length}</h4>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 BOTTOM TWO CARDS */}
        <div className="overview-grid">
          <div className="big-card card card--glow">
            <h3>Team Performance</h3>
            <div className="performance-stats">
              <div className="perf-box success">
                <h2>{completedTasks}</h2>
                <span>Completed</span>
              </div>
              <div className="perf-box info">
                <h2>{totalTasks - completedTasks}</h2>
                <span>In Progress</span>
              </div>
            </div>
          </div>

          <div className="big-card card card--glow">
            <h3>Workspace Overview</h3>
            <div className="workspace-item">
              <span>Active Projects</span>
              <strong>{stats?.projects || 0}</strong>
            </div>
            <div className="workspace-item">
              <span>Team Members</span>
              <strong>{stats?.members || 1}</strong>
            </div>

            <div className="workspace-storage">
              <span>Storage</span>
              <strong>0GB / 10GB</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 POPUPS */}
      <CreateTaskPopup
        showTaskPopup={showTaskPopup}
        setShowTaskPopup={setShowTaskPopup}
        onTaskCreated={loadTasks}
      />

      <CreateProjectPopup
        show={showProjectPopup}
        onClose={() => setShowProjectPopup(false)}
        onProjectCreated={loadDashboard}
      />
    </div>
  );
};

export default Dashboard;
