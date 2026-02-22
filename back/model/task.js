const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  importance: { type: String, enum: ["Normal", "Important"], default: "Normal" },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", taskSchema);