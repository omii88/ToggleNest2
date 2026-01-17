import React, { useState } from "react";
import "../theme/TeamPage.css";
import { FaEdit, FaTrashAlt, FaEllipsisV } from "react-icons/fa";

const TeamPage = () => {
  const [activeTab, setActiveTab] = useState("members"); // "members" or "pending"
  const [members] = useState([]); // Empty data
  const [pendingInvitations] = useState([]); // Empty data

  return (
    <div className="team-page">
      {/* Header */}
      <div className="team-header">
        <div>
          <h2>Team Management</h2>
          <p>Member management and settings</p>
        </div>
        <div className="team-actions">
          <button className="settings-btn">Settings</button>
          <button className="invite-btn">Invite Member</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="team-tabs">
        <button
          className={activeTab === "members" ? "active" : ""}
          onClick={() => setActiveTab("members")}
        >
          Team Members
        </button>
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending Invitations <span className="badge">{pendingInvitations.length}</span>
        </button>
       
      </div>

      {/* Search / Filters */}
      {activeTab === "members" && (
        <div className="team-search">
          <input type="text" placeholder="Search members..." />
          <select>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <button className="bulk-btn">Bulk Actions</button>
        </div>
      )}

      {/* Members Table */}
      {activeTab === "members" && (
        <div className="team-table">
          <div className="table-header">
            <span>Name</span>
            <span>Role</span>
            <span>Department</span>
            <span>Last Active</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="table-body">
            {members.length === 0 ? (
              <p className="no-data">No team members found</p>
            ) : (
              members.map((member, index) => (
                <div className="table-row" key={index}>
                  <div className="member-info">
                    <img src={member.avatar} alt={member.name} />
                    <div>
                      <p>{member.name}</p>
                      <span>{member.email}</span>
                    </div>
                  </div>
                  <span className={`role ${member.role.toLowerCase()}`}>{member.role}</span>
                  <span>{member.department}</span>
                  <span>{member.lastActive}</span>
                  <span className={`status ${member.status.toLowerCase()}`}>{member.status}</span>
                  <div className="actions">
                    <FaEdit />
                    <FaTrashAlt />
                    <FaEllipsisV />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pending Invitations Table */}
      {activeTab === "pending" && (
        <div className="team-table">
          <div className="table-header">
            <span>Email</span>
            <span>Role</span>
            <span>Invited By</span>
            <span>Invited On</span>
            <span>Expires</span>
            <span>Actions</span>
          </div>
          <div className="table-body">
            {pendingInvitations.length === 0 ? (
              <p className="no-data">No pending invitations</p>
            ) : (
              pendingInvitations.map((invite, index) => (
                <div className="table-row" key={index}>
                  <span>{invite.email}</span>
                  <span className={`role ${invite.role.toLowerCase()}`}>{invite.role}</span>
                  <span>{invite.invitedBy}</span>
                  <span>{invite.invitedOn}</span>
                  <span>{invite.expires}</span>
                  <div className="actions">
                    <button className="resend-btn">Resend</button>
                    <button className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default TeamPage;
