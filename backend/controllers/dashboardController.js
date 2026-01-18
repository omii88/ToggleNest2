const Workspace = require("../models/Workspace");
const Invitation = require("../models/Invitation");
const Sprint = require("../models/Sprint"); // ✅ Import Sprint model

const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

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

    // 6️⃣ Return the dashboard overview
    res.status(200).json({
      stats: {
        workspaces: workspaceCount,
        teams: teamCount,
        members: membersCount,
        projects: 0,       // keep as 0 for now
        sprints: sprintCount,
        boards: 0          // keep as 0 for now
      },
      recentActivity: [
        {
          type: "workspace",
          action: "Dashboard accessed",
          time: new Date()
        }
      ],
      sprintChart: {
        completed: completedSprints,
        remaining: remainingSprints
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

module.exports = { getDashboardOverview };
