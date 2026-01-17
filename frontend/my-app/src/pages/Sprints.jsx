// ✅ FIXED COMPLETE SprintPage.jsx - REFRESH + RIGHT-CLICK DELETE WORKING!
import React, { useState, useEffect } from "react";
import "../theme/SprintPage.css";
import {
  FiCalendar, FiPlus, FiFilter, FiRefreshCcw, FiX, FiChevronLeft,
  FiGrid, FiSun, FiList, FiTrash2, FiAlertTriangle,
} from "react-icons/fi";
import api from "../api/axios";
import Swal from "sweetalert2";


const SprintPage = () => {
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState('month');
  const [sprints, setSprints] = useState([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  
  const [contextMenu, setContextMenu] = useState({ 
    show: false, x: 0, y: 0, id: null, type: null 
  });
  
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    show: false, id: null, name: '', type: '' 
  });

 const [originalBacklogItems, setOriginalBacklogItems] = useState([]);
const [backlogItems, setBacklogItems] = useState([]);
const [showFilterMenu, setShowFilterMenu] = useState(false);
const [showBacklogForm, setShowBacklogForm] = useState(false);
const [newItem, setNewItem] = useState({ 
  name: '',
  epic: 'Auth',
  priority: 'High',
  assignee: '',
  status: 'To Do'
});
useEffect(() => {
  // initialize original backlog ONLY ONCE
  if (originalBacklogItems.length === 0 && backlogItems.length > 0) {
    setOriginalBacklogItems(backlogItems);
  }
}, [backlogItems, originalBacklogItems]);



  async function fetchSprints() {
    try {
      const res = await api.get("/sprints");
      setSprints(res.data);
      console.log(res.data)
    } catch (err) {
      console.error(err);
      alert("Failed to fetch sprints");
    } 
  }
  useEffect(() => {
    fetchSprints();
  }, []);

  const createSprint = async () => {
    // const name = document.getElementById('sprintName').value;
    // const startDate = document.getElementById('startDate').value;
    // const endDate = document.getElementById('endDate').value;
    // const goal = document.getElementById('sprintGoal').value;
    
    // if (name && startDate && endDate) {
    //   setSprints([...sprints, {
    //     id: Date.now(),
    //     name, startDate, endDate, goal,
    //     active: sprints.length === 0
    //   }]);
    //   setShowCreateSprint(false);
    //   document.getElementById('sprintName').value = '';
    //   document.getElementById('startDate').value = '';
    //   document.getElementById('endDate').value = '';
    //   document.getElementById('sprintGoal').value = '';
    // }
     if (!name || !startDate || !endDate) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // 🔥 BACKEND CALL
      const res = await api.post("/sprints", {
        name,
        startDate,
        endDate,
        goal,
      });
      console.log(res.data)

      // Notify dashboard
     // onSprintCreated?.(res.data);

      // reset & close
      // setName("");
      // setStartDate("");
      // setEndDate("");
      // setGoal("");

      // onClose();
      await fetchSprints(); 
      setShowCreateSprint(false);
      Swal.fire({
        icon: 'success',
        title: 'Sprint Created',  
        text: `Sprint "${res.data.name}" has been created successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to create sprint");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Refresh now resets to original backlog
  const refreshBacklog = () => {
    setBacklogItems([...originalBacklogItems]);
    setShowFilterMenu(false);
    setShowBacklogForm(false);
  };

  const filterByStatus = (status) => {
    const filtered = originalBacklogItems.filter(item => item.status === status);
    setBacklogItems(filtered);
    setShowFilterMenu(false);
  };

  const filterByPriority = (priority) => {
    const filtered = originalBacklogItems.filter(item => item.priority === priority);
    setBacklogItems(filtered);
    setShowFilterMenu(false);
  };

  const addBacklogItem = () => {
    if (newItem.name.trim()) {
      const newBacklogItem = {
        id: Date.now(),
        name: newItem.name,
        epic: newItem.epic,
        priority: newItem.priority,
        assignee: newItem.assignee || 'Unassigned',
        status: newItem.status
      };
      setOriginalBacklogItems([newBacklogItem, ...originalBacklogItems]);
      setBacklogItems([newBacklogItem, ...backlogItems]);
      setNewItem({ name: '', epic: 'Auth', priority: 'High', assignee: '', status: 'To Do' });
      setShowBacklogForm(false);
    }
  };

  // ✅ FIXED: Unified delete confirmation handler
  const confirmDelete = () => {
    if (deleteConfirm.type === 'sprint') {
      
    } else if (deleteConfirm.type === 'backlog') {
      const updatedOriginal = originalBacklogItems.filter(item => item.id !== deleteConfirm.id);
      setOriginalBacklogItems(updatedOriginal);
      setBacklogItems(backlogItems.filter(item => item.id !== deleteConfirm.id));
    }
    setDeleteConfirm({ show: false, id: null, name: '', type: '' });
    setContextMenu({ show: false, x: 0, y: 0, id: null, type: null });
  };

  const showDeleteConfirm = (id, name, type) => {
    setDeleteConfirm({ show: true, id, name, type });
    setContextMenu({ show: false, x: 0, y: 0, id: null, type: null });
  };

  // ✅ FIXED: Context menu handler - WORKS PERFECTLY
  const handleContextMenu = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      id,
      type
    });
  };

  const handleCloseContextMenu = (e) => {
    if (e) e.stopPropagation();
    setContextMenu({ show: false, x: 0, y: 0, id: null, type: null });
    setShowFilterMenu(false);
  };

  const applyFilters = () => {
    const epicSelect = document.querySelector('.sprint-filters select');
    const prioritySelect = document.querySelectorAll('.sprint-filters select')[1];
    
    let filtered = [...originalBacklogItems];
    
    if (epicSelect && epicSelect.value !== 'All Epics') {
      filtered = filtered.filter(item => item.epic === epicSelect.value);
    }
    
    if (prioritySelect && prioritySelect.value !== 'All Priorities') {
      filtered = filtered.filter(item => item.priority === prioritySelect.value);
    }
    
    setBacklogItems(filtered);
  };

  const activeSprint = sprints.find(
    s => s.status === "active" || s.status === "upcoming"
  );

  return (
    <div className="sprint-wrapper" onClick={handleCloseContextMenu}>
      {/* HEADER */}
      <div className="sprint-header">
        <div className="sprint-title">
          <h1>Sprint Planning</h1>
          <p>Plan, create and manage sprints for your team</p>
        </div>
        <div className="sprint-header-actions">
          <button className="sprint-btn-secondary" onClick={() => setShowCalendar(true)}>
            <FiCalendar /> View Calendar
          </button>
          <button className="sprint-btn-primary" onClick={() => setShowCreateSprint(true)}>
            <FiPlus /> New Sprint
          </button>
        </div>
      </div>
{/* MAIN SPRINT CARD - ALL SPRINTS STACKED */}
<div className="sprint-empty has-active-sprint">
  {sprints.length === 0 ? (
    <>
      <h3>No Active Sprint</h3>
      <p>Create a sprint to start planning your work</p>
      <button className="sprint-btn-primary" onClick={() => setShowCreateSprint(true)}>
        <FiPlus /> Create Sprint
      </button>
    </>
  ) : (
    <div className="sprint-list-scroll">
      {sprints.map((sprint) => (
        <div
          key={sprint.id}
          className={`active-sprint-card stacked ${sprint.active ? 'active' : ''}`}
          onContextMenu={(e) => handleContextMenu(e, sprint.id, 'sprint')}
        >
          <div className="active-sprint-header">
            <div className={`sprint-icon ${sprint.active ? 'blue' : 'gray'}`}>
              🏃‍♂️
            </div>

            <div className="sprint-info">
              <h3>{sprint.name}</h3>
              <div className="sprint-dates">
                {sprint.startDate.slice(5, 10).replace('-', '/')} –
                {sprint.endDate.slice(5, 10).replace('-', '/')}
              </div>
            </div>

            {sprint.active && (
              <span className="active-pill">ACTIVE</span>
            )}
          </div>

          <div className="sprint-goal">
            {sprint.goal || 'No sprint goal defined'}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      

      {/* PRODUCT BACKLOG */}
      <div className="sprint-card">
        <div className="sprint-card-header">
          <h3>Product Backlog</h3>
          <div className="sprint-backlog-actions">
            <FiRefreshCcw 
              className="backlog-action" 
              onClick={refreshBacklog} 
              title="Refresh (Reset Filters)"
            />
            <div className="filter-menu-container">
              <FiFilter 
                className={`backlog-action ${showFilterMenu ? 'active' : ''}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                }}
                title="Quick Filters"
              />
              {showFilterMenu && (
                <div className="filter-dropdown-menu">
                  <div className="filter-menu-item" onClick={() => filterByStatus('To Do')}>
                    <span className="status-to-do">📋</span> To Do Only
                  </div>
                  <div className="filter-menu-item" onClick={() => filterByStatus('In Progress')}>
                    <span className="status-in-progress">⏳</span> In Progress Only
                  </div>
                  <div className="filter-menu-item" onClick={() => filterByStatus('Done')}>
                    <span className="status-done">✅</span> Done Only
                  </div>
                  <div className="filter-menu-item" onClick={() => filterByPriority('High')}>
                    <span className="priority-high">🔥</span> High Priority
                  </div>
                  <div className="filter-menu-item" onClick={() => filterByPriority('Critical')}>
                    <span className="priority-critical">🚨</span> Critical Priority
                  </div>
                  <div className="filter-menu-clear" onClick={refreshBacklog}>
                    🧹 Clear All Filters
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="sprint-filters">
          <select defaultValue="All Epics" className="filter-select" onChange={applyFilters}>
            <option>All Epics</option><option>Auth</option><option>UI</option><option>Backend</option><option>Payments</option>
          </select>
          <select defaultValue="All Priorities" className="filter-select" onChange={applyFilters}>
            <option>All Priorities</option><option>High</option><option>Medium</option><option>Low</option><option>Critical</option>
          </select>
          <select defaultValue="All Assignees">
            <option>All Assignees</option>
          </select>
          <select defaultValue="Status">
            <option>Status</option><option>To Do</option><option>In Progress</option><option>Done</option>
          </select>
        </div>

        <div className="backlog-add-section">
          <button className="backlog-add-btn" onClick={() => setShowBacklogForm(true)}>
            <FiPlus /> Add Backlog Item
          </button>
        </div>

        <div className="sprint-backlog-list">
          {backlogItems.length === 0 ? (
            <div className="sprint-backlog-empty">
              <p>No backlog items yet. <br/>Click "Add Backlog Item" to get started!</p>
            </div>
          ) : (
            <div className="backlog-items">
              {backlogItems.map(item => (
                <div 
                  key={item.id} 
                  className="backlog-item"
                  onContextMenu={(e) => handleContextMenu(e, item.id, 'backlog')}
                >
                  <div className="backlog-title">{item.name}</div>
                  <div className="backlog-tags">
                    <span className={`tag ${item.epic.toLowerCase()}`}>{item.epic}</span>
                    <span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                    <span className="tag assignee">{item.assignee}</span>
                    <span className={`status status-${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BACKLOG ADD FORM */}
      {showBacklogForm && (
        <div className="backlog-form-overlay" onClick={() => setShowBacklogForm(false)}>
          <div className="backlog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="backlog-form-header">
              <h3><FiPlus /> New Backlog Item</h3>
              <FiX className="form-close" onClick={() => setShowBacklogForm(false)} />
            </div>
            <div className="backlog-form-body">
              <div className="form-group">
                <label>Task Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter task name..." 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Epic</label>
                  <select value={newItem.epic} onChange={(e) => setNewItem({...newItem, epic: e.target.value})}>
                    <option>Auth</option><option>UI</option><option>Backend</option><option>Payments</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={newItem.priority} onChange={(e) => setNewItem({...newItem, priority: e.target.value})}>
                    <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assignee</label>
                  <input 
                    type="text" 
                    placeholder="Enter assignee name (e.g. Ramesh, Priya)..." 
                    value={newItem.assignee}
                    onChange={(e) => setNewItem({...newItem, assignee: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={newItem.status} onChange={(e) => setNewItem({...newItem, status: e.target.value})}>
                    <option>To Do</option><option>In Progress</option><option>Done</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="backlog-form-footer">
              <button className="sprint-btn-secondary" onClick={() => setShowBacklogForm(false)}>
                Cancel
              </button>
              <button className="sprint-btn-primary" onClick={addBacklogItem} disabled={!newItem.name.trim()}>
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: CONTEXT MENU - RIGHT-CLICK DELETE POPUP */}
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed',
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y}px`,
            zIndex: 999999,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="context-menu-item danger"
            onClick={(e) => {
              e.stopPropagation();
              const itemName = contextMenu.type === 'backlog' 
                ? originalBacklogItems.find(item => item.id === contextMenu.id)?.name 
                  || backlogItems.find(item => item.id === contextMenu.id)?.name
                : sprints.find(s => s.id === contextMenu.id)?.name || 'Sprint';
              showDeleteConfirm(contextMenu.id, itemName || 'Item', contextMenu.type);
            }}
          >
            <FiTrash2 /> Delete {contextMenu.type === 'backlog' ? 'Item' : 'Sprint'}
          </div>
        </div>
      )}

      {/* ✅ FIXED: SINGLE UNIFIED DELETE CONFIRMATION */}
      {deleteConfirm.show && (
        <div className="delete-confirm-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="delete-confirm-modal">
            <div className="delete-confirm-icon">
              <FiAlertTriangle />
            </div>
            <h3>Delete {deleteConfirm.type === 'backlog' ? 'Backlog Item?' : 'Sprint?'}</h3>
            <p className="delete-confirm-text">
              Are you sure you want to delete "<strong>{deleteConfirm.name}</strong>"? 
              {deleteConfirm.type === 'sprint' && ' All sprint data will be lost.'}
              <br/>This action cannot be undone.
            </p>
            <div className="delete-confirm-actions">
              <button 
                className="sprint-btn-secondary delete-confirm-cancel"
                onClick={() => {
                  setDeleteConfirm({ show: false, id: null, name: '', type: '' });
                  setContextMenu({ show: false, x: 0, y: 0, id: null, type: null });
                }}
              >
                Cancel
              </button>
              <button 
                className="sprint-btn-primary delete-confirm-danger"
                onClick={confirmDelete}
              >
                <FiTrash2 /> {deleteConfirm.type === 'backlog' ? 'Delete Item' : 'Delete Sprint'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SPRINT MODAL */}
      {showCreateSprint && (
        <div className="sprint-modal-overlay" onClick={() => setShowCreateSprint(false)}>
          <div className="sprint-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sprint-modal-header">
              <h3>Create Sprint</h3>
              <FiX className="sprint-close" onClick={() => setShowCreateSprint(false)} />
            </div>
            <div className="sprint-modal-body">
              <div className="sprint-form-group">
                <label>Sprint Name</label>
                <input id="sprintName" type="text" placeholder="Enter sprint name" onBlur={(e) => setName(e.target.value)}/>
              </div>
              <div className="sprint-form-row">
                <div className="sprint-form-group">
                  <label>Start Date</label>
                  <input id="startDate" type="date" onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="sprint-form-group">
                  <label>End Date</label>
                  <input id="endDate" type="date" onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="sprint-form-group">
                <label>Sprint Goal</label>
                <textarea
  id="sprintGoal"
  placeholder="What is the goal of this sprint?"
  onChange={(e) => setGoal(e.target.value)}
/>

              </div>
            </div>
            <div className="sprint-modal-footer">
              <button className="sprint-btn-secondary" onClick={() => setShowCreateSprint(false)}>
                Cancel
              </button>
              <button className="sprint-btn-primary" onClick={createSprint}>
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR MODAL */}
      {showCalendar && (
        <div className="sprint-modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="calendar-modal-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-header">
              <div className="calendar-nav">
                <button className="calendar-back-btn" onClick={() => setShowCalendar(false)}>
                  <FiChevronLeft /> Back to Planning
                </button>
                <div className="calendar-title">
                  <FiCalendar /> Sprint Calendar ({sprints.length} sprints)
                </div>
              </div>
              <div className="calendar-view-tabs">
                <button className={`calendar-tab ${calendarView === 'month' ? 'active' : ''}`} onClick={() => setCalendarView('month')}>
                  <FiGrid /> Month
                </button>
                <button className={`calendar-tab ${calendarView === 'week' ? 'active' : ''}`} onClick={() => setCalendarView('week')}>
                  <FiSun /> Week
                </button>
                <button className={`calendar-tab ${calendarView === 'day' ? 'active' : ''}`} onClick={() => setCalendarView('day')}>
                  <FiList /> Day
                </button>
              </div>
            </div>
            <div className="calendar-content">
              {sprints.length === 0 ? (
                <div className="calendar-empty">
                  <FiCalendar className="empty-icon" />
                  <h4>No sprints scheduled yet</h4>
                  <p>Create your first sprint to see it here</p>
                </div>
              ) : (
                <div className="calendar-grid">
                  {sprints.map((sprint) => (
                    <div 
                      key={sprint._id} 
                      className={`calendar-day ${sprint.active ? 'active' : ''}`}
                      onContextMenu={(e) => handleContextMenu(e, sprint.id, 'sprint')}
                    >
                      <div className="day-header">{sprint.name}</div>
                      <div className="sprint-event blue">
                        {sprint.startDate.slice(5, 10).replace('-', '/')} - 
                        {sprint.endDate.slice(5, 10).replace('-', '/')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPage;
