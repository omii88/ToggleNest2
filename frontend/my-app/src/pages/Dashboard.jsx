import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ActivityItem from "../components/ActivityItem";
import "../theme/Dashboard.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import CreateTaskPopup from "../components/CreateTask";
import CreateProjectPopup from "../components/CreateProject";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [members] = useState(["You"]);
  const [workspaceStorage, setWorkspaceStorage] = useState({ used: 0, total: 10 });
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);



  const [deleteModal, setDeleteModal] = useState({ visible: false, type: "", index: null });

  useEffect(() => {
    document.body.classList.toggle("modal-open", deleteModal.visible);
  }, [deleteModal.visible]);

  const getCurrentTime = () => new Date().toISOString();

  const addProject = (project) => {
    if (!project.name) return;
    const newProject = {
      ...project,
      user: project.user || "You",
      size: 0.5,
      action: `created project '${project.name}'`,
      time: getCurrentTime(),
    };
    setProjects([...projects, newProject]);
    setWorkspaceStorage(prev => ({ ...prev, used: prev.used + newProject.size }));
  };

  const deleteProject = (index) => {
    const removed = projects[index];
    setProjects(projects.filter((_, i) => i !== index));
    setWorkspaceStorage(prev => ({ ...prev, used: prev.used - removed.size }));
    setDeleteModal({ visible: false, type: "", index: null });
  };

  const addTask = (task) => {
    if (!task.name) return;
    const newTask = {
      user: "You",
      name: task.name,
      deadline: task.deadline || "",
      completed: false,
      points: 1,
      size: 0.1,
      action: `created task '${task.name}'`,
      time: getCurrentTime(),
    };
    setTasks([...tasks, newTask]);
    setWorkspaceStorage(prev => ({ ...prev, used: prev.used + newTask.size }));
  };

  const deleteTask = (index) => {
    const removed = tasks[index];
    setTasks(tasks.filter((_, i) => i !== index));
    setWorkspaceStorage(prev => ({ ...prev, used: prev.used - removed.size }));
    setDeleteModal({ visible: false, type: "", index: null });
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length || 1; // prevent zero divide

  const sprintChartData = [
    { name: "Completed", value: completedTasks },
    { name: "Remaining", value: Math.max(totalTasks - completedTasks, 1) }
  ];



// 🔥 Load tasks from backend
const loadTasks = async () => {
  try {
    const res = await api.get("/tasks/my");
    console.log("Loaded Tasks:", res.data);
    setTasks(res.data);
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
};

useEffect(() => {
  loadTasks();  // 🔥 Load tasks on page load
}, []);


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
        {/* <button
  className="btn btn-primary"
  onClick={() => setShowTaskPopup(true)}
>
  New Task
</button> */}


        {/* STAT CARDS */}
        <div className="stats-grid">
          <StatCard title="Active Sprints" value={sprints.length} />
          <StatCard title="Total Tasks" value={tasks.length} />
          <StatCard title="Completed Tasks" value={completedTasks} />
          <StatCard title="Deadlines" value={tasks.filter(t => t.deadline).length} />
          <StatCard title="My Projects" value={projects.length} />
        </div>

        {/* ACTIVITY + CHART */}
        <div className="bottom-grid">
          <div className="activity card card--glow">
            <h3>Recent Activity</h3>
            {tasks.length + projects.length === 0 ? (
              <p className="empty-text">Create a project or task to see recent activity</p>
            ) : (
              <>
                {tasks.map((task) => (
                  <ActivityItem
                    key={task._id || task.name}
                    user="You"
                    action={`Created task: ${task.title || task.name}`}
                    time={new Date(task.createdAt || task.time).toLocaleString()}
                  />
                ))}

                {projects.map((project, i) => (
                  <ActivityItem
                    key={`project-${i}`}
                    user={project.user}
                    action={`Created project: ${project.name}`}
                    time={project.time}
                  />
                ))}
              </>
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

        {/* OVERVIEW GRID */}
        <div className="overview-grid">
          <div className="big-card card card--glow">
            <h3>Team Performance</h3>
            <div className="performance-stats">
              <div className="perf-box success">
                <h2>{completedTasks}</h2>
                <span>Completed</span>
              </div>
              <div className="perf-box info">
                <h2>{tasks.length - completedTasks}</h2>
                <span>In Progress</span>
              </div>
            </div>
          </div>

          <div className="big-card card card--glow">
            <h3>Workspace Overview</h3>
            <div className="workspace-item">
              <span>Active Projects</span>
              <strong>{projects.length}</strong>
            </div>
            <div className="workspace-item">
              <span>Team Members</span>
              <strong>{members.length}</strong>
            </div>

            <div className="workspace-storage">
              <span>Storage</span>
              <strong>{workspaceStorage.used}GB / {workspaceStorage.total}GB</strong>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(workspaceStorage.used / workspaceStorage.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      
             <CreateTaskPopup
        showTaskPopup={showTaskPopup}
        setShowTaskPopup={setShowTaskPopup}
        onTaskCreated={(task) => {
          setTasks((prev) => [
            ...prev,
            {
              _id: task._id,
              name: task.title,
              deadline: task.dueDate,
              user: "You",
              completed: false,
              action: `created task '${task.title}'`,
              time: new Date().toISOString(),
            },
          ]);
        }}
      />

      <CreateProjectPopup
  show={showProjectPopup}
  onClose={() => setShowProjectPopup(false)}
  onProjectCreated={(project) => {
    setProjects((prev) => [...prev, project]);
  }}
/>



    </div>
    
  );
};

export default Dashboard;
