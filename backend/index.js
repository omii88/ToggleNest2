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

// CORS configuration for local dev + Vercel
const allowedOrigins = [
  "http://localhost:5173", // Vite local
  process.env.FRONTEND_URL, // Vercel frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy does not allow access from ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // allow cookies if needed
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

// =========================
// TEST ROUTES
// =========================
app.get("/api/test", (req, res) => {
  res.json({ msg: "API working 🚀" });
});

app.post("/api/test", (req, res) => {
  res.json({ msg: "Test POST route working" });
});

// =========================
// CONNECT TO MONGODB & START SERVER
// =========================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
