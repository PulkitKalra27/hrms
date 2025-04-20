const mongoose = require("mongoose")

const AttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index to ensure one attendance record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Attendance", AttendanceSchema)
