const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
// const { createSprint, getMySprints } = require("../controllers/sprintController");

// CREATE SPRINT
// router.post("/", auth, createSprint);

// GET SPRINTS OF LOGGED-IN USER
router.get("/", auth, getMySprints);

module.exports = router;
