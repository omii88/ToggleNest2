const Workspace = require("../models/Workspace");
const Invitation = require("../models/Invitation");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task"); // ✅ Task = Board
const Project = require("../models/Project"); // ✅ Import Project model

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Workspaces count
    const workspaceCount = await Workspace.countDocuments({
      owner: userId,
    });

    // 2️⃣ Teams count (accepted invitations sent by user)
    const teamCount = await Invitation.countDocuments({
      invitedBy: userId,
      accepted: true,
    });

    // 3️⃣ Members count (unique accepted users + owner)
    const acceptedInvites = await Invitation.find({
      invitedBy: userId,
      accepted: true,
    }).select("acceptedBy");

    const memberSet = new Set();
    acceptedInvites.forEach((invite) => {
      if (invite.acceptedBy) {
        memberSet.add(invite.acceptedBy.toString());
      }
    });

    // include owner himself
    memberSet.add(userId);
    const membersCount = memberSet.size;

    // 4️⃣ Project count
    const projectCount = await Project.countDocuments({
      owner: userId,
    });

    // 5️⃣ Sprint count
    const sprintCount = await Sprint.countDocuments({
      createdBy: userId,
    });

    // 6️⃣ Sprint completed vs remaining
    const completedSprints = await Sprint.countDocuments({
      createdBy: userId,
      status: "completed",
    });

    const remainingSprints = sprintCount - completedSprints;

    // 7️⃣ Board count (Tasks per project)
    const boardCount = await Task.distinct("projectId").then((ids) => ids.length);

    // 8️⃣ Response
    res.status(200).json({
      stats: {
        workspaces: workspaceCount,
        teams: teamCount,
        members: membersCount,
        projects: projectCount, // ✅ Updated
        sprints: sprintCount,
        boards: boardCount, // ✅ Task count
      },
      recentActivity: [
        {
          type: "dashboard",
          action: "Dashboard accessed",
          time: new Date(),
        },
      ],
      sprintChart: {
        completed: completedSprints,
        remaining: remainingSprints,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

module.exports = { getDashboardOverview };