import "../theme/Analytics.css";
import { useState, useEffect, useRef } from "react";
import {
  FaDownload,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaBullseye,
  FaClock
} from "react-icons/fa";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#94a3b8"];

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("--");
  const [dateRange, setDateRange] = useState("Last 30 days");

  const pdfContentRef = useRef();

  /* ================= FETCH REAL DATA ================= */
  const fetchTasks = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= METRICS ================= */
  const doneTasks = tasks.filter(t => t.status === "done");
  const totalTasks = tasks.length;

  const teamVelocity = doneTasks.length;

  const avgCycleTime =
    doneTasks.reduce((acc, t) => {
      if (!t.completedAt) return acc;
      return acc + (new Date(t.completedAt) - new Date(t.createdAt)) / 86400000;
    }, 0) / (doneTasks.length || 1);

  const completionRate = totalTasks
    ? Math.round((doneTasks.length / totalTasks) * 100)
    : 0;

  /* ================= CUMULATIVE FLOW ================= */
  const cumulativeFlowData = [...tasks].reduce((acc, task) => {
    const day = new Date(task.createdAt).toLocaleDateString();
    if (!acc[day]) {
      acc[day] = { date: day, todo: 0, progress: 0, review: 0, done: 0 };
    }
    if (task.status === "todo") acc[day].todo++;
    if (task.status === "in-progress") acc[day].progress++;
    if (task.status === "review") acc[day].review++;
    if (task.status === "done") acc[day].done++;
    return acc;
  }, {});
  const cumulativeFlow = Object.values(cumulativeFlowData);

  /* ================= BURNDOWN ================= */
  const sprintTotal = totalTasks;
  const burndownData = Array.from({ length: 10 }, (_, i) => {
    const remaining = tasks.filter(
      t => !t.completedAt || t.sprintDay > i + 1
    ).length;
    return {
      day: `Day ${i + 1}`,
      ideal: sprintTotal - i * (sprintTotal / 10),
      actual: remaining
    };
  });

  /* ================= THROUGHPUT ================= */
  const throughputData = Object.values(
    doneTasks.reduce((acc, t) => {
      acc[t.assignee] = acc[t.assignee] || { name: t.assignee, tasks: 0 };
      acc[t.assignee].tasks++;
      return acc;
    }, {})
  );

  /* ================= DISTRIBUTION ================= */
  const taskDistribution = [
    { name: "Done", value: tasks.filter(t => t.status === "done").length },
    { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length },
    { name: "Review", value: tasks.filter(t => t.status === "review").length },
    { name: "To Do", value: tasks.filter(t => t.status === "todo").length }
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <button className="btn primary" onClick={fetchTasks}>
          {isRefreshing ? <FaSyncAlt className="spin" /> : <FaSyncAlt />} Refresh
        </button>
      </div>

      <main className="analytics-main">
        {/* METRICS */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="icon blue"><FaArrowUp /></div>
            <h2>{teamVelocity}</h2>
            <p>Team Velocity</p>
          </div>

          <div className="metric-card">
            <div className="icon yellow"><FaClock /></div>
            <h2>{avgCycleTime.toFixed(1)}</h2>
            <p>Avg Cycle Time</p>
          </div>

          <div className="metric-card">
            <div className="icon green"><FaCheckCircle /></div>
            <h2>{completionRate}%</h2>
            <p>Completion Rate</p>
          </div>

          <div className="metric-card">
            <div className="icon teal"><FaBullseye /></div>
            <h2>{completionRate > 80 ? "Healthy" : "At Risk"}</h2>
            <p>Sprint Health</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="charts-grid">
          {/* CUMULATIVE FLOW */}
          <div className="chart-card">
            <h3>Cumulative Flow</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cumulativeFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area stackId="1" dataKey="done" fill="#22c55e" />
                <Area stackId="1" dataKey="review" fill="#facc15" />
                <Area stackId="1" dataKey="progress" fill="#3b82f6" />
                <Area stackId="1" dataKey="todo" fill="#94a3b8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* BURNDOWN */}
          <div className="chart-card">
            <h3>Sprint Burndown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" />
                <Line dataKey="actual" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* THROUGHPUT */}
          <div className="chart-card">
            <h3>Team Throughput</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DISTRIBUTION */}
          <div className="chart-card">
            <h3>Task Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={taskDistribution} dataKey="value" innerRadius={70} outerRadius={100}>
                  {taskDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="last-updated">Last updated: {lastUpdated}</p>
      </main>
    </div>
  );
};

export default Analytics;