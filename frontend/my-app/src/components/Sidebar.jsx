import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../theme/Sidebar.css";
// 🚫 POPUPS DISABLED - FIXES VERCEL BUILD
// import CreateTaskPopup from "../components/CreateTask";
// import CreateProjectPopup from "../components/CreateProject";

const Sidebar = ({ addProject, addTask }) => {
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [deadlineValue, setDeadlineValue] = useState("");

  const handleAddProject = () => {
    if (nameValue.trim() && deadlineValue) {
      addProject({ name: nameValue.trim(), deadline: deadlineValue });
      setNameValue("");
      setDeadlineValue("");
      setShowProjectPopup(false);
    }
  };

  const handleAddTask = () => {
    if (nameValue.trim() && deadlineValue) {
      addTask({
        name: nameValue.trim(),
        deadline: deadlineValue,
        project: "",
        status: "Pending",
      });
      setNameValue("");
      setDeadlineValue("");
      setShowTaskPopup(false);
    }
  };

  // 🚨 MOCK POPUP FUNCTIONS - VERCEL BUILD SAFE
  const openTaskPopupMock = () => {
    alert("New Task - Coming Soon! (Popup temporarily disabled for deployment)");
    setShowTaskPopup(false);
  };

  const openProjectPopupMock = () => {
    alert("New Project - Coming Soon! (Popup temporarily disabled for deployment)");
    setShowProjectPopup(false);
  };

  return (
    <>
      <aside className="sidebar">
        <h2 className="logo">Workspace</h2>

        <ul className="menu">
          <NavLink to="/dashboard" className="menu-link">
            {({ isActive }) => <li className={isActive ? "active" : ""}>Dashboard</li>}
          </NavLink>

          <NavLink to="/boards" className="menu-link">
            {({ isActive }) => <li className={isActive ? "active" : ""}>Boards</li>}
          </NavLink>

          <NavLink to="/sprints" className="menu-link">
            {({ isActive }) => <li className={isActive ? "active" : ""}>Sprints</li>}
          </NavLink>

          <NavLink to="/analytics" className="menu-link">
            {({ isActive }) => <li className={isActive ? "active" : ""}>Analytics</li>}
          </NavLink>

          <NavLink to="/teampage" className="menu-link">
            {({ isActive }) => <li className={isActive ? "active" : ""}>Team</li>}
          </NavLink>
        </ul>

        <div className="quick-actions">
          <p>Quick Actions</p>
          <button
            className="btn btn-primary"
            onClick={openTaskPopupMock}  // ✅ FIXED - No popup import needed
          >
            + New Task
          </button>
          <button 
            className="btn-primary" 
            onClick={openProjectPopupMock}  // ✅ FIXED - No popup import needed
          >
            + New Project
          </button>
        </div>
      </aside>

      {/* 🚫 POPUPS DISABLED - NO IMPORTS NEEDED */}
      {/* <CreateTaskPopup ... /> */}
      {/* <CreateProjectPopup ... /> */}

      {/* ✅ INLINE MOCK POPUPS - BUILD SAFE */}
      {false && showTaskPopup && (
        <div className="popup-overlay open">
          <div className="popup-card">
            <h3>Create New Task</h3>
            <p>Popup temporarily disabled for deployment</p>
          </div>
        </div>
      )}

      {false && showProjectPopup && (
        <div className="popup-overlay open">
          <div className="popup-card">
            <h3>Create New Project</h3>
            <p>Popup temporarily disabled for deployment</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
