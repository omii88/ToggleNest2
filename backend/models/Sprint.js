const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    goal: { type: String, default: "" },

    // Link sprint to user/workspace
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["active", "completed", "upcoming"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);
