const Workspace = require("../models/Workspace");
const Invitation = require("../models/Invitation");

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
      if (invite.acceptedBy) {
        memberSet.add(invite.acceptedBy.toString());
      }
    });

    // include owner
    memberSet.add(userId);

    const membersCount = memberSet.size;

    res.status(200).json({
      stats: {
        workspaces: workspaceCount,
        teams: teamCount,
        members: membersCount,
        projects: 0,
        sprints: 0,
        boards: 0
      },
      recentActivity: [
        {
          type: "workspace",
          action: "Dashboard accessed",
          time: new Date()
        }
      ],
      sprintChart: {
        completed: 0,
        remaining: 1
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

module.exports = { getDashboardOverview };
