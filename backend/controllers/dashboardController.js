const Workspace = require("../models/Workspace");
const Invitation = require("../models/Invitation");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const Project = require("../models/Project");

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔍 Dashboard request for user:", userId);

    // 1️⃣ Workspaces count
    const workspaceCount = await Workspace.countDocuments({
      owner: userId
    });

    // 2️⃣ Teams count (Invitations sent by user)
    const teamCount = await Invitation.countDocuments({
      invitedBy: userId,
      accepted: true
    });

    // 3️⃣ Members count (unique accepted users)
    const acceptedInvites = await Invitation.find({
      invitedBy: userId,
      accepted: true
    }).select("acceptedBy");

    const memberSet = new Set();
    acceptedInvites.forEach(invite => {
      if (invite.acceptedBy) memberSet.add(invite.acceptedBy.toString());
    });
    // include owner
    memberSet.add(userId);
    const membersCount = memberSet.size;

    // 4️⃣ Sprint count
    const sprintCount = await Sprint.countDocuments({ createdBy: userId });

    // 5️⃣ Sprint completed vs remaining
    const completedSprints = await Sprint.countDocuments({
      createdBy: userId,
      status: "completed"
    });
    const remainingSprints = sprintCount - completedSprints;

    // 6️⃣ Fetch recent tasks and projects
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log("📋 Recent tasks found:", recentTasks.length, recentTasks);

    const recentProjects = await Project.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log("📁 Recent projects found:", recentProjects.length, recentProjects);

    // 7️⃣ Combine and sort by timestamp
    let recentActivity = [];

    recentTasks.forEach(task => {
      recentActivity.push({
        _id: task._id,
        type: "task",
        action: `Created task: ${task.title}`,
        time: task.createdAt,
        itemId: task._id
      });
    });

    recentProjects.forEach(project => {
      recentActivity.push({
        _id: project._id,
        type: "project",
        action: `Created project: ${project.name}`,
        time: project.createdAt,
        itemId: project._id
      });
    });

    // Sort by time (newest first)
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Take only 10 most recent
    recentActivity = recentActivity.slice(0, 10);

    // 8️⃣ Return the dashboard overview
    res.status(200).json({
      stats: {
        workspaces: workspaceCount,
        teams: teamCount,
        members: membersCount,
        projects: await Project.countDocuments({ owner: userId }),
        sprints: sprintCount,
        boards: 0
      },
      recentActivity,
      sprintChart: {
        completed: completedSprints,
        remaining: remainingSprints
      }
    });

  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed", error: err.message });
  }
};

module.exports = { getDashboardOverview };
