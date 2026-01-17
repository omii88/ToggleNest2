const User = require("../models/User");
const Invitation = require("../models/Invitation");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// GET TEAM MEMBERS
exports.getMembers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    const formatted = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: "Engineering",
      lastActive: "Today",
      status: "active"
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

// GET INVITATIONS
// GET INVITATIONS (ONLY PENDING)
exports.getInvitations = async (req, res) => {
  try {
    const invites = await Invitation.find({ accepted: { $ne: true } });
    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch invites" });
  }
};


// SEND INVITE
exports.sendInvite = async (req, res) => {
  const { email, role } = req.body;

  try {
    // Generate token
    const token = crypto.randomBytes(20).toString("hex");

    // Create invite in DB
    const invite = await Invitation.create({
      email,
      role,
      invitedBy: req.user.id,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      token
    });

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: `"ToggleNest Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You are invited to join a team!",
      html: `
        <p>Hello,</p>
        <p>${req.user.email} has invited you to join their team on ToggleNest.</p>
        <p>Role: <b>${role}</b></p>
        <p>Click the button below to accept the invite:</p>
        <a href="${process.env.BACKEND_URL}/api/team/invite/accept/${token}" 
           style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
           Accept Invite
        </a>
        <p>This invite will expire in 14 days.</p>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(201).json(invite);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invite failed" });
  }
};

// DELETE MEMBER
exports.deleteMember = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch {
    res.status(400).json({ message: "Delete failed" });
  }
};

// GET INVITE BY TOKEN
exports.getInviteByToken = async (req, res) => {
  const { token } = req.params;
  try {
    const invite = await Invitation.findOne({ token });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.expires < new Date()) return res.status(400).json({ message: "Invite expired" });
    if (invite.accepted) return res.status(400).json({ message: "Invite already accepted" });

    res.json(invite);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch invite" });
  }
};

// ACCEPT INVITE
exports.acceptInvite = async (req, res) => {
  const { token } = req.params;
  try {
    const invite = await Invitation.findOne({ token });
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    if (invite.expires < new Date()) return res.status(400).json({ message: "Invite expired" });
    if (invite.accepted) return res.status(400).json({ message: "Invite already accepted" });

    // Create user automatically
    const user = await User.create({
      name: invite.email.split("@")[0],
      email: invite.email,
      password: "changeme123", // user should reset later
      role: invite.role
    });

    invite.accepted = true;
    invite.acceptedBy = user._id;
    await invite.save();

    res.json({ message: "Invite accepted", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept invite" });
  }
};
exports.acceptInviteDirect = async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await Invitation.findOne({ token });

    if (!invite) {
      return res.send("<h2>❌ Invalid invite</h2>");
    }

    if (invite.expires < new Date()) {
      return res.send("<h2>⏰ Invite expired</h2>");
    }

    if (invite.accepted) {
      return res.send("<h2>✅ Invite already accepted</h2>");
    }

    const user = await User.create({
      name: invite.email.split("@")[0],
      email: invite.email,
      password: "changeme123",
      role: invite.role
    });

    invite.accepted = true;
    invite.acceptedBy = user._id;
    await invite.save();

    return res.send(`
      <h2>🎉 Invite Accepted!</h2>
      <p>You are now part of the team.</p>
      <p>You can close this page.</p>
    `);

  } catch (err) {
    console.error(err);
    res.send("<h2>⚠️ Something went wrong</h2>");
  }
};
