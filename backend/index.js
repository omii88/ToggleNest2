const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

// Parse JSON requests
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://togglenestf2.vercel.app",
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app")
      ) {
        return callback(null, true);
      }
      return callback(null, false); // ❗ DO NOT throw Error
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);




// =========================
// ROUTES
// =========================
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const sprintRoutes = require("./routes/sprintRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // ✅ ADDED

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/dashboard", dashboardRoutes); // ✅ ADDED

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ToggleNest Backend is Live 🚀"
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ msg: "API working 🚀" });
});

// test post route
app.post("/api/test", (req, res) => {
  res.json({ msg: "Test route working" });
});

// =========================
// CONNECT TO MONGODB & START SERVER
// =========================
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (Asynchronously in background)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Start listening immediately to prevent Render / cloud port binding timeout
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
