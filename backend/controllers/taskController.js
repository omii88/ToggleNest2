const Task = require("../models/Task");

/**
  CREATE TASK
  POST /api/tasks
 */
exports.createTask = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { title, description, projectId, dueDate } = req.body;

    // ❗ Assign task to the logged-in user from JWT
    const assignedTo = req.user.id;

    const task = await Task.create({
      title,
      description,
      projectId: projectId || null,
      assignedTo,       // <-- FIXED
      dueDate
    });

    console.log("Created Task:", task);

    res.status(201).json(task);

  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ msg: error.message });
  }
};


/**
 * GET MY TASKS
 * GET /api/tasks/my
 */
exports.getMyTasks = async (req, res) => {
  try {
    console.log("Fetching tasks for user ID:", req.user.id);
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("projectId", "name")
      .sort({ createdAt: -1 });
    console.log("Retrieved Tasks:", tasks);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

/**
 * GET TASK COUNT (FOR DASHBOARD)
 * GET /api/tasks/count
 */
exports.getTaskCount = async (req, res) => {
  try {
    const count = await Task.countDocuments({
      assignedTo: req.user.id
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
