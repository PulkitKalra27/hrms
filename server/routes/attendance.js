const express = require("express")
const router = express.Router()
const Attendance = require("../models/Attendance")
const Employee = require("../models/Employee")
const auth = require("../middleware/auth")

// @route   GET api/attendance
// @desc    Get attendance for a specific date
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { date } = req.query
    const query = {}

    if (date) {
      // Create date range for the selected date (start of day to end of day)
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      query.date = { $gte: startDate, $lte: endDate }
    }

    const attendance = await Attendance.find(query).sort({ date: -1 })
    res.json(attendance)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/attendance/current-employees
// @desc    Get all current employees for attendance
// @access  Private
router.get("/current-employees", auth, async (req, res) => {
  try {
    // Get all employees that are not marked as terminated or inactive
    const employees = await Employee.find().sort({ name: 1 })
    res.json(employees)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/attendance
// @desc    Record attendance
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { employeeId, date, status } = req.body

    // Check if employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Parse date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Check if attendance already exists for this employee on this date
    let attendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })

    if (attendance) {
      // Update existing attendance
      attendance.status = status
      await attendance.save()
    } else {
      // Create new attendance record
      attendance = new Attendance({
        employeeId,
        date: attendanceDate,
        status,
      })

      await attendance.save()
    }

    res.json(attendance)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
