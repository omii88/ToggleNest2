const Sprint = require("../models/Sprint");

exports.createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, goal } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ msg: "Start date cannot be after end date" });
    }

    const sprint = await Sprint.create({
      name,
      startDate,
      endDate,
      goal,
      createdBy: req.user.id, // from auth middleware
    });

    res.status(201).json(sprint);
  } catch (error) {
    console.error("Sprint Creation Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getMySprints = async (req, res) => {
  try {
    const sprints = await Sprint.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(sprints);
  } catch (error) {
    console.error("Fetch Sprint Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
