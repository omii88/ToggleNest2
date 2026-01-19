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
      role: u.role || "member",
      department: "Engineering",
      lastActive: "Today",
      status: "active"
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

// GET INVITATIONS
exports.getInvitations = async (req, res) => {
  try {
    const invites = await Invitation.find({ accepted: { $ne: true } });
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch invites" });
  }
};

// SEND INVITE (✅ FIXED)
exports.sendInvite = async (req, res) => {
  const { email, role } = req.body;

  try {
    // ✅ Get inviter details
    const inviter = await User.findById(req.user.id).select('name email');
    
    // Check if email already has pending invite
    const existingInvite = await Invitation.findOne({ 
      email, 
      accepted: false 
    });
    if (existingInvite) {
      return res.status(400).json({ message: "Invite already pending for this email" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    const invite = await Invitation.create({
      email,
      role,
      invitedBy: req.user.id,
      invitedByEmail: inviter.email,
      invitedByName: inviter.name,
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      token
    });

    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const acceptLink = `${process.env.BACKEND_URL}/api/team/invite/accept/${token}`;

    const mailOptions = {
      from: `"ToggleNest Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ You're invited to join ToggleNest Team!",
      html: `
        <h2 style="color: #007bff;">Team Invitation</h2>
        <p>Hello,</p>
        <p><strong>${inviter.name || inviter.email}</strong> has invited you to join their team on ToggleNest.</p>
        <p><strong>Role:</strong> ${role}</p>
        <br>
        <a href="${acceptLink}" 
           style="display:inline-block; padding:12px 24px; background:#007bff; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
          Accept Invite
        </a>
        <br><br>
        <p><em>This invite expires in 14 days.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Invite sent successfully", invite });
  } catch (err) {
    console.error("Send invite error:", err);
    res.status(400).json({ message: "Failed to send invite" });
  }
};

// RESEND INVITE (✅ NEW)
exports.resendInvite = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.id);
    
    if (!invite || invite.accepted) {
      return res.status(404).json({ message: "Invite not found or already accepted" });
    }

    const inviter = await User.findById(req.user.id).select('name email');
    
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const acceptLink = `${process.env.BACKEND_URL}/api/team/invite/accept/${invite.token}`;

    const mailOptions = {
      from: `"ToggleNest Team" <${process.env.EMAIL_USER}>`,
      to: invite.email,
      subject: "✅ ToggleNest Team Invite (Resent)",
      html: `
        <h2 style="color: #007bff;">Team Invitation (Resent)</h2>
        <p>Hello,</p>
        <p><strong>${inviter.name || inviter.email}</strong> has re-invited you to join their team.</p>
        <p><strong>Role:</strong> ${invite.role}</p>
        <br>
        <a href="${acceptLink}" 
           style="display:inline-block; padding:12px 24px; background:#007bff; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
          Accept Invite
        </a>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Invite resent successfully" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Failed to resend invite" });
  }
};

// DELETE MEMBER (✅ SECURE)
exports.deleteMember = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Only admin can delete others
    const currentUser = await User.findById(req.user.id);
    if (user._id.toString() !== req.user.id && currentUser.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Delete failed" });
  }
};

// ACCEPT INVITE (HTML)
exports.acceptInviteDirect = async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await Invitation.findOne({ token });

    if (!invite) {
      return res.send(`
        <div style="max-width:500px;margin:100px auto;padding:40px;background:#f8f9fa;border-radius:10px;text-align:center;">
          <h2 style="color:#dc3545;">❌ Invalid Invite</h2>
          <p>This invitation link is not valid.</p>
        </div>
      `);
    }

    if (invite.expires < new Date()) {
      return res.send(`
        <div style="max-width:500px;margin:100px auto;padding:40px;background:#f8f9fa;border-radius:10px;text-align:center;">
          <h2 style="color:#ffc107;">⏰ Invite Expired</h2>
          <p>This invitation has expired. Please request a new one.</p>
        </div>
      `);
    }

    if (invite.accepted) {
      return res.send(`
        <div style="max-width:500px;margin:100px auto;padding:40px;background:#f8f9fa;border-radius:10px;text-align:center;">
          <h2 style="color:#28a745;">✅ Already Accepted</h2>
          <p>You have already accepted this invitation.</p>
        </div>
      `);
    }

    let user = await User.findOne({ email: invite.email });

    if (!user) {
      user = await User.create({
        name: invite.email.split("@")[0],
        email: invite.email,
        password: await require('bcryptjs').hash("changeme123", 10),
        role: invite.role
      });
    }

    invite.accepted = true;
    invite.acceptedBy = user._id;
    await invite.save();

    res.send(`
      <div style="max-width:500px;margin:100px auto;padding:40px;background:#f8f9fa;border-radius:10px;text-align:center;">
        <h2 style="color:#28a745;">🎉 Welcome to the Team!</h2>
        <p>Your account has been created/updated successfully.</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <hr>
        <p><em>Please login at your app to get started.</em></p>
        <p>Temporary password: <code>changeme123</code></p>
      </div>
    `);

  } catch (err) {
    console.error("Invite accept error:", err);
    res.send(`
      <div style="max-width:500px;margin:100px auto;padding:40px;background:#f8f9fa;border-radius:10px;text-align:center;">
        <h2 style="color:#dc3545;">⚠️ Something went wrong</h2>
        <p>Please try again or contact support.</p>
      </div>
    `);
  }
};

// CANCEL INVITE
exports.cancelInvite = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    await invite.deleteOne();
    res.json({ message: "Invite cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel invite" });
  }
};
