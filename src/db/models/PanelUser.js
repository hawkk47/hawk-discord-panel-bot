const mongoose = require("mongoose");

const PanelUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ["admin", "viewer"], default: "viewer" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PanelUser", PanelUserSchema);
