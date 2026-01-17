const express = require("express");
const router = express.Router();

const { getDashboardOverview } = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, getDashboardOverview);

module.exports = router;
