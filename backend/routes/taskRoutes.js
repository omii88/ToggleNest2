const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  createTask,
  getMyTasks,
  getTaskCount
} = require("../controllers/taskController");

// Create task
router.post("/", auth, createTask);

// Get logged-in user's tasks
router.get("/my", auth, getMyTasks);

// Get logged-in user's task count (dashboard)
router.get("/count", auth, getTaskCount);

module.exports = router;
