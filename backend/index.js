const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// 🔴 IMPORT ROUTES PROPERLY
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const sprintRoutes = require("./routes/sprintRoutes");

// routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/sprints", sprintRoutes);

// test route
app.get("/api/test", (req, res) => {
  res.json({ msg: "API working 🚀" });
});

// test post route
app.post("/api/test", (req, res) => {
  res.json({ msg: "Test route working" });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error(err));

  // app.listen(PORT, () => {
  //   console.log(`Server is running on port ${PORT}`);
  // });
